#!/usr/bin/env node

const { mapGenresToDatabase, isValidDatabaseGenre } = require('./genre-mapping');

// Test Japanese genres from genres.json
const testGenres = [
  'アクション', // Action
  'コメディ', // Comedy
  'ドラマ', // Drama
  'ファンタジー', // Fantasy
  'ホラー', // Horror
  '恋愛', // Romance
  '少年向け', // Shounen
  '少女向け', // Shoujo
  '青年向け', // Seinen
  '女性向け', // Josei
  'ＳＦ', // Sci-Fi
  'ミステリー', // Mystery
  'スポーツ', // Sports
  '学園物', // School
  '歴史', // Historical
  'エッチ', // Ecchi
  'やおい', // Yaoi
  '百合', // Yuri
  'アダルト', // Adult (should be filtered out)
  'エロ', // Explicit (should be filtered out)
  'グルメ', // Food (no mapping)
  '音楽系', // Music (no mapping)
];

console.log('Testing genre mapping...\n');

console.log('--- Individual Genre Tests ---');
testGenres.forEach(genre => {
  const mapped = mapGenresToDatabase([genre]);
  console.log(`${genre} -> ${mapped.length > 0 ? mapped[0] : 'FILTERED OUT'}`);
});

console.log('\n--- Batch Mapping Test ---');
const mappedGenres = mapGenresToDatabase(testGenres);
console.log('Input genres:', testGenres);
console.log('Mapped genres:', mappedGenres);
console.log('Total input:', testGenres.length);
console.log('Total mapped:', mappedGenres.length);

console.log('\n--- Database Genre Validation ---');
const testDbGenres = ['Action', 'Comedy', 'InvalidGenre', 'Romance', 'NotAGenre'];
testDbGenres.forEach(genre => {
  console.log(`${genre} is valid: ${isValidDatabaseGenre(genre)}`);
});

console.log('\n--- Duplicate Prevention Test ---');
const duplicateGenres = ['アクション', 'アクション', 'コメディ', 'コメディ', 'ドラマ'];
const mappedDuplicates = mapGenresToDatabase(duplicateGenres);
console.log('Input with duplicates:', duplicateGenres);
console.log('Mapped without duplicates:', mappedDuplicates);

console.log('\nGenre mapping test completed!');