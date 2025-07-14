#!/usr/bin/env node

const { filterValidGenres, isValidGenre, validGenreNames } = require('./genre-filter');

// Test genres - some valid, some invalid
const testGenres = [
  'アクション', // Valid
  'コメディ', // Valid
  'ドラマ', // Valid
  'ファンタジー', // Valid
  'InvalidGenre', // Invalid - not in genres.json
  'NotAGenre', // Invalid - not in genres.json
  'ホラー', // Valid
  '恋愛', // Valid
  'FakeGenre', // Invalid - not in genres.json
];

console.log('Testing genre filtering...\n');

console.log('--- Valid Genres from genres.json ---');
console.log('Total valid genres:', validGenreNames.size);
console.log('First 10 valid genres:', Array.from(validGenreNames).slice(0, 10));

console.log('\n--- Individual Genre Tests ---');
testGenres.forEach(genre => {
  const isValid = isValidGenre(genre);
  console.log(`${genre}: ${isValid ? 'VALID' : 'INVALID'}`);
});

console.log('\n--- Batch Filtering Test ---');
const filteredGenres = filterValidGenres(testGenres);
console.log('Input genres:', testGenres);
console.log('Filtered genres:', filteredGenres);
console.log('Total input:', testGenres.length);
console.log('Total filtered:', filteredGenres.length);

console.log('\n--- Empty/Null Tests ---');
console.log('filterValidGenres([]):', filterValidGenres([]));
console.log('filterValidGenres(null):', filterValidGenres(null || []));

console.log('\nGenre filtering test completed!');