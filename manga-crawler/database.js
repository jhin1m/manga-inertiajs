const mysql = require('mysql2/promise');
const config = require('./config');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(config.database);
      
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database disconnected');
    }
  }

  // Manga operations
  async findMangaByTitle(title) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM mangas WHERE name = ? OR JSON_UNQUOTE(JSON_EXTRACT(alternative_names, "$[0]")) = ?',
      [title, title]
    );
    return rows[0] || null;
  }

  async findMangaBySlug(slug) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM mangas WHERE slug = ?',
      [slug]
    );
    return rows[0] || null;
  }

  async createManga(mangaData) {
    const {
      name,
      alternative_names,
      description,
      status,
      cover,
      slug
    } = mangaData;

    const [result] = await this.connection.execute(
      `INSERT INTO mangas (name, alternative_names, description, status, cover, slug, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        JSON.stringify(alternative_names || [name]),
        description || '',
        status || 'ongoing',
        cover || '',
        slug
      ]
    );

    return result.insertId;
  }

  // Chapter operations
  async findChaptersByManga(mangaId) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM chapters WHERE manga_id = ? ORDER BY chapter_number ASC',
      [mangaId]
    );
    return rows;
  }

  async findChapterByNumber(mangaId, chapterNumber) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM chapters WHERE manga_id = ? AND chapter_number = ?',
      [mangaId, chapterNumber]
    );
    return rows[0] || null;
  }

  async createChapter(chapterData) {
    const {
      manga_id,
      title,
      slug,
      chapter_number,
      volume_number,
      published_at
    } = chapterData;

    const [result] = await this.connection.execute(
      `INSERT INTO chapters (manga_id, title, slug, chapter_number, volume_number, published_at, views, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [
        manga_id,
        title,
        slug,
        chapter_number,
        volume_number || null,
        published_at || new Date()
      ]
    );

    return result.insertId;
  }

  // Page operations
  async createPage(pageData) {
    const { chapter_id, page_number, image_url } = pageData;

    const [result] = await this.connection.execute(
      'INSERT INTO pages (chapter_id, page_number, image_url, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [chapter_id, page_number, image_url]
    );

    return result.insertId;
  }

  async createPages(pages) {
    if (pages.length === 0) return;

    const values = pages.map(page => [
      page.chapter_id,
      page.page_number,
      page.image_url,
      page.image_url_2 || null,
      new Date(),
      new Date()
    ]);

    const placeholders = pages.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();

    await this.connection.execute(
      `INSERT INTO pages (chapter_id, page_number, image_url, image_url_2, created_at, updated_at) VALUES ${placeholders}`,
      flatValues
    );
  }

  // Taxonomy operations
  async findTaxonomyByType(type) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM taxonomies WHERE slug = ?',
      [type + 's'] // Convert 'genre' to 'genres', 'author' to 'authors'
    );
    return rows[0] || null;
  }

  async findTaxonomyTerm(taxonomyId, name) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM taxonomy_terms WHERE taxonomy_id = ? AND name = ?',
      [taxonomyId, name]
    );
    return rows[0] || null;
  }

  async findTaxonomyTermBySlug(taxonomyId, slug) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM taxonomy_terms WHERE taxonomy_id = ? AND slug = ?',
      [taxonomyId, slug]
    );
    return rows[0] || null;
  }

  async createTaxonomyTerm(taxonomyId, name, slug) {
    const [result] = await this.connection.execute(
      'INSERT INTO taxonomy_terms (taxonomy_id, name, slug, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [taxonomyId, name, slug]
    );
    return result.insertId;
  }

  async attachTaxonomyToManga(mangaId, taxonomyTermId) {
    // Check if already exists
    const [existing] = await this.connection.execute(
      'SELECT * FROM manga_taxonomy_terms WHERE manga_id = ? AND taxonomy_term_id = ?',
      [mangaId, taxonomyTermId]
    );

    if (existing.length === 0) {
      await this.connection.execute(
        'INSERT INTO manga_taxonomy_terms (manga_id, taxonomy_term_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [mangaId, taxonomyTermId]
      );
    }
  }

  async getMangaGenreCount(mangaId) {
    const [rows] = await this.connection.execute(
      `SELECT COUNT(*) as count FROM manga_taxonomy_terms mtt 
       JOIN taxonomy_terms tt ON mtt.taxonomy_term_id = tt.id 
       JOIN taxonomies t ON tt.taxonomy_id = t.id 
       WHERE mtt.manga_id = ? AND t.type = 'genre'`,
      [mangaId]
    );
    return rows[0].count;
  }

  // Helper method to execute raw queries
  async query(sql, params = []) {
    const [rows, result] = await this.connection.execute(sql, params);
    // For INSERT queries, return the result object which contains insertId
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
      return { insertId: result.insertId };
    }
    return rows;
  }
}

module.exports = Database;