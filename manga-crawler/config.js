// Load environment variables from parent project's .env file
require('dotenv').config({ path: '../.env' });

const config = {
  // Database configuration (from Laravel .env)
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'manga_inertia',
    charset: 'utf8mb4'
  },

  // Crawler settings
  crawler: {
    requestDelay: 1000, // 1 second delay between requests
    maxRetries: 3,
    timeout: 10000, // 10 seconds timeout
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    concurrency: 5, // Number of concurrent downloads
  },

  // Image download settings
  images: {
    downloadPath: '../storage/app/public/images/',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    resizeImages: false, // Set to true if you want to resize images
    maxWidth: 1200,
    maxHeight: 1600,
    // Storage options: 'local', 's3', 'both'
    storage: 's3',
    // S3 configuration
    s3: {
      enabled: true,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_BUCKET || 'manga-images',
      keyPrefix: process.env.AWS_PATH || 'manga-images/', // Prefix for S3 keys
      baseUrl: process.env.AWS_URL || `https://${process.env.AWS_BUCKET || 'manga-images'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
      acl: 'public-read', // S3 object ACL
      endpoint: process.env.AWS_ENDPOINT || null, // For S3-compatible services
      forcePathStyle: false // Set to true for S3-compatible services
    }
  },

  // Source configurations - Template for different manga sources
  sources: {
    // Mangaruu API source
    mangaruu: {
      name: 'Mangaruu API',
      type: 'api', // API-based source
      baseUrl: process.env.MANGARUU_API_BASE_URL,
      listUrl: process.env.MANGARUU_API_LIST_URL,
      mangaDetailUrl: process.env.MANGARUU_API_MANGA_DETAIL_URL,
      chapterDetailUrl: process.env.MANGARUU_API_CHAPTER_DETAIL_URL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    },

    // Example HTML scraping source (kept for reference)
    example: {
      name: 'Example Source',
      type: 'html', // HTML scraping source
      baseUrl: 'https://example.com',
      listUrl: 'https://example.com/manga/page/{page}',
      selectors: {
        // Manga list page selectors
        mangaList: '.manga-item',
        mangaTitle: '.manga-title',
        mangaUrl: '.manga-link',
        mangaCover: '.manga-cover img',
        mangaStatus: '.manga-status',
        mangaGenres: '.manga-genres a',
        mangaDescription: '.manga-description',
        mangaAuthor: '.manga-author',
        mangaArtist: '.manga-artist',
        
        // Manga detail page selectors
        chapterList: '.chapter-list .chapter-item',
        chapterTitle: '.chapter-title',
        chapterUrl: '.chapter-link',
        chapterNumber: '.chapter-number',
        chapterDate: '.chapter-date',
        
        // Chapter page selectors
        pageImages: '.page-image img',
        nextPageUrl: '.next-page',
        imageUrl: 'src' // attribute to get image URL
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    }
  },

  // Default source to use if not specified
  defaultSource: 'mangaruu',

  // Logging settings
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    logFile: './crawler.log',
    enableConsole: true,
    enableFile: false
  }
};

module.exports = config;