const fs = require('fs');
const path = require('path');

// Load genres from genres.json
const genresPath = path.join(__dirname, 'genres.json');
const validGenres = JSON.parse(fs.readFileSync(genresPath, 'utf8'));

// Create a Set of valid genre names for fast lookup
const validGenreNames = new Set(validGenres.map(g => g.genre));

// Create genre mapping for common API variations
const genreMapping = {
  'ロマンス': '恋愛',  // API uses ロマンス, but we have 恋愛 (Romance)
  'アクション': 'アクション',  // Both use same
  'ドラマ': 'ドラマ',  // Both use same
  'コメディ': 'コメディ',  // Both use same
  'ファンタジー': 'ファンタジー',  // Both use same
  'ホラー': 'ホラー',  // Both use same
  'ミステリー': 'ミステリー',  // Both use same
  'ＳＦ': 'ＳＦ',  // Both use same
  'スポーツ': 'スポーツ',  // Both use same
  'スリラー': 'スリラー',  // Both use same
  'サスペンス': 'サスペンス',  // Both use same
  'エッチ': 'エッチ',  // Both use same
  'ハーレム': 'ハーレム',  // Both use same
  'メカ': 'メカ',  // Both use same
  'スマット': 'スマット',  // Both use same
  'やおい': 'やおい',  // Both use same
  '百合': '百合',  // Both use same
  'ボーイズラブ': 'ボーイズラブ',  // Both use same
  'ガールズラブ': 'ガールズラブ',  // Both use same
  '少年愛': '少年愛',  // Both use same
  '少女愛': '少女愛',  // Both use same
  'エロ': 'エロ',  // Both use same
  'アダルト': 'アダルト',  // Both use same
  '成人向け': '成人向け',  // Both use same
  '変態': '変態',  // Both use same
  'ロリコン': 'ロリコン',  // Both use same
  'ショタコン': 'ショタコン',  // Both use same
  '冒険': '冒険',  // Both use same
  '歴史': '歴史',  // Both use same
  '音楽系': '音楽系',  // Both use same
  '心理': '心理',  // Both use same
  '学園物': '学園物',  // Both use same
  '日常系': '日常系',  // Both use same
  '超能力': '超能力',  // Both use same
  '悲劇': '悲劇',  // Both use same
  '格闘技': '格闘技',  // Both use same
  '魔法少女': '魔法少女',  // Both use same
  '性転換': '性転換',  // Both use same
  'グルメ': 'グルメ',  // Both use same
  '前衛系': '前衛系',  // Both use same
  '受賞作': '受賞作',  // Both use same
  '同人誌': '同人誌',  // Both use same
  '女性向け': '女性向け',  // Both use same
  '青年向け': '青年向け',  // Both use same
  '少女向け': '少女向け',  // Both use same
  '少年向け': '少年向け',  // Both use same
};

/**
 * Normalize genre name using mapping
 * @param {string} genre - Genre name to normalize
 * @returns {string} Normalized genre name
 */
function normalizeGenre(genre) {
  return genreMapping[genre] || genre;
}

/**
 * Filter genres to only include those in genres.json
 * @param {string[]} genres - Array of genre names to filter
 * @returns {string[]} Array of valid genre names
 */
function filterValidGenres(genres) {
  return genres
    .map(genre => normalizeGenre(genre))
    .filter(genre => validGenreNames.has(genre));
}

/**
 * Check if a genre is valid (exists in genres.json)
 * @param {string} genre - Genre name to check
 * @returns {boolean} True if genre exists in genres.json
 */
function isValidGenre(genre) {
  const normalized = normalizeGenre(genre);
  return validGenreNames.has(normalized);
}

module.exports = {
  validGenres,
  validGenreNames,
  filterValidGenres,
  isValidGenre,
  normalizeGenre,
  genreMapping
};