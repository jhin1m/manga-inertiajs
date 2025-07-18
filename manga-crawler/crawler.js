#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const yargs = require('yargs');
const path = require('path');

const Database = require('./database');
const Utils = require('./utils');
const config = require('./config');
const { filterValidGenres, isValidGenre, normalizeGenre } = require('./genre-filter');

class MangaCrawler {
  constructor(sourceName = config.defaultSource, dryRun = false, downloadImages = false) {
    this.db = new Database();
    this.source = config.sources[sourceName];
    this.sourceName = sourceName;
    this.dryRun = dryRun;
    this.downloadImages = downloadImages;
    this.proxies = [];
    
    if (!this.source) {
      throw new Error(`Source '${sourceName}' not found in config`);
    }
  }

  async initialize() {
    if (!this.dryRun) {
      await this.db.connect();
    }
    
    // Load proxies for image downloads
    this.proxies = await Utils.loadProxies();
    if (this.proxies.length > 0) {
      Utils.log(`Loaded ${this.proxies.length} proxies for image downloads`);
    } else {
      Utils.log('No proxies loaded - downloads will use direct connection', 'warn');
    }
    
    Utils.log(`Initialized crawler for source: ${this.source.name}${this.dryRun ? ' (DRY RUN MODE)' : ''}${this.downloadImages ? ' (DOWNLOAD IMAGES)' : ' (USE ORIGINAL URLs)'}`);
  }

  async shutdown() {
    if (!this.dryRun) {
      await this.db.disconnect();
    }
    Utils.log('Crawler shutdown complete');
  }

  // Main crawling function for page ranges
  async crawlPages(startPage, endPage) {
    Utils.log(`Starting crawl from page ${startPage} to ${endPage}`);
    
    const totalPages = endPage - startPage + 1;
    const progress = Utils.createProgressTracker(totalPages, 'Crawling pages');

    for (let page = startPage; page <= endPage; page++) {
      try {
        await this.crawlMangaListPage(page);
        progress.update();
        
        // Delay between pages
        await Utils.sleep(config.crawler.requestDelay);
      } catch (error) {
        Utils.log(`Error crawling page ${page}: ${error.message}`, 'error');
      }
    }
    
    progress.finish();
  }

