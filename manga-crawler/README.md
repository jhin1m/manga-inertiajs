# Manga Crawler

A standalone JavaScript crawler for manga websites that integrates with your Laravel manga application database.

## Features

- **Page Range Crawling**: Crawl manga from page X to page Y
- **Duplicate Detection**: Skip manga and chapters that already exist in database
- **Image Downloading**: Automatically download chapter images with retry logic
- **Taxonomy Support**: Handle genres, authors, and artists
- **Concurrency Control**: Configurable concurrent downloads
- **Rate Limiting**: Respectful crawling with configurable delays
- **Direct Database Access**: No Laravel dependency, direct MySQL connection

## Installation

1. Navigate to the crawler directory:
```bash
cd manga-crawler
```

2. Install dependencies:
```bash
npm install
```

3. Configure your source in `config.js` (see Configuration section)

## Usage

### Basic Usage

```bash
# Crawl pages 1-5
node crawler.js --pages=1-5

# Crawl single page
node crawler.js --pages=1

# Crawl with specific source
node crawler.js --pages=1-3 --source=example
```

### Available Options

- `--pages`: Page range to crawl (required)
  - Single page: `--pages=1`
  - Range: `--pages=1-5`
- `--source`: Source configuration to use (default: 'example')

## Configuration

Edit `config.js` to configure your manga source:

### Source Configuration

```javascript
sources: {
  yoursite: {
    name: 'Your Manga Site',
    baseUrl: 'https://yoursite.com',
    listUrl: 'https://yoursite.com/manga/page/{page}',
    selectors: {
      // Manga list page
      mangaList: '.manga-item',
      mangaTitle: '.manga-title',
      mangaUrl: '.manga-link',
      mangaCover: '.manga-cover img',
      mangaStatus: '.manga-status',
      mangaGenres: '.manga-genres a',
      mangaDescription: '.manga-description',
      mangaAuthor: '.manga-author',
      mangaArtist: '.manga-artist',
      
      // Chapter list
      chapterList: '.chapter-list .chapter-item',
      chapterTitle: '.chapter-title',
      chapterUrl: '.chapter-link',
      chapterNumber: '.chapter-number',
      chapterDate: '.chapter-date',
      
      // Chapter pages
      pageImages: '.page-image img',
      imageUrl: 'src' // attribute name
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
}
```

### Crawler Settings

```javascript
crawler: {
  requestDelay: 1000,    // Delay between requests (ms)
  maxRetries: 3,         // Retry attempts for failed requests
  timeout: 10000,        // Request timeout (ms)
  concurrency: 5         // Concurrent downloads
}
```

### Image Settings

```javascript
images: {
  downloadPath: '../storage/app/public/images/',  // Laravel storage path
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  maxFileSize: 10 * 1024 * 1024  // 10MB
}
```

## File Structure

```
manga-crawler/
├── crawler.js          # Main crawler application
├── database.js         # MySQL database operations
├── config.js           # Configuration settings
├── utils.js            # Helper functions
├── package.json        # Dependencies
└── README.md           # This file
```

## How It Works

1. **Page Scanning**: Crawls manga list pages from X to Y
2. **Manga Processing**: For each manga found:
   - Checks if manga exists in database (by title/slug)
   - If not exists: Creates manga with genres, authors, artists
   - Downloads cover image and saves to storage
   - If exists: Updates cover image if missing
3. **Chapter Processing**: 
   - Gets chapter list from source
   - Compares with existing chapters in database
   - Downloads missing chapters only
4. **Image Downloading**: 
   - Downloads cover images for manga
   - Downloads chapter page images with retry logic
   - Supports local storage, S3, or both
   - Updates database with appropriate image paths/URLs

## Database Integration

The crawler directly accesses your Laravel MySQL database using these tables:

- `mangas`: Main manga data
- `chapters`: Chapter information
- `pages`: Page images
- `taxonomies` & `taxonomy_terms`: Genres, authors, artists
- `manga_taxonomy_terms`: Manga-taxonomy relationships

## Error Handling

- **Request Failures**: Automatic retry with exponential backoff
- **Missing Data**: Graceful handling of missing manga/chapter information
- **Image Download Failures**: Retry mechanism with fallback
- **Database Errors**: Detailed logging for debugging

## Performance Tips

1. **Adjust Concurrency**: Lower `concurrency` for slower servers
2. **Increase Delays**: Higher `requestDelay` to avoid rate limits
3. **Monitor Progress**: Check console output for real-time status
4. **Resume Capability**: Crawler skips existing data automatically

## Logging

The crawler provides detailed console logging:

```
[2024-01-15T10:30:00.000Z] [INFO] Initialized crawler for source: Example Source
[2024-01-15T10:30:01.000Z] [INFO] Starting crawl from page 1 to 5
[2024-01-15T10:30:02.000Z] [INFO] Crawling manga list page: https://example.com/manga/page/1
[2024-01-15T10:30:03.000Z] [INFO] Found 20 manga on page 1
[2024-01-15T10:30:04.000Z] [INFO] Processing manga: Example Manga Title
[2024-01-15T10:30:05.000Z] [INFO] Created new manga: Example Manga Title
[2024-01-15T10:30:06.000Z] [INFO] Found 3 missing chapters for manga ID 123
[2024-01-15T10:30:07.000Z] [INFO] Downloaded 15 pages for chapter example-manga-chapter-1
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL credentials in `config.js`
   - Ensure MySQL server is running
   - Verify database exists

2. **No Manga Found**
   - Check CSS selectors in source configuration
   - Verify website structure hasn't changed
   - Test selectors in browser developer tools

3. **Image Download Failures**
   - Check if images require authentication
   - Verify image URLs are accessible
   - Adjust request headers if needed

4. **Permission Errors**
   - Ensure write permissions for image directory
   - Check Laravel storage permissions

### Debug Tips

1. **Test Single Page**: Use `--pages=1` to test configuration
2. **Check Selectors**: Verify CSS selectors match website structure
3. **Network Issues**: Increase timeout and reduce concurrency
4. **Database Issues**: Check Laravel database configuration

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## License

MIT License - See LICENSE file for details