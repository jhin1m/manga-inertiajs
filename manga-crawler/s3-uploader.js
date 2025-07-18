#!/usr/bin/env node

require('dotenv').config({ path: '../.env' });
const AWS = require('aws-sdk');
const axios = require('axios');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Import configurations
const config = require('./config');

class S3ImageUploader {
  constructor() {
    // Initialize S3 client
    this.s3 = new AWS.S3({
      accessKeyId: config.images.s3.accessKeyId,
      secretAccessKey: config.images.s3.secretAccessKey,
      region: config.images.s3.region,
      endpoint: config.images.s3.endpoint,
      s3ForcePathStyle: config.images.s3.forcePathStyle
    });

    // Database connection
    this.dbConfig = config.database;
    this.db = null;

    // Load proxies
    this.proxies = this.loadProxies();
    this.currentProxyIndex = 0;

    // Rate limiting and retry settings
    this.uploadDelay = 2000; // 2 seconds between uploads
    this.requestTimeout = 30000; // 30 seconds timeout
    this.maxRetries = 3;
    this.concurrency = 3; // Process 3 images at once

    // Statistics
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0
    };
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
    const config = {
      timeout: this.requestTimeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    if (proxy) {
      const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
      config.httpsAgent = new HttpsProxyAgent(proxyUrl);
      config.httpAgent = new HttpsProxyAgent(proxyUrl);
    }

    return axios.create(config);
  }

