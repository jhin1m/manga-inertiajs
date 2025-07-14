#!/usr/bin/env node

const Database = require('./database');
const fs = require('fs').promises;
const path = require('path');

/**
 * Test suite for genres import to database
 * Tests the taxonomy system and genre import functionality
 */

class GenreImportTester {
  constructor() {
    this.db = new Database();
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      await this.db.connect();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      throw error;
    }
  }

  async cleanup() {
    try {
      await this.db.disconnect();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error.message);
    }
  }

  async runTest(description, testFunction) {
    try {
      console.log(`\n🧪 Test: ${description}`);
      console.log('-'.repeat(50));
      
      const result = await testFunction();
      
      if (result) {
        console.log('✅ PASS');
        this.testResults.passed++;
      } else {
        console.log('❌ FAIL');
        this.testResults.failed++;
      }
      
      return result;
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push({ description, error: error.message });
      return false;
    }
  }

  async testGenresFileExists() {
    return await this.runTest('Check if genres.json file exists', async () => {
      const genresPath = path.join(__dirname, 'genres.json');
      
      try {
        await fs.access(genresPath);
        console.log(`📁 Genres file found at: ${genresPath}`);
        return true;
      } catch (error) {
        console.log(`📁 Genres file not found at: ${genresPath}`);
        return false;
      }
    });
  }

  async testGenresFileStructure() {
    return await this.runTest('Validate genres.json file structure', async () => {
      const genresPath = path.join(__dirname, 'genres.json');
      
      try {
        const genresContent = await fs.readFile(genresPath, 'utf-8');
        const genres = JSON.parse(genresContent);
        
        if (!Array.isArray(genres)) {
          console.log('❌ Genres file is not an array');
          return false;
        }
        
        console.log(`📊 Found ${genres.length} genres in file`);
        
        // Validate structure of first few genres
        const requiredFields = ['label_en', 'label_jp', 'value'];
        let structureValid = true;
        
        for (let i = 0; i < Math.min(5, genres.length); i++) {
          const genre = genres[i];
          const missingFields = requiredFields.filter(field => !genre[field]);
          
          if (missingFields.length > 0) {
            console.log(`❌ Genre ${i} missing fields: ${missingFields.join(', ')}`);
            structureValid = false;
          } else {
            console.log(`✅ Genre ${i}: ${genre.label_en} (${genre.value})`);
          }
        }
        
        return structureValid;
      } catch (error) {
        console.log(`❌ Error reading/parsing genres file: ${error.message}`);
        return false;
      }
    });
  }

  async testTaxonomyTableExists() {
    return await this.runTest('Check if taxonomy tables exist', async () => {
      try {
        // Check taxonomies table
        const taxonomies = await this.db.query('SELECT * FROM taxonomies LIMIT 1');
        console.log('✅ taxonomies table exists');
        
        // Check taxonomy_terms table
        const taxonomyTerms = await this.db.query('SELECT * FROM taxonomy_terms LIMIT 1');
        console.log('✅ taxonomy_terms table exists');
        
        // Check manga_taxonomy_terms table
        const mangaTaxonomyTerms = await this.db.query('SELECT * FROM manga_taxonomy_terms LIMIT 1');
        console.log('✅ manga_taxonomy_terms table exists');
        
        return true;
      } catch (error) {
        console.log(`❌ Taxonomy tables check failed: ${error.message}`);
        return false;
      }
    });
  }

  async testGenreTaxonomyExists() {
    return await this.runTest('Check if genre taxonomy exists in database', async () => {
      try {
        const genreTaxonomy = await this.db.findTaxonomyByType('genre');
        
        if (genreTaxonomy) {
          console.log(`✅ Genre taxonomy found with ID: ${genreTaxonomy.id}`);
          console.log(`   Name: ${genreTaxonomy.name}`);
          console.log(`   Type: ${genreTaxonomy.type}`);
          return true;
        } else {
          console.log('❌ Genre taxonomy not found in database');
          console.log('💡 You may need to seed the taxonomies table first');
          return false;
        }
      } catch (error) {
        console.log(`❌ Error checking genre taxonomy: ${error.message}`);
        return false;
      }
    });
  }

  async testCreateGenreTerms() {
    return await this.runTest('Test creating genre terms from genres.json', async () => {
      try {
        // First, get or create genre taxonomy
        let genreTaxonomy = await this.db.findTaxonomyByType('genre');
        
        if (!genreTaxonomy) {
          console.log('⚠️  Genre taxonomy not found, attempting to create it...');
          
          // Create genre taxonomy if it doesn't exist
          const taxonomyId = await this.db.query(
            'INSERT INTO taxonomies (name, type, slug, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            ['Genre', 'genre', 'genre']
          );
          
          genreTaxonomy = { id: taxonomyId.insertId, name: 'Genre', type: 'genre' };
          console.log(`✅ Created genre taxonomy with ID: ${genreTaxonomy.id}`);
        }
        
        // Load genres from file
        const genresPath = path.join(__dirname, 'genres.json');
        const genresContent = await fs.readFile(genresPath, 'utf-8');
        const genres = JSON.parse(genresContent);
        
        console.log(`📂 Loaded ${genres.length} genres from file`);
        
        // Test creating a few sample genre terms
        const sampleGenres = genres.slice(0, 5); // Test first 5 genres
        let successCount = 0;
        
        for (const genre of sampleGenres) {
          try {
            // Check if term already exists
            let existingTerm = await this.db.findTaxonomyTerm(genreTaxonomy.id, genre.label_en);
            
            if (existingTerm) {
              console.log(`✅ Genre term already exists: ${genre.label_en}`);
              successCount++;
            } else {
              // Create new term
              const termId = await this.db.createTaxonomyTerm(
                genreTaxonomy.id,
                genre.label_en,
                genre.value
              );
              
              console.log(`✅ Created genre term: ${genre.label_en} (ID: ${termId})`);
              successCount++;
            }
          } catch (error) {
            console.log(`❌ Failed to create genre term ${genre.label_en}: ${error.message}`);
          }
        }
        
        console.log(`📊 Successfully processed ${successCount}/${sampleGenres.length} genre terms`);
        return successCount === sampleGenres.length;
        
      } catch (error) {
        console.log(`❌ Error testing genre term creation: ${error.message}`);
        return false;
      }
    });
  }

  async testGenreTermRetrieval() {
    return await this.runTest('Test retrieving genre terms from database', async () => {
      try {
        const genreTaxonomy = await this.db.findTaxonomyByType('genre');
        
        if (!genreTaxonomy) {
          console.log('❌ Genre taxonomy not found');
          return false;
        }
        
        // Get all genre terms
        const genreTerms = await this.db.query(
          'SELECT * FROM taxonomy_terms WHERE taxonomy_id = ? ORDER BY name',
          [genreTaxonomy.id]
        );
        
        console.log(`📊 Found ${genreTerms.length} genre terms in database:`);
        
        // Display first 10 terms
        const displayTerms = genreTerms.slice(0, 10);
        displayTerms.forEach((term, index) => {
          console.log(`   ${index + 1}. ${term.name} (${term.slug})`);
        });
        
        if (genreTerms.length > 10) {
          console.log(`   ... and ${genreTerms.length - 10} more`);
        }
        
        return genreTerms.length > 0;
      } catch (error) {
        console.log(`❌ Error retrieving genre terms: ${error.message}`);
        return false;
      }
    });
  }

  async testMangaGenreAssociation() {
    return await this.runTest('Test associating genres with manga', async () => {
      try {
        // Find a genre taxonomy and term
        const genreTaxonomy = await this.db.findTaxonomyByType('genre');
        if (!genreTaxonomy) {
          console.log('❌ Genre taxonomy not found');
          return false;
        }
        
        const genreTerms = await this.db.query(
          'SELECT * FROM taxonomy_terms WHERE taxonomy_id = ? LIMIT 1',
          [genreTaxonomy.id]
        );
        
        if (genreTerms.length === 0) {
          console.log('❌ No genre terms found');
          return false;
        }
        
        const genreTerm = genreTerms[0];
        console.log(`🏷️  Testing with genre: ${genreTerm.name}`);
        
        // Check if there are any manga in the database
        const mangas = await this.db.query('SELECT * FROM mangas LIMIT 1');
        
        if (mangas.length === 0) {
          console.log('⚠️  No manga found in database - creating test manga');
          
          // Create a test manga
          const testMangaId = await this.db.createManga({
            name: 'Test Manga for Genre Association',
            alternative_names: ['Test Manga'],
            description: 'A test manga for testing genre associations',
            status: 'ongoing',
            cover: '',
            slug: 'test-manga-genre-' + Date.now()
          });
          
          console.log(`✅ Created test manga with ID: ${testMangaId}`);
          
          // Associate genre with manga
          await this.db.attachTaxonomyToManga(testMangaId, genreTerm.id);
          console.log(`✅ Associated genre "${genreTerm.name}" with test manga`);
          
          // Verify association
          const associations = await this.db.query(
            'SELECT * FROM manga_taxonomy_terms WHERE manga_id = ? AND taxonomy_term_id = ?',
            [testMangaId, genreTerm.id]
          );
          
          if (associations.length > 0) {
            console.log('✅ Genre association verified in database');
            return true;
          } else {
            console.log('❌ Genre association not found in database');
            return false;
          }
        } else {
          const manga = mangas[0];
          console.log(`📚 Testing with existing manga: ${manga.name}`);
          
          // Check existing associations
          const existingAssociations = await this.db.query(
            'SELECT COUNT(*) as count FROM manga_taxonomy_terms WHERE manga_id = ?',
            [manga.id]
          );
          
          console.log(`📊 Manga has ${existingAssociations[0].count} existing genre associations`);
          return true;
        }
      } catch (error) {
        console.log(`❌ Error testing manga-genre association: ${error.message}`);
        return false;
      }
    });
  }

  async testGenreSlugUniqueness() {
    return await this.runTest('Test genre slug uniqueness', async () => {
      try {
        const genreTaxonomy = await this.db.findTaxonomyByType('genre');
        if (!genreTaxonomy) {
          console.log('❌ Genre taxonomy not found');
          return false;
        }
        
        // Get all genre terms and check for duplicate slugs
        const genreTerms = await this.db.query(
          'SELECT slug, COUNT(*) as count FROM taxonomy_terms WHERE taxonomy_id = ? GROUP BY slug HAVING count > 1',
          [genreTaxonomy.id]
        );
        
        if (genreTerms.length > 0) {
          console.log(`❌ Found ${genreTerms.length} duplicate genre slugs:`);
          genreTerms.forEach(term => {
            console.log(`   "${term.slug}" appears ${term.count} times`);
          });
          return false;
        } else {
          console.log('✅ All genre slugs are unique');
          return true;
        }
      } catch (error) {
        console.log(`❌ Error checking genre slug uniqueness: ${error.message}`);
        return false;
      }
    });
  }

  async testGenreDataIntegrity() {
    return await this.runTest('Test genre data integrity', async () => {
      try {
        const genreTaxonomy = await this.db.findTaxonomyByType('genre');
        if (!genreTaxonomy) {
          console.log('❌ Genre taxonomy not found');
          return false;
        }
        
        // Check for empty or null genre names
        const emptyNames = await this.db.query(
          'SELECT * FROM taxonomy_terms WHERE taxonomy_id = ? AND (name IS NULL OR name = "" OR TRIM(name) = "")',
          [genreTaxonomy.id]
        );
        
        if (emptyNames.length > 0) {
          console.log(`❌ Found ${emptyNames.length} genre terms with empty names`);
          return false;
        }
        
        // Check for empty or null genre slugs
        const emptySlugs = await this.db.query(
          'SELECT * FROM taxonomy_terms WHERE taxonomy_id = ? AND (slug IS NULL OR slug = "" OR TRIM(slug) = "")',
          [genreTaxonomy.id]
        );
        
        if (emptySlugs.length > 0) {
          console.log(`❌ Found ${emptySlugs.length} genre terms with empty slugs`);
          return false;
        }
        
        console.log('✅ All genre terms have valid names and slugs');
        return true;
      } catch (error) {
        console.log(`❌ Error checking genre data integrity: ${error.message}`);
        return false;
      }
    });
  }

  async runAllTests() {
    console.log('🧪 Testing Genres Import to Database');
    console.log('=====================================\n');

    try {
      await this.initialize();

      // Run all tests
      await this.testGenresFileExists();
      await this.testGenresFileStructure();
      await this.testTaxonomyTableExists();
      await this.testGenreTaxonomyExists();
      await this.testCreateGenreTerms();
      await this.testGenreTermRetrieval();
      await this.testMangaGenreAssociation();
      await this.testGenreSlugUniqueness();
      await this.testGenreDataIntegrity();

      // Summary
      console.log('\n=====================================');
      console.log('📊 Test Results Summary');
      console.log('=====================================');
      console.log(`Total tests: ${this.testResults.passed + this.testResults.failed}`);
      console.log(`✅ Passed: ${this.testResults.passed}`);
      console.log(`❌ Failed: ${this.testResults.failed}`);
      console.log(`Success rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);

      if (this.testResults.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        this.testResults.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error.description}: ${error.error}`);
        });
      }

      if (this.testResults.failed === 0) {
        console.log('\n🎉 All genre import tests passed!');
      } else {
        console.log('\n⚠️  Some tests failed. Review the output above.');
      }

      return this.testResults;

    } finally {
      await this.cleanup();
    }
  }
}

async function testGenresImport() {
  const tester = new GenreImportTester();
  return await tester.runAllTests();
}

// Run tests if called directly
if (require.main === module) {
  testGenresImport()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testGenresImport, GenreImportTester };