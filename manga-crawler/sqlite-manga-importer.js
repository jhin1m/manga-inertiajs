#!/usr/bin/env node

require('dotenv').config({ path: '../.env' });
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

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
    
    // Initialize S3 uploader
    const S3ImageUploader = require('./s3-uploader');
    this.s3Uploader = new S3ImageUploader();

    // Statistics
    this.stats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      coversUploaded: 0
    };

    // Batch processing configuration
    this.batchSize = 50;
    this.termCache = new Map(); // Cache for taxonomy terms
    this.taxonomyCache = new Map(); // Cache for taxonomies
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
   * Preload all taxonomies into cache
   */
  async preloadTaxonomies() {
    const [rows] = await this.mysqlDb.execute('SELECT id, type, slug FROM taxonomies');
    for (const row of rows) {
      this.taxonomyCache.set(row.type, row.id);
    }
    console.log(`📋 Preloaded ${rows.length} taxonomies`);
  }

  /**
   * Preload all taxonomy terms into cache
   */
  async preloadTaxonomyTerms() {
    const [rows] = await this.mysqlDb.execute('SELECT id, taxonomy_id, name, slug FROM taxonomy_terms');
    for (const row of rows) {
      const cacheKey = `${row.taxonomy_id}-${row.name}`;
      this.termCache.set(cacheKey, row.id);
    }
    console.log(`📋 Preloaded ${rows.length} taxonomy terms`);
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
      
      // Initialize S3 uploader database connection
      await this.s3Uploader.connectDatabase();
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
   * Get or create taxonomy by type (with caching)
   */
  async getOrCreateTaxonomy(type) {
    // Check cache first
    if (this.taxonomyCache.has(type)) {
      return this.taxonomyCache.get(type);
    }
    
    const slug = type === 'genre' ? 'genre' : type;
    const [rows] = await this.mysqlDb.execute(
      'SELECT id FROM taxonomies WHERE slug = ?',
      [slug]
    );
    
    if (rows.length > 0) {
      this.taxonomyCache.set(type, rows[0].id);
      return rows[0].id;
    }
    
    // Create taxonomy if it doesn't exist
    const [result] = await this.mysqlDb.execute(
      'INSERT INTO taxonomies (name, slug, type, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [type.charAt(0).toUpperCase() + type.slice(1), slug, type]
    );
    
    console.log(`📝 Created taxonomy: ${type}`);
    this.taxonomyCache.set(type, result.insertId);
    return result.insertId;
  }

  /**
   * Get or create taxonomy term with caching
   */
  async getOrCreateTaxonomyTerm(taxonomyId, name) {
    const cacheKey = `${taxonomyId}-${name}`;
    
    // Check cache first
    if (this.termCache.has(cacheKey)) {
      return this.termCache.get(cacheKey);
    }
    
    const [rows] = await this.mysqlDb.execute(
      'SELECT id FROM taxonomy_terms WHERE taxonomy_id = ? AND name = ?',
      [taxonomyId, name]
    );
    
    if (rows.length > 0) {
      this.termCache.set(cacheKey, rows[0].id);
      return rows[0].id;
    }
    
    // Use Utils.createSlug for proper Japanese text handling
    const slug = await Utils.createSlug(name);
    
    // Create term if it doesn't exist
    const [result] = await this.mysqlDb.execute(
      'INSERT INTO taxonomy_terms (taxonomy_id, name, slug, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [taxonomyId, name, slug]
    );
    
    this.termCache.set(cacheKey, result.insertId);
    return result.insertId;
  }

  /**
   * Batch create taxonomy terms for better performance
   */
  async batchCreateTaxonomyTerms(taxonomyId, names) {
    const newTerms = [];
    const existingTermIds = [];
    
    // Check which terms already exist
    for (const name of names) {
      const cacheKey = `${taxonomyId}-${name}`;
      if (this.termCache.has(cacheKey)) {
        existingTermIds.push(this.termCache.get(cacheKey));
      } else {
        newTerms.push(name);
      }
    }
    
    if (newTerms.length === 0) {
      return existingTermIds;
    }
    
    // Check database for existing terms
    const placeholders = newTerms.map(() => '?').join(',');
    const [rows] = await this.mysqlDb.execute(
      `SELECT id, name FROM taxonomy_terms WHERE taxonomy_id = ? AND name IN (${placeholders})`,
      [taxonomyId, ...newTerms]
    );
    
    // Add found terms to cache and result
    for (const row of rows) {
      const cacheKey = `${taxonomyId}-${row.name}`;
      this.termCache.set(cacheKey, row.id);
      existingTermIds.push(row.id);
    }
    
    // Create remaining terms
    const foundNames = rows.map(row => row.name);
    const termsToCreate = newTerms.filter(name => !foundNames.includes(name));
    
    if (termsToCreate.length > 0) {
      const values = [];
      const placeholders = [];
      
      for (const name of termsToCreate) {
        const slug = await Utils.createSlug(name);
        values.push(taxonomyId, name, slug);
        placeholders.push('(?, ?, ?, NOW(), NOW())');
      }
      
      const query = `INSERT INTO taxonomy_terms (taxonomy_id, name, slug, created_at, updated_at) VALUES ${placeholders.join(', ')}`;
      const [result] = await this.mysqlDb.execute(query, values);
      
      // Add new terms to cache
      let insertId = result.insertId;
      for (const name of termsToCreate) {
        const cacheKey = `${taxonomyId}-${name}`;
        this.termCache.set(cacheKey, insertId);
        existingTermIds.push(insertId);
        insertId++;
      }
      
      console.log(`📝 Batch created ${termsToCreate.length} taxonomy terms`);
    }
    
    return existingTermIds;
  }

  /**
   * Link manga to taxonomy terms with batch processing
   */
  async linkMangaToTaxonomyTerms(mangaId, termIds) {
    if (termIds.length === 0) return;
    
    // Check existing relationships
    const placeholders = termIds.map(() => '?').join(',');
    const [existing] = await this.mysqlDb.execute(
      `SELECT taxonomy_term_id FROM manga_taxonomy_terms WHERE manga_id = ? AND taxonomy_term_id IN (${placeholders})`,
      [mangaId, ...termIds]
    );
    
    const existingTermIds = existing.map(row => row.taxonomy_term_id);
    const newTermIds = termIds.filter(termId => !existingTermIds.includes(termId));
    
    if (newTermIds.length > 0) {
      const values = [];
      const placeholderGroups = [];
      
      for (const termId of newTermIds) {
        values.push(mangaId, termId);
        placeholderGroups.push('(?, ?, NOW(), NOW())');
      }
      
      const query = `INSERT INTO manga_taxonomy_terms (manga_id, taxonomy_term_id, created_at, updated_at) VALUES ${placeholderGroups.join(', ')}`;
      await this.mysqlDb.execute(query, values);
      
      console.log(`🔗 Batch linked ${newTermIds.length} taxonomy terms`);
    }
  }

  /**
   * Upload cover image using s3-uploader module
   */
  async uploadCoverToS3(coverUrl, mangaSlug) {
    if (!coverUrl) return null;
    
    try {
      console.log(`🖼️  Processing cover upload for: ${mangaSlug}`);
      
      // Download image
      const imageData = await this.s3Uploader.downloadImage(coverUrl);
      
      // Determine file extension
      const extension = imageData.contentType.includes('png') ? '.png' : '.jpg';
      
      // Generate S3 key using AWS_PATH + manga slug + extension format
      const awsPath = process.env.AWS_PATH || 'data/';
      const s3Key = `${awsPath}/${mangaSlug}${extension}`;
      
      // Upload to S3
      const s3Url = await this.s3Uploader.uploadToS3(imageData, s3Key);
      
      // Return the path for database storage (AWS_URL + AWS_PATH + manga slug + extension)
      const awsUrl = process.env.AWS_URL || config.images.s3.baseUrl;
      const fullPath = `${awsPath}/${mangaSlug}${extension}`;
      
      this.stats.coversUploaded++;
      console.log(`✅ Cover uploaded: ${s3Url}`);
      
      return fullPath; // Return path for database storage
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
      
      // Batch create taxonomy terms and collect their IDs
      const termIds = [];
      
      // Process genres in batch
      if (genres.length > 0) {
        const genreTermIds = await this.batchCreateTaxonomyTerms(genreTaxonomyId, genres);
        termIds.push(...genreTermIds);
      }
      
      // Process authors in batch
      if (authors.length > 0) {
        const authorTermIds = await this.batchCreateTaxonomyTerms(authorTaxonomyId, authors);
        termIds.push(...authorTermIds);
      }
      
      // Process artists in batch
      if (artists.length > 0) {
        const artistTermIds = await this.batchCreateTaxonomyTerms(artistTaxonomyId, artists);
        termIds.push(...artistTermIds);
      }
      
      // Process year
      if (year && yearTaxonomyId) {
        const yearTermIds = await this.batchCreateTaxonomyTerms(yearTaxonomyId, [year.toString()]);
        termIds.push(...yearTermIds);
      }
      
      // Link manga to taxonomy terms in batch
      if (termIds.length > 0) {
        await this.linkMangaToTaxonomyTerms(manga.id, termIds);
        console.log(`🔗 Linked ${termIds.length} taxonomy terms`);
      }
      
      // Handle cover upload if needed
      if (!manga.cover && sqliteData.cover_small) {
        const coverPath = await this.uploadCoverToS3(sqliteData.cover_small, manga.slug);
        if (coverPath) {
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
      
      // Preload caches for better performance
      console.log('📋 Preloading caches...');
      await this.preloadTaxonomies();
      await this.preloadTaxonomyTerms();
      
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
          await this.sleep(500); // Reduced delay due to batch optimizations
        }
        
        this.printStats();
        
        // Shorter delay between batches due to optimizations
        if (i + batchSize < totalToProcess) {
          console.log('⏳ Waiting 2 seconds before next batch...');
          await this.sleep(2000);
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