const fs = require('fs');
const path = require('path');

// Load genres from genres.json
const genresPath = path.join(__dirname, 'genres.json');
const validGenres = JSON.parse(fs.readFileSync(genresPath, 'utf8'));

// Create a Set of valid genre names for fast lookup
const validGenreNames = new Set(validGenres.map(g => g.genre));

// Create lookup maps for flexible genre matching
const genreByJapanese = new Map(validGenres.map(g => [g.genre, g.genre]));
const genreByEnglish = new Map(validGenres.map(g => [g.genre_en?.toLowerCase(), g.genre]));

// Common Japanese romanizations and synonyms
const genreSynonyms = {
  'ロマンス': '恋愛',      // Romance romanization -> Japanese word
  'アクション': 'アクション',  // Action (already matches)
  'ドラマ': 'ドラマ',       // Drama (already matches)
  'コメディ': 'コメディ',    // Comedy (already matches)
  'ファンタジー': 'ファンタジー', // Fantasy (already matches)
  'ホラー': 'ホラー',       // Horror (already matches)
  'ミステリー': 'ミステリー',  // Mystery (already matches)
  'サスペンス': 'サスペンス',  // Suspense (already matches)
  'スリラー': 'スリラー',    // Thriller (already matches)
  'romance': '恋愛',       // English romance -> Japanese
  'action': 'アクション',    // English action -> Japanese
  'drama': 'ドラマ',       // English drama -> Japanese
  'comedy': 'コメディ',     // English comedy -> Japanese
  'fantasy': 'ファンタジー', // English fantasy -> Japanese
  'horror': 'ホラー',      // English horror -> Japanese
  'mystery': 'ミステリー',  // English mystery -> Japanese
  'suspense': 'サスペンス', // English suspense -> Japanese
  'thriller': 'スリラー',   // English thriller -> Japanese
};

/**
 * Find matching genre name in database
 * @param {string} apiGenre - Genre name from API
 * @returns {string|null} Matching database genre name or null if not found
 */
function findMatchingGenre(apiGenre) {
  // Try exact match with Japanese names first
  if (genreByJapanese.has(apiGenre)) {
    return apiGenre;
  }
  
  // Try common synonyms and romanizations
  const synonym = genreSynonyms[apiGenre] || genreSynonyms[apiGenre.toLowerCase()];
  if (synonym && genreByJapanese.has(synonym)) {
    return synonym;
  }
  
  // Try matching with English names (case-insensitive)
  const englishMatch = genreByEnglish.get(apiGenre.toLowerCase());
  if (englishMatch) {
    return englishMatch;
  }
  
  // Try partial matching for common variations
  const apiLower = apiGenre.toLowerCase();
  
  // Check if API genre matches any English name
  for (const [englishName, dbGenre] of genreByEnglish) {
    if (englishName && (englishName === apiLower || englishName.includes(apiLower) || apiLower.includes(englishName))) {
      return dbGenre;
    }
  }
  
  return null;
}

/**
 * Filter genres to only include those in genres.json
 * @param {string[]} genres - Array of genre names to filter
 * @returns {string[]} Array of valid genre names from database
 */
function filterValidGenres(genres) {
  return genres
    .map(genre => findMatchingGenre(genre))
    .filter(genre => genre !== null);
}

/**
 * Check if a genre is valid (exists in genres.json)
 * @param {string} genre - Genre name to check
 * @returns {boolean} True if genre exists in genres.json
 */
function isValidGenre(genre) {
  return findMatchingGenre(genre) !== null;
}

/**
 * Get the database genre name for an API genre
 * @param {string} apiGenre - Genre name from API
 * @returns {string} Database genre name
 */
function normalizeGenre(apiGenre) {
  return findMatchingGenre(apiGenre) || apiGenre;
}

module.exports = {
  validGenres,
  validGenreNames,
  filterValidGenres,
  isValidGenre,
  normalizeGenre,
  findMatchingGenre
};