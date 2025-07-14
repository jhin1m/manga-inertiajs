const fs = require('fs');
const path = require('path');

// Load genres from genres.json
const genresPath = path.join(__dirname, 'genres.json');
const validGenres = JSON.parse(fs.readFileSync(genresPath, 'utf8'));

// Create a Set of valid genre names for fast lookup
const validGenreNames = new Set(validGenres.map(g => g.genre));

/**
 * Filter genres to only include those in genres.json
 * @param {string[]} genres - Array of genre names to filter
 * @returns {string[]} Array of valid genre names
 */
function filterValidGenres(genres) {
  return genres.filter(genre => validGenreNames.has(genre));
}

/**
 * Check if a genre is valid (exists in genres.json)
 * @param {string} genre - Genre name to check
 * @returns {boolean} True if genre exists in genres.json
 */
function isValidGenre(genre) {
  return validGenreNames.has(genre);
}

module.exports = {
  validGenres,
  validGenreNames,
  filterValidGenres,
  isValidGenre
};