  // Crawl manga list from a specific page
  async crawlMangaListPage(page) {
    const url = this.source.listUrl.replace('{page}', page);
    Utils.log(`Crawling manga list page: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: this.source.headers,
        timeout: config.crawler.timeout
      });

      let mangaList = [];
      
      if (this.source.type === 'api') {
        // Handle API response
        const data = response.data;
        if (data.results && Array.isArray(data.results)) {
          mangaList = data.results;
          Utils.log(`Found ${mangaList.length} manga on page ${page}`);
        } else {
          Utils.log(`No results found in API response for page ${page}`, 'warn');
          return;
        }
      } else {
        // Handle HTML scraping
        const $ = cheerio.load(response.data);
        const mangaElements = $(this.source.selectors.mangaList);
        Utils.log(`Found ${mangaElements.length} manga on page ${page}`);
        
        for (let i = 0; i < mangaElements.length; i++) {
          const mangaData = await this.extractMangaDataFromList($, mangaElements[i]);
          if (mangaData) {
            mangaList.push(mangaData);
          }
        }
      }

      // In dry-run mode, process only the first manga for demonstration
      if (this.dryRun && mangaList.length > 0) {
        await this.processManga(mangaList[0]);
        Utils.log('[DRY RUN] Processed 1 manga for demonstration. Stopping here.');
        return;
      }

      // Process manga with limited concurrency
      const mangaPromises = mangaList.map(manga => this.processManga(manga));
      await this.processConcurrent(mangaPromises, config.crawler.concurrency);

    } catch (error) {
      Utils.log(`Failed to crawl page ${page}: ${error.message}`, 'error');
      throw error;
    }
  }

  // Extract manga data from list page element
  async extractMangaDataFromList($, element) {
    try {
      const $el = $(element);
      const selectors = this.source.selectors;

      const title = Utils.cleanText($el.find(selectors.mangaTitle).text());
      const url = $el.find(selectors.mangaUrl).attr('href');
      const cover = $el.find(selectors.mangaCover).attr('src');
      const status = Utils.cleanText($el.find(selectors.mangaStatus).text());

      if (!title || !url) {
        Utils.log(`Skipping manga with missing title or URL`, 'warn');
        return null;
      }

      return {
        title,
        url: Utils.makeAbsoluteUrl(this.source.baseUrl, url),
        cover: cover ? Utils.makeAbsoluteUrl(this.source.baseUrl, cover) : null,
        status: Utils.parseStatus(status),
        slug: await this.generateUniqueMangaSlug(title)
      };
    } catch (error) {
      Utils.log(`Error extracting manga data: ${error.message}`, 'error');
      return null;
    }
  }

  // Process individual manga
  async processManga(mangaData) {
    try {
      // Handle API data structure
      if (this.source.type === 'api') {
        const apiManga = {
          title: mangaData.name,
          slug: await this.generateUniqueMangaSlug(mangaData.name), // Generate unique slug from name
          url: mangaData.slug, // Use API slug for getMangaDetails calls
          thumbnail: mangaData.thumbnail,
          status: mangaData.type === 'complete' ? 'completed' : 'ongoing',
          views: mangaData.views,
          rating: mangaData.rate,
          is_adult: mangaData.is_adult === 'yes'
        };
        mangaData = apiManga;
      }

      Utils.log(`Processing manga: ${mangaData.title}`);

      // Check if manga already exists (skip in dry run)
      let existingManga = null;
      if (!this.dryRun) {
        existingManga = await this.db.findMangaByTitle(mangaData.title);
        if (!existingManga) {
          existingManga = await this.db.findMangaBySlug(mangaData.slug);
        }
      }

      let mangaId;
      if (existingManga) {
        mangaId = existingManga.id;
        Utils.log(`Manga exists in database: ${mangaData.title}`);
        
        // Update cover image if it's empty or different (skip in dry run)
        if (!this.dryRun && mangaData.thumbnail && (!existingManga.cover || existingManga.cover === '')) {
          Utils.log(`Updating cover image for existing manga: ${mangaData.title}`);
          const coverImagePath = await this.downloadCoverImage(mangaData.slug, mangaData.thumbnail);
          if (coverImagePath) {
            await this.db.query('UPDATE mangas SET cover = ? WHERE id = ?', [coverImagePath, mangaId]);
          }
        }

        // Check if manga has any genres, if not, update with genres from crawl
        if (!this.dryRun) {
          const genreCount = await this.db.getMangaGenreCount(mangaId);
          if (genreCount === 0) {
            Utils.log(`Manga has no genres, updating with crawled genres: ${mangaData.title}`);
            
            // Get detailed manga info to extract genres
            const detailedManga = await this.getMangaDetails(mangaData.url);
            if (detailedManga.genres && detailedManga.genres.length > 0) {
              // Process only genres for existing manga
              await this.processGenresOnly(mangaId, detailedManga.genres);
              Utils.log(`Updated ${detailedManga.genres.length} genres for existing manga: ${mangaData.title}`);
            }
          } else {
            Utils.log(`Manga already has ${genreCount} genres, skipping genre update`);
          }
        }
      } else {
        // Get detailed manga info
        const detailedManga = await this.getMangaDetails(mangaData.url);
        if (this.dryRun) {
          Utils.log(`\n[DRY RUN] MANGA PREVIEW:`);
          Utils.log(`=====================================`);
          Utils.log(`Tên: ${mangaData.title}`);
          Utils.log(`Slug: ${mangaData.slug}`);
          if (detailedManga.alternativeNames && detailedManga.alternativeNames.length > 0) {
            Utils.log(`Tên khác: ${detailedManga.alternativeNames.join(', ')}`);
          }
          Utils.log(`URL cover: ${mangaData.thumbnail || detailedManga.thumbnail || 'Không có'}`);
          if (detailedManga.authors && detailedManga.authors.length > 0) {
            Utils.log(`Tác giả: ${detailedManga.authors.join(', ')}`);
          }
          if (detailedManga.artists && detailedManga.artists.length > 0) {
            Utils.log(`Họa sĩ: ${detailedManga.artists.join(', ')}`);
          }
          if (detailedManga.genres && detailedManga.genres.length > 0) {
            Utils.log(`Thể loại: ${detailedManga.genres.join(', ')}`);
            
          } else {
            Utils.log(`Thể loại: Không có`);
          }
          Utils.log(`Trạng thái: ${detailedManga.status || mangaData.status || 'Không xác định'}`);
          if (detailedManga.description) {
            const shortDesc = detailedManga.description.length > 200 
              ? detailedManga.description.substring(0, 200) + '...' 
              : detailedManga.description;
            Utils.log(`Mô tả: ${shortDesc}`);
          }
          if (detailedManga.views) {
            Utils.log(`Lượt xem: ${detailedManga.views}`);
          }
          if (detailedManga.rating) {
            Utils.log(`Đánh giá: ${detailedManga.rating}/5`);
          }
          Utils.log(`=====================================`);
          mangaId = 'dry-run-' + Date.now(); // Fake ID for dry run
        } else {
          mangaId = await this.createManga({ ...mangaData, ...detailedManga });
          Utils.log(`Created new manga: ${mangaData.title}`);
        }
      }

      // Process chapters
      await this.processChapters(mangaId, mangaData.url, mangaData.slug);

    } catch (error) {
      Utils.log(`Error processing manga ${mangaData.title || mangaData.name}: ${error.message}`, 'error');
    }
  }

  // Get detailed manga information
  async getMangaDetails(mangaUrlOrSlug) {
    let url = 'unknown'; // Initialize to prevent undefined reference in catch block
    
    try {
      if (this.source.type === 'api') {
        // Extract slug from URL if it's a full URL
        let slug;
        if (mangaUrlOrSlug.includes('://')) {
          // It's a full URL, extract slug from it
          slug = mangaUrlOrSlug.split('/').pop();
        } else {
          // It's already a slug
          slug = mangaUrlOrSlug;
        }
        
        // For API, use slug to build detail URL
        url = this.source.mangaDetailUrl.replace('{slug}', slug);
      } else {
        // For HTML scraping, use direct URL
        url = mangaUrlOrSlug;
      }

      const response = await axios.get(url, {
        headers: this.source.headers,
        timeout: config.crawler.timeout
      });

      if (this.source.type === 'api') {
        // Handle API response
        const data = response.data;
        if (data.manga) {
          const manga = data.manga;
          
          // Extract genres and filter to only valid ones from genres.json
          const rawGenres = manga.genres ? manga.genres.map(g => g.name) : [];
          const genres = filterValidGenres(rawGenres);
          
          // Extract alternative names
          const alternativeNames = manga.names ? manga.names.map(n => n.name) : [];
          
          // Parse description from content JSON
          let description = '';
          if (manga.content) {
            try {
              const contentObj = JSON.parse(manga.content);
              if (contentObj.blocks && Array.isArray(contentObj.blocks)) {
                description = contentObj.blocks
                  .filter(block => block.type === 'paragraph' && block.data && block.data.text)
                  .map(block => block.data.text)
                  .join('\n\n');
              }
            } catch (e) {
              description = manga.description || '';
            }
          }

          return {
            description: Utils.cleanText(description),
            genres,
            alternativeNames,
            chapters: manga.chapters || []
          };
        }
      } else {
        // Handle HTML scraping
        const $ = cheerio.load(response.data);
        const selectors = this.source.selectors;

        const description = Utils.cleanText($(selectors.mangaDescription).text());
        const author = Utils.cleanText($(selectors.mangaAuthor).text());
        const artist = Utils.cleanText($(selectors.mangaArtist).text());
        
        const rawGenres = [];
        $(selectors.mangaGenres).each((index, element) => {
          const genre = Utils.cleanText($(element).text());
          if (genre) rawGenres.push(genre);
        });
        
        // Filter genres to only valid ones from genres.json
        const genres = filterValidGenres(rawGenres);

        return {
          description,
          author,
          artist,
          genres
        };
      }
    } catch (error) {
      // Only debug URLs that fail with 404 errors
      if (error.response && error.response.status === 404) {
        Utils.log(`[ERROR] Error getting manga details: ${error.message}`, 'error');
        Utils.log(`[DEBUG] 404 ERROR - URL that failed: ${url}`, 'error');
        Utils.log(`[DEBUG] 404 ERROR - Original slug/URL: ${mangaUrlOrSlug}`, 'error');
        Utils.log(`[DEBUG] 404 ERROR - Source mangaDetailUrl template: ${this.source.mangaDetailUrl}`, 'error');
        
        if (error.response.data) {
          Utils.log(`[DEBUG] 404 ERROR - Response data: ${JSON.stringify(error.response.data)}`, 'error');
        }
      } else {
        Utils.log(`[ERROR] Error getting manga details: ${error.message}`, 'error');
      }
      
      return {};
    }
  }

  // Create manga in database
  async createManga(mangaData) {
    try {
      Utils.validateMangaData(mangaData);

      // Download cover image if available
      let coverImagePath = mangaData.thumbnail || mangaData.cover || '';
      if (coverImagePath && (coverImagePath.startsWith('http://') || coverImagePath.startsWith('https://'))) {
        coverImagePath = await this.downloadCoverImage(mangaData.slug, coverImagePath);
      }

      const mangaId = await this.db.createManga({
        name: mangaData.title,
        alternative_names: mangaData.alternativeNames || [mangaData.title],
        description: mangaData.description || '',
        status: mangaData.status || 'ongoing',
        cover: coverImagePath,
        slug: mangaData.slug
      });

      // Add taxonomies (genres, author, artist)
      await this.processTaxonomies(mangaId, mangaData);

      return mangaId;
    } catch (error) {
      Utils.log(`Error creating manga: ${error.message}`, 'error');
      throw error;
    }
  }

  // Download cover image
  async downloadCoverImage(mangaSlug, coverUrl) {
    try {
      if (this.dryRun) {
        const filename = Utils.generateCoverFilename(mangaSlug, coverUrl);
        return `images/${filename}`;
      }

      const filename = Utils.generateCoverFilename(mangaSlug, coverUrl);
      const savePath = path.join(config.images.downloadPath, filename);
      
      const result = await Utils.downloadImage(
        coverUrl,
        savePath,
        this.source.headers,
        3, // maxRetries
        config // Pass config for S3 support
      );
      
      // Return appropriate URL based on storage type
      if (config.images.storage === 's3') {
        return result; // S3 URL
      } else {
        return `images/${filename}`; // Local path
      }
      
    } catch (error) {
      Utils.log(`Error downloading cover image: ${error.message}`, 'error');
      return ''; // Return empty string if download fails
    }
  }

  // Process taxonomies (genres, authors, artists)
  async processTaxonomies(mangaId, mangaData) {
    try {
      // Process genres - only use genres that are valid in genres.json
      if (mangaData.genres && mangaData.genres.length > 0) {
        Utils.log(`Processing ${mangaData.genres.length} genres: ${mangaData.genres.join(', ')}`);
        const genreTaxonomy = await this.db.findTaxonomyByType('genre');
        if (genreTaxonomy) {
          for (const genre of mangaData.genres) {
            // Double check that genre is valid in genres.json (with normalization)
            if (isValidGenre(genre)) {
              // Use normalized genre name for consistency
              const normalizedGenre = normalizeGenre(genre);
              Utils.log(`Mapping API genre "${genre}" -> DB genre "${normalizedGenre}"`);
              await this.attachTaxonomyTerm(mangaId, genreTaxonomy.id, normalizedGenre);
            } else {
              Utils.log(`Skipping invalid genre: ${genre}`, 'warn');
            }
          }
        }
      }

      // Process author
      if (mangaData.author) {
        const authorTaxonomy = await this.db.findTaxonomyByType('author');
        if (authorTaxonomy) {
          await this.attachTaxonomyTerm(mangaId, authorTaxonomy.id, mangaData.author);
        }
      }

      // Process artist
      if (mangaData.artist) {
        const artistTaxonomy = await this.db.findTaxonomyByType('artist');
        if (artistTaxonomy) {
          await this.attachTaxonomyTerm(mangaId, artistTaxonomy.id, mangaData.artist);
        }
      }
    } catch (error) {
      Utils.log(`Error processing taxonomies: ${error.message}`, 'error');
    }
  }

  // Process only genres for existing manga (used when manga has no genres)
  async processGenresOnly(mangaId, genres) {
    try {
      if (genres && genres.length > 0) {
        const genreTaxonomy = await this.db.findTaxonomyByType('genre');
        if (genreTaxonomy) {
          for (const genre of genres) {
            // Double check that genre is valid in genres.json (with normalization)
            if (isValidGenre(genre)) {
              // Use normalized genre name for consistency
              const normalizedGenre = normalizeGenre(genre);
              await this.attachTaxonomyTerm(mangaId, genreTaxonomy.id, normalizedGenre);
            }
          }
        }
      }
    } catch (error) {
      Utils.log(`Error processing genres: ${error.message}`, 'error');
    }
  }

  // Helper to attach taxonomy term to manga
  async attachTaxonomyTerm(mangaId, taxonomyId, termName) {
    try {
      if (this.dryRun) {
        // Skip taxonomy processing in dry run mode to keep output clean
        return;
      }

      // Normalize term name for comparison
      const normalizedTermName = termName.trim();
      
      // First check if term exists by name (case-insensitive to prevent duplicates)
      let taxonomyTerm = await this.db.findTaxonomyTerm(taxonomyId, normalizedTermName);
      
      if (!taxonomyTerm) {
        // Check if a term with similar name exists (case-insensitive and normalized)
        const existingTerms = await this.db.query(
          'SELECT * FROM taxonomy_terms WHERE taxonomy_id = ? AND LOWER(TRIM(name)) = LOWER(TRIM(?))',
          [taxonomyId, normalizedTermName]
        );
        
        if (existingTerms.length > 0) {
          // Use existing term instead of creating duplicate
          taxonomyTerm = existingTerms[0];
        } else {
          // Create new term with unique slug using improved slug generation
          let termSlug = await Utils.createSlug(normalizedTermName);
          
          // Handle duplicate slug case with better collision detection
          let slugCounter = 1;
          let originalSlug = termSlug;
          
          // Check for existing slug and handle collisions
          while (true) {
            const existingSlugTerm = await this.db.findTaxonomyTermBySlug(taxonomyId, termSlug);
            
            if (!existingSlugTerm) {
              // Slug is unique, we can use it
              break;
            } else {
              // Check if the existing term has the same name (case-insensitive)
              if (existingSlugTerm.name.toLowerCase().trim() === normalizedTermName.toLowerCase()) {
                // Same name, use existing term
                taxonomyTerm = existingSlugTerm;
                break;
              } else {
                // Different name but same slug, increment counter
                termSlug = `${originalSlug}-${slugCounter}`;
                slugCounter++;
                
                // Prevent infinite loop
                if (slugCounter > 100) {
                  termSlug = `${originalSlug}-${Date.now()}`;
                  break;
                }
              }
            }
          }
          
          // Create new term only if we didn't find an existing one
          if (!taxonomyTerm) {
            const termId = await this.db.createTaxonomyTerm(taxonomyId, normalizedTermName, termSlug);
            taxonomyTerm = { id: termId };
          }
        }
      } else {
      }

      // Attach the term to manga (with duplicate check)
      await this.db.attachTaxonomyToManga(mangaId, taxonomyTerm.id);
    } catch (error) {
      Utils.log(`Error attaching taxonomy term: ${error.message}`, 'error');
      throw error;
    }
  }

  // Process chapters for a manga
  async processChapters(mangaId, mangaUrlOrSlug, mangaSlug) {
    try {
      // Get chapters from source
      const sourceChapters = await this.getChaptersFromSource(mangaUrlOrSlug);
      
      if (this.dryRun) {
        Utils.log(`\n[DRY RUN] CHAPTER PREVIEW:`);
        Utils.log(`=====================================`);
        if (sourceChapters.length > 0) {
          Utils.log(`Tổng số chapter: ${sourceChapters.length}`);
          
          // Show first 3 chapters with details
          const chaptersToShow = sourceChapters.slice(0, 3);
          
          for (let i = 0; i < chaptersToShow.length; i++) {
            const chapter = chaptersToShow[i];
            Utils.log(`\n--- Chapter ${i + 1} ---`);
            Utils.log(`Tên: ${chapter.title}`);
            Utils.log(`Slug: ${chapter.slug}`);
            Utils.log(`Số chapter: ${chapter.chapter_number}`);
            if (chapter.volume_number) {
              Utils.log(`Số volume: ${chapter.volume_number}`);
            }
            Utils.log(`URL: ${chapter.url}`);
            if (chapter.published_at) {
              Utils.log(`Ngày đăng: ${chapter.published_at}`);
            }
            
            // Get chapter content (image URLs) for preview
            try {
              const imageUrls = await this.getChapterImageUrls(chapter.url);
              if (imageUrls.length > 0) {
                Utils.log(`Số trang: ${imageUrls.length}`);
                Utils.log(`Trang đầu: ${imageUrls[0]}`);
                if (imageUrls.length > 1) {
                  Utils.log(`Trang cuối: ${imageUrls[imageUrls.length - 1]}`);
                }
              } else {
                Utils.log(`Số trang: 0 (không tìm thấy)`);
              }
            } catch (error) {
              Utils.log(`Nội dung: Lỗi khi lấy trang - ${error.message}`);
            }
            
            // Add small delay between chapters
            if (i < chaptersToShow.length - 1) {
              await Utils.sleep(500);
            }
          }
          
          if (sourceChapters.length > 3) {
            Utils.log(`\n... và ${sourceChapters.length - 3} chapter khác`);
          }
        } else {
          Utils.log(`Không tìm thấy chapter nào cho manga này`);
        }
        Utils.log(`=====================================`);
        return;
      }

      // Get existing chapters from database
      const existingChapters = await this.db.findChaptersByManga(mangaId);
      const existingChapterNumbers = new Set(existingChapters.map(ch => parseFloat(ch.chapter_number)));

      // Find missing chapters with proper number comparison
      const missingChapters = [];
      for (const sourceChapter of sourceChapters) {
        const sourceNumber = parseFloat(sourceChapter.chapter_number);
        if (!existingChapterNumbers.has(sourceNumber)) {
          // Double-check with database query to handle precision issues
          const existingChapter = await this.db.findChapterByNumber(mangaId, sourceNumber);
          if (!existingChapter) {
            missingChapters.push(sourceChapter);
          } else {
            Utils.log(`Chapter ${sourceNumber} already exists (precision check)`, 'info');
          }
        }
      }
      
      if (missingChapters.length === 0) {
        Utils.log(`All chapters exist for manga ID ${mangaId}, skipping`);
        return;
      }

      Utils.log(`Found ${missingChapters.length} missing chapters for manga ID ${mangaId}`);

      // Process missing chapters
      for (const chapterData of missingChapters) {
        await this.processChapter(mangaId, chapterData, mangaSlug);
        await Utils.sleep(config.crawler.requestDelay);
      }

    } catch (error) {
      Utils.log(`Error processing chapters: ${error.message}`, 'error');
    }
  }

  // Get chapters from source
  async getChaptersFromSource(mangaUrlOrSlug) {
    try {
      if (this.source.type === 'api') {
        // For API, we already have chapters from manga details
        // We need to get them from the detailed manga call
        const detailedManga = await this.getMangaDetails(mangaUrlOrSlug);
        const chapters = [];
        
        if (detailedManga.chapters && Array.isArray(detailedManga.chapters)) {
          for (const chapter of detailedManga.chapters) {
            // Validate chapter data structure
            if (!chapter || typeof chapter !== 'object') {
              Utils.log(`Invalid chapter data: ${JSON.stringify(chapter)}`, 'warn');
              continue;
            }
            
            // Validate and normalize chapter data
            const chapterName = chapter.name ? String(chapter.name) : 'untitled';
            const chapterNumber = parseFloat(chapter.name) || chapter.order || 0;
            
            // Format title with Japanese style for API source (第NUMBER話)
            const title = chapter.title || `第${chapterName}話`;
            
            // Debug logging for problematic data
            if (chapter.name && typeof chapter.name !== 'string' && typeof chapter.name !== 'number') {
              Utils.log(`Warning: Unexpected chapter.name type: ${typeof chapter.name}, value: ${JSON.stringify(chapter.name)}`, 'warn');
            }
            
            chapters.push({
              title,
              url: chapter.path, // Use path as URL/slug for API
              chapter_number: chapterNumber,
              slug: await Utils.createChapterSlug(title), // Generate slug from formatted title (第1話)
              published_at: Utils.formatDate(chapter.updated_at),
              source_id: chapter.id
            });
          }
        }
        
        return chapters.sort((a, b) => a.chapter_number - b.chapter_number);
      } else {
        // Handle HTML scraping
        const response = await axios.get(mangaUrlOrSlug, {
          headers: this.source.headers,
          timeout: config.crawler.timeout
        });

        const $ = cheerio.load(response.data);
        const selectors = this.source.selectors;
        const chapters = [];

        const chapterElements = $(selectors.chapterList);
        
        for (let i = 0; i < chapterElements.length; i++) {
          const element = chapterElements[i];
          const $el = $(element);
          const title = Utils.cleanText($el.find(selectors.chapterTitle).text());
          const url = $el.find(selectors.chapterUrl).attr('href');
          const chapterNumberText = $el.find(selectors.chapterNumber).text();
          const dateText = $el.find(selectors.chapterDate).text();

          if (title && url) {
            const chapterNumber = Utils.parseChapterNumber(chapterNumberText || title);
            const slugInput = `${title || 'untitled'}-${chapterNumber || 'unknown'}`;
            
            chapters.push({
              title,
              url: Utils.makeAbsoluteUrl(this.source.baseUrl, url),
              chapter_number: chapterNumber,
              slug: await Utils.createChapterSlug(slugInput),
              published_at: Utils.formatDate(dateText)
            });
          }
        }

        return chapters.sort((a, b) => a.chapter_number - b.chapter_number);
      }
    } catch (error) {
      Utils.log(`Error getting chapters from source: ${error.message}`, 'error');
      return [];
    }
  }

  // Process individual chapter
  async processChapter(mangaId, chapterData, mangaSlug) {
    try {
      Utils.log(`Processing chapter: ${chapterData.title}`);

      // First, get chapter image URLs and download them
      const pages = await this.prepareChapterPages(chapterData.url, chapterData.slug, mangaSlug);
      
      if (pages.length === 0) {
        Utils.log(`No pages found for chapter ${chapterData.title}, skipping`, 'warn');
        return;
      }

      // Only create chapter after successful image downloads
      try {
        const chapterId = await this.db.createChapter({
          manga_id: mangaId,
          title: chapterData.title,
          slug: chapterData.slug,
          chapter_number: chapterData.chapter_number,
          published_at: chapterData.published_at
        });

        // Update pages with chapter_id and save to database
        pages.forEach(page => {
          page.chapter_id = chapterId;
        });
        
        await this.db.createPages(pages);
        
        Utils.log(`Successfully created chapter ${chapterData.title} with ${pages.length} pages`);
        
      } catch (error) {
        if (error.message.includes('Duplicate entry')) {
          Utils.log(`Chapter ${chapterData.title} (${chapterData.chapter_number}) already exists, skipping`, 'warn');
          return;
        } else {
          throw error; // Re-throw if it's not a duplicate error
        }
      }

    } catch (error) {
      Utils.log(`Error processing chapter ${chapterData.title}: ${error.message}`, 'error');
    }
  }

  // Get chapter image URLs for dry-run preview
  async getChapterImageUrls(chapterUrlOrSlug) {
    try {
      let imageUrls = [];
      
      if (this.source.type === 'api') {
        // For API, get chapter detail to get images
        const url = this.source.chapterDetailUrl.replace('{slug}', chapterUrlOrSlug);
        const response = await axios.get(url, {
          headers: this.source.headers,
          timeout: config.crawler.timeout
        });
        
        const data = response.data;
        if (data.decodedImages && Array.isArray(data.decodedImages)) {
          imageUrls = data.decodedImages;
        }
      } else {
        // Handle HTML scraping
        const response = await axios.get(chapterUrlOrSlug, {
          headers: this.source.headers,
          timeout: config.crawler.timeout
        });

        const $ = cheerio.load(response.data);
        const selectors = this.source.selectors;

        $(selectors.pageImages).each((index, element) => {
          const imageUrl = $(element).attr(selectors.imageUrl);
          if (imageUrl) {
            imageUrls.push(Utils.makeAbsoluteUrl(this.source.baseUrl, imageUrl));
          }
        });
      }
      
      return imageUrls;
    } catch (error) {
      throw new Error(`Error getting chapter images: ${error.message}`);
    }
  }

  // Prepare chapter pages - download images only if downloadImages flag is true
  async prepareChapterPages(chapterUrlOrSlug, chapterSlug, mangaSlug) {
    try {
      let pages = [];
      
      if (this.source.type === 'api') {
        // For API, get chapter detail to get images
        const url = this.source.chapterDetailUrl.replace('{slug}', chapterUrlOrSlug);
        const response = await axios.get(url, {
          headers: this.source.headers,
          timeout: config.crawler.timeout
        });
        
        const data = response.data;
        if (data.decodedImages && Array.isArray(data.decodedImages)) {
          pages = data.decodedImages.map((imageUrl, index) => ({
            page_number: index + 1,
            image_url: imageUrl,
            image_url_2: null // Initialize for potential second server
          }));
        }
      } else {
        // Handle HTML scraping
        const response = await axios.get(chapterUrlOrSlug, {
          headers: this.source.headers,
          timeout: config.crawler.timeout
        });

        const $ = cheerio.load(response.data);
        const selectors = this.source.selectors;

        $(selectors.pageImages).each((index, element) => {
          const imageUrl = $(element).attr(selectors.imageUrl);
          if (imageUrl) {
            pages.push({
              page_number: index + 1,
              image_url: Utils.makeAbsoluteUrl(this.source.baseUrl, imageUrl),
              image_url_2: null // Initialize for potential second server
            });
          }
        });
      }

      if (pages.length === 0) {
        Utils.log(`No pages found for chapter ${chapterSlug}`, 'warn');
        return [];
      }

      // If downloadImages is false, use original URLs
      if (!this.downloadImages) {
        Utils.log(`Using original image URLs for ${pages.length} pages in chapter ${chapterSlug}`);
        return pages;
      }

      // Download images only if downloadImages flag is true
      // Select random proxy for this chapter
      const chapterProxy = Utils.getRandomProxy(this.proxies);
      if (chapterProxy) {
        Utils.log(`Using proxy ${chapterProxy.host}:${chapterProxy.port} for chapter ${chapterSlug}`);
      }

      // Download all images first
      const downloadPromises = pages.map(page => 
        this.downloadPageImage(page, chapterSlug, mangaSlug, chapterProxy)
      );

      const downloadResults = await this.processConcurrent(downloadPromises, config.crawler.concurrency);
      
      // Check if all downloads were successful
      const failedDownloads = downloadResults.filter(result => result.status === 'rejected');
      if (failedDownloads.length > 0) {
        Utils.log(`${failedDownloads.length} out of ${pages.length} images failed to download for chapter ${chapterSlug}`, 'error');
        failedDownloads.forEach((result, index) => {
          Utils.log(`Failed download ${index + 1}: ${result.reason}`, 'error');
        });
        
        // Filter out failed pages
        const successfulPages = pages.filter((page, index) => downloadResults[index].status === 'fulfilled');
        if (successfulPages.length === 0) {
          throw new Error(`All image downloads failed for chapter ${chapterSlug}`);
        }
        
        Utils.log(`Proceeding with ${successfulPages.length} successfully downloaded pages`, 'warn');
        return successfulPages;
      }
      
      Utils.log(`Successfully downloaded ${pages.length} pages for chapter ${chapterSlug}${chapterProxy ? ` via proxy ${chapterProxy.host}:${chapterProxy.port}` : ''}`);
      return pages;

    } catch (error) {
      Utils.log(`Error preparing chapter pages: ${error.message}`, 'error');
      throw error;
    }
  }

  // Download individual page image
  async downloadPageImage(pageData, chapterSlug, mangaSlug, proxy = null) {
    try {
      const filename = Utils.generateImageFilename(
        mangaSlug, 
        chapterSlug, 
        pageData.page_number, 
        pageData.image_url
      );

      const savePath = path.join(config.images.downloadPath, filename);
      
      const result = await Utils.downloadImage(
        pageData.image_url, 
        savePath, 
        this.source.headers, 
        3, // maxRetries
        config, // Pass config for S3 support
        proxy // Pass proxy for this chapter
      );
      
      // Update page with appropriate URL based on storage type
      if (config.images.storage === 's3') {
        pageData.image_url = result; // S3 URL
      } else {
        pageData.image_url = `images/${filename}`; // Local path
      }
      
    } catch (error) {
      Utils.log(`Error downloading page image: ${error.message}`, 'error');
    }
  }

  // Generate unique manga slug with collision handling
  async generateUniqueMangaSlug(title) {
    if (this.dryRun) {
      return await Utils.createSlug(title);
    }

    let baseSlug = await Utils.createSlug(title);
    let slug = baseSlug;
    let counter = 1;
    
    // Check for existing slug and handle collisions
    while (true) {
      const existingManga = await this.db.findMangaBySlug(slug);
      
      if (!existingManga) {
        // Slug is unique, we can use it
        return slug;
      } else {
        // Check if the existing manga has the same title (case-insensitive)
        if (existingManga.name.toLowerCase().trim() === title.toLowerCase().trim()) {
          // Same title, use existing manga slug
          Utils.log(`Using existing manga slug for same title: ${title}`, 'info');
          return slug;
        } else {
          // Different title but same slug, increment counter
          slug = `${baseSlug}-${counter}`;
          counter++;
          
          // Prevent infinite loop
          if (counter > 100) {
            slug = `${baseSlug}-${Date.now()}`;
            break;
          }
        }
      }
    }
    
    return slug;
  }

  // Process promises with concurrency limit
  async processConcurrent(promises, concurrency) {
    const results = [];
    
    for (let i = 0; i < promises.length; i += concurrency) {
      const batch = promises.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(batch);
      results.push(...batchResults);
    }
    
    return results;
  }
}

// CLI interface
async function main() {
  const argv = yargs
    .option('pages', {
      describe: 'Page range to crawl (e.g., 1-5)',
      type: 'string',
      demandOption: true
    })
    .option('source', {
      describe: 'Source to crawl from',
      type: 'string',
      default: config.defaultSource
    })
    .option('dry-run', {
      describe: 'Run in dry-run mode (no database operations)',
      type: 'boolean',
      default: false
    })
    .option('download', {
      describe: 'Download chapter images to local storage (default: use original URLs)',
      type: 'boolean',
      default: false
    })
    .help()
    .argv;

  try {
    const crawler = new MangaCrawler(argv.source, argv.dryRun, argv.download);
    await crawler.initialize();

    // Parse page range
    const pageRange = argv.pages.split('-').map(p => parseInt(p.trim()));
    const startPage = pageRange[0];
    const endPage = pageRange[1] || startPage;

    if (startPage > endPage) {
      throw new Error('Start page must be less than or equal to end page');
    }

    // Start crawling
    await crawler.crawlPages(startPage, endPage);
    
    await crawler.shutdown();
    Utils.log(`Crawling completed successfully${argv.dryRun ? ' (DRY RUN)' : ''}${argv.download ? ' (IMAGES DOWNLOADED)' : ' (ORIGINAL URLs USED)'}`);
    
  } catch (error) {
    Utils.log(`Crawling failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = MangaCrawler;