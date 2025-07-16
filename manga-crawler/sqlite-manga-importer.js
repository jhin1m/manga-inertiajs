#!/usr/bin/env node

require('dotenv').config({ path: '../.env' });
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Import configurations
const config = require('./config');
const Utils = require('./utils');

class SQLiteMangaImporter {
  constructor(sqlitePath) {
    this.sqlitePath = sqlitePath;
    this.sqliteDb = null;
    this.mysqlDb = null;
    
    // Load genre mapping
    this.genreMapping = this.loadGenreMapping();
    
    // Initialize S3 client
    this.s3 = new AWS.S3({
      accessKeyId: config.images.s3.accessKeyId,
      secretAccessKey: config.images.s3.secretAccessKey,
      region: config.images.s3.region,
      endpoint: config.images.s3.endpoint,
      s3ForcePathStyle: config.images.s3.forcePathStyle
    });

    // Statistics
    this.stats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      coversUploaded: 0
    };

    // Load proxies for image downloads
    this.proxies = this.loadProxies();
    this.currentProxyIndex = 0;
  }

  /**
   * Load genre mapping from genres.json
   */
  loadGenreMapping() {
    try {
      const genresData = JSON.parse(fs.readFileSync(path.join(__dirname, 'genres.json'), 'utf8'));
      const mapping = new Map();
      
      genresData.forEach(genre => {
        // Map both Japanese and English names to the genre object
        mapping.set(genre.genre, genre);
        mapping.set(genre.genre_en, genre);
        mapping.set(genre.genre_en.toLowerCase(), genre);
      });
      
      console.log(`📚 Loaded ${genresData.length} genre mappings`);
      return mapping;
    } catch (error) {
      console.error('❌ Error loading genre mapping:', error.message);
      return new Map();
    }
  }

  /**
   * Load proxy list from proxies.txt
   */
  loadProxies() {
    try {
      const proxyFile = path.join(__dirname, 'proxies.txt');
      if (!fs.existsSync(proxyFile)) {
        console.log('⚠️  No proxies.txt found, proceeding without proxy');
        return [];
      }

      const content = fs.readFileSync(proxyFile, 'utf8');
      const proxies = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [host, port, username, password] = line.trim().split(':');
          return { host, port: parseInt(port), username, password };
        });

      console.log(`📡 Loaded ${proxies.length} proxies`);
      return proxies;
    } catch (error) {
      console.error('❌ Error loading proxies:', error.message);
      return [];
    }
  }

  /**
   * Get next proxy in rotation
   */
  getNextProxy() {
    if (this.proxies.length === 0) return null;
    
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }

  /**
   * Create axios instance with proxy support
   */
  createAxiosInstance(proxy = null) {
    const axiosConfig = {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    if (proxy) {
      const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
      axiosConfig.httpAgent = new HttpsProxyAgent(proxyUrl);
    }

    return axios.create(axiosConfig);
  }

  /**
   * Connect to databases
   */
  async connect() {
    try {
      // Connect to SQLite
      this.sqliteDb = new sqlite3.Database(this.sqlitePath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          console.error('❌ SQLite connection failed:', err.message);
          throw err;
        }
        console.log('✅ Connected to SQLite database');
      });

      // Connect to MySQL
      this.mysqlDb = await mysql.createConnection(config.database);
      console.log('✅ Connected to MySQL database');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect from databases
   */
  async disconnect() {
    if (this.sqliteDb) {
      this.sqliteDb.close();
      console.log('📡 SQLite connection closed');
    }
    
    if (this.mysqlDb) {
      await this.mysqlDb.end();
      console.log('📡 MySQL connection closed');
    }
  }

  /**
   * Get all manga from Laravel database
   */
  async getAllMangaFromLaravel() {
    const query = 'SELECT id, name, cover, slug FROM mangas ORDER BY id ASC';
    const [rows] = await this.mysqlDb.execute(query);
    return rows;
  }

  /**
   * Search SQLite database for manga by name
   */
  async searchSQLiteForManga(mangaName) {
    return new Promise((resolve, reject) => {
      const searchTerm = `%${mangaName}%`;
      const query = `
        SELECT * FROM "series" 
        WHERE (
          ("title" LIKE ?) OR 
          ("native_title" LIKE ?) OR 
          ("romanized_title" LIKE ?) OR 
          ("secondary_titles_en" LIKE ?) OR 
          ("link" LIKE ?) OR
          ("authors" LIKE ?) OR 
          ("artists" LIKE ?)
        ) 
        ORDER BY 
          CASE 
            WHEN "title" = ? THEN 1
            WHEN "native_title" = ? THEN 2
            WHEN "romanized_title" = ? THEN 3
            ELSE 4
          END
        LIMIT 1
      `;
      
      this.sqliteDb.get(query, [
        searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
        mangaName, mangaName, mangaName
      ], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Parse genres from SQLite data
   */
  parseGenres(genresString) {
    if (!genresString) return [];
    
    try {
      // Handle both array and comma-separated string formats
      let genres = [];
      if (genresString.startsWith('[')) {
        genres = JSON.parse(genresString);
      } else {
        genres = genresString.split(',').map(g => g.trim());
      }
      
      return genres.map(genre => {
        const mapped = this.genreMapping.get(genre) || this.genreMapping.get(genre.toLowerCase());
        return mapped ? mapped.genre : genre;
      }).filter(Boolean);
    } catch (error) {
      console.warn(`⚠️  Failed to parse genres: ${genresString}`);
      return [];
    }
  }

  /**
   * Parse authors/artists from SQLite data
   */
  parseAuthorsArtists(dataString) {
    if (!dataString) return [];
    
    try {
      let items = [];
      if (dataString.startsWith('[')) {
        items = JSON.parse(dataString);
      } else {
        items = dataString.split(',').map(item => item.trim());
      }
      
      return items.filter(Boolean);
    } catch (error) {
      console.warn(`⚠️  Failed to parse authors/artists: ${dataString}`);
      return [];
    }
  }

  /**
   * Get or create taxonomy by type
   */
  async getOrCreateTaxonomy(type) {
    const slug = type === 'genre' ? 'genre' : type;
    const [rows] = await this.mysqlDb.execute(
      'SELECT id FROM taxonomies WHERE slug = ?',
      [slug]
    );
    
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // Create taxonomy if it doesn't exist
    const [result] = await this.mysqlDb.execute(
      'INSERT INTO taxonomies (name, slug, type, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [type.charAt(0).toUpperCase() + type.slice(1), slug, type]
    );
    
    console.log(`📝 Created taxonomy: ${type}`);
    return result.insertId;
  }

  /**
   * Get or create taxonomy term
   */
  async getOrCreateTaxonomyTerm(taxonomyId, name) {
    // Use Utils.createSlug for proper Japanese text handling
    const slug = await Utils.createSlug(name);
    
    const [rows] = await this.mysqlDb.execute(
      'SELECT id FROM taxonomy_terms WHERE taxonomy_id = ? AND name = ?',
      [taxonomyId, name]
    );
    
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // Create term if it doesn't exist
    const [result] = await this.mysqlDb.execute(
      'INSERT INTO taxonomy_terms (taxonomy_id, name, slug, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [taxonomyId, name, slug]
    );
    
    return result.insertId;
  }

  /**
   * Link manga to taxonomy terms
   */
  async linkMangaToTaxonomyTerms(mangaId, termIds) {
    for (const termId of termIds) {
      // Check if relationship already exists
      const [existing] = await this.mysqlDb.execute(
        'SELECT 1 FROM manga_taxonomy_terms WHERE manga_id = ? AND taxonomy_term_id = ?',
        [mangaId, termId]
      );
      
      if (existing.length === 0) {
        await this.mysqlDb.execute(
          'INSERT INTO manga_taxonomy_terms (manga_id, taxonomy_term_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          [mangaId, termId]
        );
      }
    }
  }

  /**
   * Download and upload cover image to S3
   */
  async uploadCoverToS3(coverUrl, mangaSlug) {
    if (!coverUrl) return null;
    
    try {
      const proxy = this.getNextProxy();
      const axiosInstance = this.createAxiosInstance(proxy);
      
      console.log(`🖼️  Downloading cover: ${coverUrl}`);
      const response = await axiosInstance.get(coverUrl, {
        responseType: 'arraybuffer',
        maxRedirects: 5
      });
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const extension = contentType.includes('png') ? '.png' : '.jpg';
      const s3Key = `${config.images.s3.keyPrefix}manga/${mangaSlug}/cover${extension}`;
      
      const uploadParams = {
        Bucket: config.images.s3.bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
        ACL: config.images.s3.acl,
        CacheControl: 'max-age=31536000'
      };
      
      console.log(`⬆️  Uploading to S3: ${s3Key}`);
      await this.s3.upload(uploadParams).promise();
      
      const s3Url = `${config.images.s3.baseUrl}/${s3Key}`;
      this.stats.coversUploaded++;
      
      return s3Url;
    } catch (error) {
      console.error(`❌ Cover upload failed for ${mangaSlug}:`, error.message);
      return null;
    }
  }

  /**
   * Process a single manga
   */
  async processManga(manga) {
    try {
      console.log(`\n📖 Processing: ${manga.name} (ID: ${manga.id})`);
      
      // Search SQLite for matching manga
      const sqliteData = await this.searchSQLiteForManga(manga.name);
      
      if (!sqliteData) {
        console.log(`⚠️  No match found in SQLite for: ${manga.name}`);
        this.stats.skipped++;
        return;
      }
      
      console.log(`✅ Found match: ${sqliteData.title || sqliteData.native_title}`);
      
      // Parse data from SQLite
      const genres = this.parseGenres(sqliteData.genres);
      const authors = this.parseAuthorsArtists(sqliteData.authors);
      const artists = this.parseAuthorsArtists(sqliteData.artists);
      const year = sqliteData.year ? parseInt(sqliteData.year) : null;
      const type = sqliteData.type || null;
      
      // Get taxonomy IDs
      const genreTaxonomyId = await this.getOrCreateTaxonomy('genre');
      const authorTaxonomyId = await this.getOrCreateTaxonomy('author');
      const artistTaxonomyId = await this.getOrCreateTaxonomy('artist');
      const yearTaxonomyId = year ? await this.getOrCreateTaxonomy('year') : null;
      
      // Create taxonomy terms and collect their IDs
      const termIds = [];
      
      // Process genres
      for (const genre of genres) {
        const termId = await this.getOrCreateTaxonomyTerm(genreTaxonomyId, genre);
        termIds.push(termId);
      }
      
      // Process authors
      for (const author of authors) {
        const termId = await this.getOrCreateTaxonomyTerm(authorTaxonomyId, author);
        termIds.push(termId);
      }
      
      // Process artists
      for (const artist of artists) {
        const termId = await this.getOrCreateTaxonomyTerm(artistTaxonomyId, artist);
        termIds.push(termId);
      }
      
      // Process year
      if (year && yearTaxonomyId) {
        const termId = await this.getOrCreateTaxonomyTerm(yearTaxonomyId, year.toString());
        termIds.push(termId);
      }
      
      // Link manga to taxonomy terms
      if (termIds.length > 0) {
        await this.linkMangaToTaxonomyTerms(manga.id, termIds);
        console.log(`🔗 Linked ${termIds.length} taxonomy terms`);
      }
      
      // Handle cover upload if needed
      if (!manga.cover && sqliteData.cover_raw) {
        const s3Url = await this.uploadCoverToS3(sqliteData.cover_raw, manga.slug);
        if (s3Url) {
          // Extract just the path from the S3 URL for storage
          const coverPath = s3Url.replace(config.images.s3.baseUrl + '/', '');
          await this.mysqlDb.execute(
            'UPDATE mangas SET cover = ? WHERE id = ?',
            [coverPath, manga.id]
          );
          console.log(`🖼️  Updated cover: ${coverPath}`);
        }
      }
      
      this.stats.successful++;
      console.log(`✅ Successfully processed: ${manga.name}`);
      
    } catch (error) {
      this.stats.failed++;
      console.error(`❌ Failed to process ${manga.name}:`, error.message);
    }
  }

  /**
   * Print statistics
   */
  printStats() {
    console.log('\n📊 Import Statistics:');
    console.log(`Total processed: ${this.stats.totalProcessed}`);
    console.log(`Successful: ${this.stats.successful}`);
    console.log(`Failed: ${this.stats.failed}`);
    console.log(`Skipped: ${this.stats.skipped}`);
    console.log(`Covers uploaded: ${this.stats.coversUploaded}`);
    if (this.stats.totalProcessed > 0) {
      console.log(`Success rate: ${((this.stats.successful / this.stats.totalProcessed) * 100).toFixed(2)}%`);
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main import process
   */
  async import(batchSize = 10, maxManga = null) {
    try {
      await this.connect();
      
      console.log('🚀 Starting SQLite manga import process...');
      
      // Get all manga from Laravel database
      const allManga = await this.getAllMangaFromLaravel();
      console.log(`📚 Found ${allManga.length} manga in Laravel database`);
      
      const totalToProcess = maxManga ? Math.min(allManga.length, maxManga) : allManga.length;
      this.stats.totalProcessed = totalToProcess;
      
      // Process in batches
      for (let i = 0; i < totalToProcess; i += batchSize) {
        const batch = allManga.slice(i, i + batchSize);
        console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}: manga ${i + 1} to ${Math.min(i + batchSize, totalToProcess)}`);
        
        // Process batch sequentially to avoid overwhelming the databases
        for (const manga of batch) {
          await this.processManga(manga);
          await this.sleep(1000); // 1 second delay between manga
        }
        
        this.printStats();
        
        // Longer delay between batches
        if (i + batchSize < totalToProcess) {
          console.log('⏳ Waiting 5 seconds before next batch...');
          await this.sleep(5000);
        }
      }
      
      console.log('\n🎉 Import process completed!');
      this.printStats();
      
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node sqlite-manga-importer.js <sqlite_path> [batch_size] [max_manga]');
    console.log('Example: node sqlite-manga-importer.js ./manga-data.db 10 100');
    process.exit(1);
  }
  
  const sqlitePath = args[0];
  const batchSize = parseInt(args[1]) || 10;
  const maxManga = args[2] ? parseInt(args[2]) : null;
  
  // Check if SQLite file exists
  if (!fs.existsSync(sqlitePath)) {
    console.error(`❌ SQLite file not found: ${sqlitePath}`);
    process.exit(1);
  }
  
  console.log('🔧 SQLite Manga Importer Configuration:');
  console.log(`SQLite path: ${sqlitePath}`);
  console.log(`Batch size: ${batchSize}`);
  console.log(`Max manga: ${maxManga || 'unlimited'}`);
  
  const importer = new SQLiteMangaImporter(sqlitePath);
  
  importer.import(batchSize, maxManga)
    .then(() => {
      console.log('✅ Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error.message);
      process.exit(1);
    });
}

module.exports = SQLiteMangaImporter;