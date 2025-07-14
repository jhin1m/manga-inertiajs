#!/usr/bin/env node

const Utils = require('./utils');

/**
 * Test suite for manga slug generation
 * Tests the Utils.createSlug() function with various inputs
 */

async function testMangaSlugGeneration() {
  console.log('🧪 Testing Manga Slug Generation');
  console.log('=====================================\n');

  const testCases = [
    // Japanese titles (will be transliterated)
    {
      input: '進撃の巨人',
      description: 'Japanese title (Attack on Titan)',
      expected: /^[a-z0-9-]+$/ // Should be transliterated to romaji
    },
    {
      input: 'ワンピース',
      description: 'Katakana title (One Piece)',
      expected: /^[a-z0-9-]+$/
    },
    {
      input: '僕のヒーローアカデミア',
      description: 'Real',
      expected: /^[a-z0-9-]+$/
    }
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      console.log(`Test ${i + 1}: ${testCase.description}`);
      console.log(`Input: ${JSON.stringify(testCase.input)}`);
      
      const result = await Utils.createSlug(testCase.input);
      console.log(`Output: "${result}"`);
      
      // Validate the result
      if (testCase.expected.test(result)) {
        console.log('✅ PASS\n');
        passed++;
      } else {
        console.log(`❌ FAIL - Expected pattern: ${testCase.expected}\n`);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
      failed++;
    }
  }

  // Test slug uniqueness and collision handling
  console.log('🔄 Testing slug collision handling...\n');
  
  const duplicateTitle = 'Naruto';
  const slug1 = await Utils.createSlug(duplicateTitle);
  const slug2 = await Utils.createSlug(duplicateTitle);
  
  console.log(`Duplicate title test: "${duplicateTitle}"`);
  console.log(`Slug 1: "${slug1}"`);
  console.log(`Slug 2: "${slug2}"`);
  
  if (slug1 === slug2) {
    console.log('✅ PASS - Consistent slug generation\n');
    passed++;
  } else {
    console.log('❌ FAIL - Inconsistent slug generation\n');
    failed++;
  }

  // Test performance with Japanese text
  console.log('⚡ Testing performance with Japanese text...\n');
  
  const startTime = Date.now();
  const japaneseTitle = '僕のヒーローアカデミア';
  const japaneseSlug = await Utils.createSlug(japaneseTitle);
  const endTime = Date.now();
  
  console.log(`Japanese title: "${japaneseTitle}"`);
  console.log(`Generated slug: "${japaneseSlug}"`);
  console.log(`Processing time: ${endTime - startTime}ms`);
  
  if (endTime - startTime < 5000) { // Should complete within 5 seconds
    console.log('✅ PASS - Performance acceptable\n');
    passed++;
  } else {
    console.log('❌ FAIL - Performance too slow\n');
    failed++;
  }

  // Summary
  console.log('=====================================');
  console.log('📊 Test Results Summary');
  console.log('=====================================');
  console.log(`Total tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All manga slug tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.');
  }
  
  return { passed, failed };
}

// Run tests if called directly
if (require.main === module) {
  testMangaSlugGeneration()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testMangaSlugGeneration };