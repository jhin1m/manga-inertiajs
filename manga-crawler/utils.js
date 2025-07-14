const fs = require('fs').promises;
const path = require('path');
const slugify = require('slugify');
const axios = require('axios');
const AWS = require('aws-sdk');
const Kuroshiro = require('kuroshiro').default;
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');
const { HttpsProxyAgent } = require('https-proxy-agent');

class Utils {
  static kuroshiro = new Kuroshiro();
  static kuroshiroInitialized = false;

  // Initialize Kuroshiro with Kuromoji analyzer
  static async initializeKuroshiro() {
    if (this.kuroshiroInitialized) return;
    
    try {
      const analyzer = new KuromojiAnalyzer({
        dictPath: path.join(__dirname, 'node_modules', 'kuromoji', 'dict')
      });
      await this.kuroshiro.init(analyzer);
      this.kuroshiroInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Kuroshiro:', error);
      // Handle initialization failure, perhaps by falling back to a simpler slug method
    }
  }

  // Load and parse proxy list
  static async loadProxies() {
    try {
      const proxiesPath = path.join(__dirname, 'proxies.txt');
      const proxiesData = await fs.readFile(proxiesPath, 'utf-8');
      
      const proxies = proxiesData
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          const [host, port, username, password] = line.split(':');
          return {
            host,
            port: parseInt(port),
            username,
            password,
            url: `http://${username}:${password}@${host}:${port}`
          };
        });
      
