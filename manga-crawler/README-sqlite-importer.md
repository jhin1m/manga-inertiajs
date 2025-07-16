# SQLite Manga Importer

This script imports manga information from a SQLite database into the Laravel MySQL database, with automatic genre mapping and S3 cover image upload.

## Features

- **Multi-field Search**: Searches SQLite database across title, native_title, romanized_title, secondary_titles_en, authors, and artists fields
- **Genre Mapping**: Maps Japanese genres to English using genres.json file
- **Taxonomy Management**: Automatically creates and links genres, authors, artists, and year taxonomies
- **S3 Cover Upload**: Downloads and uploads cover images to S3 when manga cover is missing
- **Batch Processing**: Processes manga in configurable batches with rate limiting
- **Proxy Support**: Uses proxy rotation for image downloads (if proxies.txt exists)
- **Progress Tracking**: Detailed statistics and progress reporting

## Prerequisites

1. Install required dependencies:
   ```bash
   npm install sqlite3
   ```

2. Ensure you have the SQLite database file (500MB+ manga data)

3. Configure your `.env` file with:
   - Database credentials (DB_HOST, DB_USERNAME, etc.)
   - S3 credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, etc.)

## Usage

### Basic Usage
```bash
node sqlite-manga-importer.js /path/to/manga-data.db
```

### With Custom Batch Size
```bash
node sqlite-manga-importer.js /path/to/manga-data.db 20
```

### Limit Number of Manga to Process
```bash
node sqlite-manga-importer.js /path/to/manga-data.db 10 100
```

### Using npm Script
```bash
npm run import /path/to/manga-data.db 10 50
```

## Parameters

1. **sqlite_path** (required): Path to the SQLite database file
2. **batch_size** (optional, default: 10): Number of manga to process per batch
3. **max_manga** (optional, default: unlimited): Maximum number of manga to process

## What It Does

### 1. Data Matching
- Fetches all manga from Laravel database
- For each manga, searches SQLite using comprehensive LIKE queries
- Prioritizes exact title matches over partial matches

### 2. Genre Processing
- Parses genres from SQLite (handles both JSON arrays and comma-separated strings)
- Maps Japanese genres to English using genres.json
- Creates genre taxonomy terms if they don't exist
- Links manga to genre terms via pivot table

### 3. Author/Artist Processing
- Extracts authors and artists from SQLite data
- Creates author/artist taxonomy terms
- Links manga to author/artist terms

### 4. Year Processing
- Extracts publication year from SQLite
- Creates year taxonomy terms
- Links manga to year terms

### 5. Cover Image Upload
- Checks if manga cover is null in Laravel database
- Downloads image from SQLite cover_raw field
- Uploads to S3 with proper path structure
- Updates manga cover field with S3 path

## Search Query Example

The script uses this SQLite query pattern:
```sql
SELECT * FROM "series" 
WHERE (
  ("title" LIKE '%manga_name%') OR 
  ("native_title" LIKE '%manga_name%') OR 
  ("romanized_title" LIKE '%manga_name%') OR 
  ("secondary_titles_en" LIKE '%manga_name%') OR 
  ("link" LIKE '%manga_name%') OR
  ("authors" LIKE '%manga_name%') OR 
  ("artists" LIKE '%manga_name%')
) 
ORDER BY 
  CASE 
    WHEN "title" = 'manga_name' THEN 1
    WHEN "native_title" = 'manga_name' THEN 2
    WHEN "romanized_title" = 'manga_name' THEN 3
    ELSE 4
  END
LIMIT 1
```

## Output Example

```
🚀 Starting SQLite manga import process...
📚 Found 150 manga in Laravel database

📦 Processing batch 1: manga 1 to 10

📖 Processing: Attack on Titan (ID: 1)
✅ Found match: 進撃の巨人
🔗 Linked 12 taxonomy terms
🖼️ Updated cover: manga-images/manga/attack-on-titan/cover.jpg
✅ Successfully processed: Attack on Titan

📊 Import Statistics:
Total processed: 10
Successful: 8
Failed: 1
Skipped: 1
Covers uploaded: 5
Success rate: 80.00%
```

## Error Handling

- Database connection failures are logged and cause script exit
- Individual manga processing errors are logged but don't stop the batch
- Image download failures are logged but don't fail the entire manga import
- SQLite search failures are handled gracefully

## Rate Limiting

- 1 second delay between individual manga processing
- 5 second delay between batches
- 2 second delay between image downloads
- Configurable batch sizes to control load

## File Structure

```
manga-crawler/
├── sqlite-manga-importer.js     # Main import script
├── genres.json                  # Genre mapping file
├── config.js                    # Database and S3 configuration
├── proxies.txt                  # Optional proxy list
└── package.json                 # Dependencies
```

## Troubleshooting

1. **SQLite file not found**: Ensure the path to the SQLite file is correct
2. **Database connection failed**: Check your .env database configuration
3. **S3 upload failed**: Verify AWS credentials and bucket permissions
4. **No matches found**: The manga name might not exist in SQLite or use different characters
5. **Genre mapping issues**: Check genres.json file format and encoding

## Performance Tips

- Use smaller batch sizes for large datasets
- Monitor database connections and memory usage
- Use proxy rotation for better image download success rates
- Process during off-peak hours for production systems