  /**
   * Connect to database
   */
  async connectDatabase() {
    try {
      this.db = await mysql.createConnection(this.dbConfig);
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Get pages that need S3 upload (have image_url but no image_url_2)
   */
  async getPagesToUpload(limit = 100, offset = 0) {
    // Sử dụng query() thay vì execute() để tránh lỗi prepared statement
    const query = `
      SELECT 
        p.id, 
        p.chapter_id, 
        p.image_url, 
        p.page_number,
        c.slug as chapter_slug,
        m.slug as manga_slug
      FROM pages p
      JOIN chapters c ON p.chapter_id = c.id
      JOIN mangas m ON c.manga_id = m.id
      WHERE p.image_url IS NOT NULL 
        AND p.image_url != '' 
        AND (p.image_url_2 IS NULL OR p.image_url_2 = '')
      ORDER BY p.id ASC
      LIMIT ${mysql.escape(limit)} OFFSET ${mysql.escape(offset)}
    `;
    
    const [rows] = await this.db.query(query);
    return rows;
  }

  /**
   * Download image from URL with proxy support
   */
  async downloadImage(imageUrl, retryCount = 0) {
    const proxy = this.getNextProxy();
    const axiosInstance = this.createAxiosInstance(proxy);

    try {
      console.log(`🔄 Downloading: ${imageUrl}${proxy ? ` (via ${proxy.host})` : ''}`);
      
      const response = await axiosInstance.get(imageUrl, {
        responseType: 'arraybuffer',
        maxRedirects: 5
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = Buffer.from(response.data);
      
      // Validate image size
      if (buffer.length > config.images.maxFileSize) {
        throw new Error(`Image too large: ${buffer.length} bytes`);
      }

      // Validate content type
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      return {
        buffer,
        contentType,
        size: buffer.length
      };

    } catch (error) {
      console.error(`❌ Download failed (attempt ${retryCount + 1}): ${error.message}`);
      
      if (retryCount < this.maxRetries) {
        await this.sleep(2000 * (retryCount + 1)); // Exponential backoff
        return this.downloadImage(imageUrl, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Upload image to S3
   */
  async uploadToS3(imageData, key) {
    try {
      const uploadParams = {
        Bucket: config.images.s3.bucket,
        Key: key,
        Body: imageData.buffer,
        ContentType: imageData.contentType,
        ACL: config.images.s3.acl,
        CacheControl: 'max-age=31536000' // 1 year cache
      };

      console.log(`⬆️  Uploading to S3: ${key}`);
      const result = await this.s3.upload(uploadParams).promise();
      
      // Use custom base URL instead of the raw S3 Location
      const customUrl = `${config.images.s3.baseUrl}/${key}`;
      
      return customUrl;
    } catch (error) {
      console.error(`❌ S3 upload failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate S3 key for image
   */
  generateS3Key(page) {
    const urlPath = new URL(page.image_url).pathname;
    const extension = path.extname(urlPath) || '.jpg';
    
    return `${config.images.s3.keyPrefix}manga/${page.manga_slug}/chapter/${page.chapter_slug}/page-${page.page_number}${extension}`;
  }

  /**
   * Update page with S3 URL
   */
  async updatePageS3Url(pageId, s3Url) {
    // Sử dụng query() với escape để tránh lỗi prepared statement
    const query = `UPDATE pages SET image_url_2 = ${mysql.escape(s3Url)} WHERE id = ${mysql.escape(pageId)}`;
    await this.db.query(query);
  }

  /**
   * Process single page image
   */
  async processPage(page) {
    try {
      console.log(`\n📄 Processing page ${page.id} (Chapter ${page.chapter_id})`);
      
      // Download image
      const imageData = await this.downloadImage(page.image_url);
      
      // Generate S3 key
      const s3Key = this.generateS3Key(page);
      
      // Upload to S3
      const s3Url = await this.uploadToS3(imageData, s3Key);
      
      // Update database
      await this.updatePageS3Url(page.id, s3Url);
      
      this.stats.successful++;
      console.log(`✅ Success: ${s3Url}`);
      
      return { success: true, s3Url };
      
    } catch (error) {
      this.stats.failed++;
      console.error(`❌ Failed to process page ${page.id}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process pages in batches
   */
  async processBatch(pages) {
    const promises = pages.map(async (page) => {
      const result = await this.processPage(page);
      
      // Rate limiting delay
      await this.sleep(this.uploadDelay);
      
      return { page, result };
    });

    return Promise.all(promises);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Print progress statistics
   */
  printStats() {
    console.log('\n📊 Upload Statistics:');
    console.log(`Total processed: ${this.stats.total}`);
    console.log(`Successful: ${this.stats.successful}`);
    console.log(`Failed: ${this.stats.failed}`);
    console.log(`Skipped: ${this.stats.skipped}`);
    console.log(`Success rate: ${((this.stats.successful / this.stats.total) * 100).toFixed(2)}%`);
  }

  /**
   * Main upload process
   */
  async uploadImages(batchSize = 100, maxPages = null) {
    try {
      await this.connectDatabase();
      
      let offset = 0;
      let totalProcessed = 0;
      
      console.log('🚀 Starting S3 image upload process...');
      
      while (true) {
        // Get batch of pages to process
        const pages = await this.getPagesToUpload(batchSize, offset);
        
        if (pages.length === 0) {
          console.log('✅ No more pages to process');
          break;
        }

        console.log(`\n📦 Processing batch: ${offset + 1} to ${offset + pages.length}`);
        
        // Process pages in smaller concurrent groups
        const chunkSize = this.concurrency;
        for (let i = 0; i < pages.length; i += chunkSize) {
          const chunk = pages.slice(i, i + chunkSize);
          await this.processBatch(chunk);
        }
        
        this.stats.total += pages.length;
        totalProcessed += pages.length;
        offset += pages.length;

        this.printStats();
        
        // Check max pages limit
        if (maxPages && totalProcessed >= maxPages) {
          console.log(`🏁 Reached maximum pages limit: ${maxPages}`);
          break;
        }

        // Batch delay to prevent overwhelming the server
        await this.sleep(5000);
      }
      
      console.log('\n🎉 Upload process completed!');
      this.printStats();
      
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      throw error;
    } finally {
      if (this.db) {
        await this.db.end();
        console.log('📡 Database connection closed');
      }
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const batchSize = parseInt(args[0]) || 50;
  const maxPages = args[1] ? parseInt(args[1]) : null;

  console.log('🔧 S3 Image Uploader Configuration:');
  console.log(`Batch size: ${batchSize}`);
  console.log(`Max pages: ${maxPages || 'unlimited'}`);
  console.log(`Upload delay: ${2000}ms`);
  console.log(`Request timeout: ${30000}ms`);
  console.log(`Concurrency: ${3}`);
  
  const uploader = new S3ImageUploader();
  
  uploader.uploadImages(batchSize, maxPages)
    .then(() => {
      console.log('✅ Process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Process failed:', error.message);
      process.exit(1);
    });
}

module.exports = S3ImageUploader;

// node s3-uploader.js [batch_size] [max_pages]