      return proxies;
    } catch (error) {
      console.error('Error loading proxies:', error.message);
      return [];
    }
  }

  // Get random proxy from list
  static getRandomProxy(proxies) {
    if (!proxies || proxies.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * proxies.length);
    return proxies[randomIndex];
  }

  // Create proxy agent for HTTP requests
  static createProxyAgent(proxy) {
    if (!proxy) return null;
    
    try {
      return new HttpsProxyAgent(proxy.url);
    } catch (error) {
      console.error('Error creating proxy agent:', error.message);
      return null;
    }
  }

  // Generate slug from title with Kuroshiro for Japanese
  static async createSlug(title) {
    // Ensure Kuroshiro is initialized
    await this.initializeKuroshiro();

    // Handle null, undefined, and non-string values
    if (!title) {
      return 'untitled-' + Date.now();
    }
    
    // Convert to string if it's not already a string
    if (typeof title !== 'string') {
      title = String(title);
    }
    
    if (title.trim() === '') {
      return 'untitled-' + Date.now();
    }

    const cleanTitle = title.trim();
    let transliterated = cleanTitle;

    // Check if Kuroshiro was initialized successfully
    if (this.kuroshiroInitialized) {
      try {
        // Convert Japanese text to Romaji
        transliterated = await this.kuroshiro.convert(cleanTitle, {
          to: 'romaji',
          romajiSystem: 'hepburn', // Use a common romaji system
        });
      } catch (error) {
        console.error(`Kuroshiro conversion failed for "${cleanTitle}":`, error);
        // Fallback to slugify directly if conversion fails
        transliterated = cleanTitle;
      }
    }

    // Use slugify for final cleaning and formatting
    let slug = slugify(transliterated, {
      lower: true,
      strict: true, // Stricter rules for cleaner slugs
      // remove: /[*+~()\'"!:@,.?]/g, // Remove problematic characters
      locale: 'en',
      trim: true
    });

    // Fallback if slug is empty after processing
    if (!slug) {
      // A simple fallback using a timestamp
      return 'untitled-' + Date.now();
    }

    return this.cleanupSlug(slug);
  }

  // Create chapter slug with custom Japanese pattern handling
  static async createChapterSlug(title) {
    // Handle null, undefined, and non-string values
    if (!title) {
      return 'untitled-' + Date.now();
    }
    
    // Convert to string if it's not already a string
    if (typeof title !== 'string') {
      title = String(title);
    }
    
    if (title.trim() === '') {
      return 'untitled-' + Date.now();
    }

    const cleanTitle = title.trim();
    
    // Custom pattern for Japanese chapter titles: 第NUMBER話 => di-NUMBERhua
    const chapterPattern = /第(\d+(?:\.\d+)?)話/;
    const match = cleanTitle.match(chapterPattern);
    
    if (match) {
      // Extract the number and create the custom slug
      const chapterNumber = match[1];
      const customSlug = `di-${chapterNumber}hua`;
      
      // Clean up any remaining text and combine
      let remainingText = cleanTitle.replace(chapterPattern, '').trim();
      
      if (remainingText) {
        // If there's additional text, process it normally and combine
        const additionalSlug = await this.createSlug(remainingText);
        return this.cleanupSlug(`${customSlug}-${additionalSlug}`);
      }
      
      return this.cleanupSlug(customSlug);
    }
    
    // If no pattern matched, use the regular createSlug method
    return await this.createSlug(cleanTitle);
  }

  // Clean up slug formatting
  static cleanupSlug(slug) {
    return slug
      .replace(/-+/g, '-') // Replace multiple dashes with a single dash
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }




  // Sleep function for delays
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Parse chapter number from string
  static parseChapterNumber(chapterText) {
    const match = chapterText.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // Parse volume number from string
  static parseVolumeNumber(volumeText) {
    if (!volumeText) return null;
    const match = volumeText.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  // Clean text content
  static cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ');
  }

  // Get file extension from URL
  static getFileExtension(url) {
    try {
      const pathname = new URL(url).pathname;
      const ext = path.extname(pathname).toLowerCase();
      // If no extension is found, default to .jpg
      return ext || '.jpg';
    } catch (error) {
      return '.jpg'; // Default extension on error
    }
  }

  // Generate filename for image
  static generateImageFilename(mangaSlug, chapterSlug, pageNumber, imageUrl) {
    const extension = this.getFileExtension(imageUrl);
    const paddedPage = String(pageNumber).padStart(3, '0');
    
    // Format: manga-slug/chapter-slug/page-001.jpg
    return `${mangaSlug}/${chapterSlug}/page-${paddedPage}${extension}`;
  }

  // Generate filename for cover image
  static generateCoverFilename(mangaSlug, imageUrl) {
    const extension = this.getFileExtension(imageUrl);
    
    // Format: manga-slug.jpg (use slug as filename)
    return `${mangaSlug}${extension}`;
  }

  // Ensure directory exists
  static async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  // Download image with retry logic, S3 support, and proxy rotation
  static async downloadImage(imageUrl, savePath, headers = {}, maxRetries = 3, config = null, proxy = null) {
    const fullPath = path.resolve(savePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists for local storage
    await this.ensureDirectoryExists(dir);

    // Check if file already exists locally
    try {
      await fs.access(fullPath);
      console.log(`Image already exists: ${path.basename(fullPath)}`);
      return fullPath;
    } catch (error) {
      // File doesn't exist, proceed with download
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const axiosConfig = {
          method: 'GET',
          url: imageUrl,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            ...headers
          },
          responseType: 'arraybuffer',
          timeout: 15000
        };

        // Add proxy if provided
        if (proxy) {
          const proxyAgent = this.createProxyAgent(proxy);
          if (proxyAgent) {
            axiosConfig.httpsAgent = proxyAgent;
            axiosConfig.httpAgent = proxyAgent;
            
          }
        }

        const response = await axios(axiosConfig);

        const imageBuffer = Buffer.from(response.data);
        const storage = config?.images?.storage || 'local';
        
        // Handle different storage options
        if (storage === 'local' || storage === 'both') {
          // Save to local storage
          await fs.writeFile(fullPath, imageBuffer);
          console.log(`Downloaded locally: ${path.basename(fullPath)} ${proxy ? `via proxy ${proxy.host}:${proxy.port}` : ''}`);
        }
        
        if (storage === 's3' || storage === 'both') {
          // Upload to S3
          const s3Url = await this.uploadToS3(imageBuffer, savePath, config);
          console.log(`Uploaded to S3: ${s3Url}`);
          
          if (storage === 's3') {
            // Return S3 URL if only using S3
            return s3Url;
          }
        }

        return fullPath;

      } catch (error) {
        console.log(`Download attempt ${attempt} failed for ${imageUrl}: ${error.message} ${proxy ? `(proxy: ${proxy.host}:${proxy.port})` : ''}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to download image after ${maxRetries} attempts: ${imageUrl}`);
        }
        
        await this.sleep(1000 * attempt); // Progressive delay
      }
    }
  }

  // Upload image to S3
  static async uploadToS3(imageBuffer, localPath, config) {
    if (!config?.images?.s3?.enabled) {
      throw new Error('S3 upload is not enabled');
    }

    const s3Config = config.images.s3;
    
    // Configure AWS SDK
    const s3 = new AWS.S3({
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
      region: s3Config.region,
      endpoint: s3Config.endpoint,
      s3ForcePathStyle: s3Config.forcePathStyle
    });

    // Generate S3 key from local path
    const relativePath = path.relative(config.images.downloadPath, localPath);
    const s3Key = `${s3Config.keyPrefix}${relativePath}`.replace(/\\/g, '/');

    try {
      const uploadParams = {
        Bucket: s3Config.bucket,
        Key: s3Key,
        Body: imageBuffer,
        ACL: s3Config.acl,
        ContentType: this.getMimeType(localPath)
      };

      await s3.upload(uploadParams).promise();

      // Manually construct the final URL to ensure it uses the correct base URL
      const finalUrl = `${s3Config.baseUrl}/${s3Key}`;
      return finalUrl;
    } catch (error) {
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  // Get MIME type from file extension
  static getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Extract domain from URL
  static extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return null;
    }
  }

  // Convert relative URL to absolute
  static makeAbsoluteUrl(baseUrl, relativeUrl) {
    try {
      return new URL(relativeUrl, baseUrl).toString();
    } catch (error) {
      return relativeUrl;
    }
  }

  // Log with timestamp
  static log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (level === 'error') {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  // Validate manga data
  static validateMangaData(manga) {
    const required = ['title', 'slug'];
    const missing = required.filter(field => !manga[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required manga fields: ${missing.join(', ')}`);
    }

    return true;
  }

  // Validate chapter data
  static validateChapterData(chapter) {
    const required = ['title', 'slug', 'chapter_number'];
    const missing = required.filter(field => !chapter[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required chapter fields: ${missing.join(', ')}`);
    }

    return true;
  }

  // Parse status from text
  static parseStatus(statusText) {
    if (!statusText) return 'ongoing';
    
    const status = statusText.toLowerCase();
    
    if (status.includes('completed') || status.includes('hoàn thành')) {
      return 'completed';
    } else if (status.includes('hiatus') || status.includes('tạm dừng')) {
      return 'hiatus';
    } else if (status.includes('cancelled') || status.includes('đã hủy')) {
      return 'cancelled';
    }
    
    return 'ongoing';
  }

  // Get relative path for database storage
  static getRelativePath(fullPath, basePath) {
    const relativePath = path.relative(basePath, fullPath);
    return relativePath.replace(/\\/g, '/'); // Normalize for web URLs
  }

  // Retry function with exponential backoff
  static async retryWithBackoff(fn, maxRetries = 5, initialDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Retry ${attempt}/${maxRetries} in ${delay}ms: ${error.message}`);
        await this.sleep(delay);
      }
    }
  }

  // Format date for database
  static formatDate(date) {
    if (!date) return new Date();
    if (date instanceof Date) return date;
    return new Date(date);
  }

  // Clean HTML tags from text
  static stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  // Progress tracker
  static createProgressTracker(total, label = 'Processing') {
    let current = 0;
    
    return {
      update: (increment = 1) => {
        current += increment;
        const percentage = ((current / total) * 100).toFixed(1);
        process.stdout.write(`\r${label}: ${current}/${total} (${percentage}%)`);
        
        if (current >= total) {
          console.log(''); // New line when complete
        }
      },
      finish: () => {
        current = total;
        console.log(`\n${label} completed!`);
      }
    };
  }
}

module.exports = Utils;