#!/usr/bin/env node

const Utils = require('./utils');

/**
 * Test suite for chapter slug generation
 * Tests the Utils.createChapterSlug() function with various inputs
 */

async function testChapterSlugGeneration() {
  console.log('🧪 Testing Chapter Slug Generation');
  console.log('=====================================\n');

  const testCases = [
    // Japanese chapter patterns (第X話)
    {
      input: '第1話',
      description: 'Basic Japanese chapter pattern',
      expected: /^di-1hua$/
    },
    {
      input: '第10話',
      description: 'Double digit Japanese chapter',
      expected: /^di-10hua$/
    },
    {
      input: '第1.5話',
      description: 'Decimal Japanese chapter',
      expected: /^di-1\.5hua$/
    },
    {
      input: '第100話',
      description: 'Triple digit Japanese chapter',
      expected: /^di-100hua$/
    },
    
    // Japanese chapters with additional text
    {
      input: '第1話 始まり',
      description: 'Japanese chapter with title',
      expected: /^di-1hua-[a-z0-9-]+$/
    },
    {
      input: '第5話: 戦いの始まり',
      description: 'Japanese chapter with colon and title',
      expected: /^di-5hua-[a-z0-9-]+$/
    },
    {
      input: '第12話 - The Beginning',
      description: 'Japanese chapter with English subtitle',
      expected: /^di-12hua-the-beginning$/
    },
    
    // Non-Japanese chapter patterns
    {
      input: 'Chapter 1',
      description: 'English chapter format',
      expected: /^[a-z0-9-]+$/
    },
    {
      input: 'Chapter 1: The Start',
      description: 'English chapter with title',
      expected: /^chapter-1-the-start$/
    },
    {
      input: 'Ch. 25',
      description: 'Abbreviated chapter format',
      expected: /^ch-25$/
    },
    {
      input: 'Episode 10',
      description: 'Episode format',
      expected: /^episode-10$/
    },
    
    // Mixed formats
    {
      input: 'Vol.1 Chapter 1',
      description: 'Volume and chapter format',
      expected: /^vol-1-chapter-1$/
    },
    {
      input: 'One Shot',
      description: 'One shot format',
      expected: /^one-shot$/
    },
    {
      input: 'Prologue',
      description: 'Prologue chapter',
      expected: /^prologue$/
    },
    {
      input: 'Epilogue',
      description: 'Epilogue chapter',
      expected: /^epilogue$/
    },
    
    // Special cases
    {
      input: 'Extra 1',
      description: 'Extra chapter',
      expected: /^extra-1$/
    },
    {
      input: 'Bonus Chapter',
      description: 'Bonus chapter',
      expected: /^bonus-chapter$/
    },
    {
      input: 'Side Story 1',
      description: 'Side story',
      expected: /^side-story-1$/
    },
    
    // Edge cases
    {
      input: '',
      description: 'Empty string',
      expected: /^untitled-\d+$/
    },
    {
      input: null,
      description: 'Null input',
      expected: /^untitled-\d+$/
    },
    {
      input: undefined,
      description: 'Undefined input',
      expected: /^untitled-\d+$/
    },
    {
      input: '   ',
      description: 'Whitespace only',
      expected: /^untitled-\d+$/
    },
    
    // Complex Japanese patterns
    {
      input: '第1話「新しい始まり」',
      description: 'Japanese with quotes',
      expected: /^di-1hua-[a-z0-9-]+$/
    },
    {
      input: '第20話　最終決戦',
      description: 'Japanese with full-width space',
      expected: /^di-20hua-[a-z0-9-]+$/
    },
    
    // Numbers only
    {
      input: '1',
      description: 'Number only',
      expected: /^1$/
    },
    {
      input: '25.5',
      description: 'Decimal number only',
      expected: /^25-5$/
    },
    
    // Special characters
    {
      input: 'Chapter 1!!!',
      description: 'Chapter with exclamation marks',
      expected: /^chapter-1$/
    },
    {
      input: 'Ch@pter 1',
      description: 'Chapter with special characters',
      expected: /^ch-pter-1$/
    },
    
    // Long titles
    {
      input: '第1話 非常に長いタイトルのチャプターテスト',
      description: 'Very long Japanese chapter title',
      expected: /^di-1hua-[a-z0-9-]+$/
    }
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      console.log(`Test ${i + 1}: ${testCase.description}`);
      console.log(`Input: ${JSON.stringify(testCase.input)}`);
      
      const result = await Utils.createChapterSlug(testCase.input);
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

  // Test specific Japanese pattern extraction
  console.log('🎯 Testing Japanese pattern extraction...\n');
  
  const japanesePatternTests = [
    { input: '第1話', expectedNumber: '1' },
    { input: '第10話', expectedNumber: '10' },
    { input: '第1.5話', expectedNumber: '1.5' },
    { input: '第100話', expectedNumber: '100' }
  ];
  
  for (const test of japanesePatternTests) {
    const slug = await Utils.createChapterSlug(test.input);
    const expectedPattern = `di-${test.expectedNumber}hua`;
    
    console.log(`Japanese pattern test: "${test.input}"`);
    console.log(`Expected pattern: "${expectedPattern}"`);
    console.log(`Generated slug: "${slug}"`);
    
    if (slug === expectedPattern) {
      console.log('✅ PASS\n');
      passed++;
    } else {
      console.log('❌ FAIL\n');
      failed++;
    }
  }

  // Test consistency
  console.log('🔄 Testing slug consistency...\n');
  
  const consistencyTitle = '第5話 テスト';
  const slug1 = await Utils.createChapterSlug(consistencyTitle);
  const slug2 = await Utils.createChapterSlug(consistencyTitle);
  
  console.log(`Consistency test: "${consistencyTitle}"`);
  console.log(`Slug 1: "${slug1}"`);
  console.log(`Slug 2: "${slug2}"`);
  
  if (slug1 === slug2) {
    console.log('✅ PASS - Consistent slug generation\n');
    passed++;
  } else {
    console.log('❌ FAIL - Inconsistent slug generation\n');
    failed++;
  }

  // Test performance
  console.log('⚡ Testing performance...\n');
  
  const startTime = Date.now();
  const performanceTests = [];
  
  for (let i = 1; i <= 100; i++) {
    performanceTests.push(Utils.createChapterSlug(`第${i}話`));
  }
  
  await Promise.all(performanceTests);
  const endTime = Date.now();
  
  console.log(`Generated 100 chapter slugs in ${endTime - startTime}ms`);
  
  if (endTime - startTime < 10000) { // Should complete within 10 seconds
    console.log('✅ PASS - Performance acceptable\n');
    passed++;
  } else {
    console.log('❌ FAIL - Performance too slow\n');
    failed++;
  }

  // Test slug cleanup
  console.log('🧹 Testing slug cleanup functionality...\n');
  
  const cleanupTests = [
    { input: 'test---slug', description: 'Multiple dashes' },
    { input: '-test-slug-', description: 'Leading/trailing dashes' },
    { input: '---test---slug---', description: 'Multiple leading/trailing dashes' }
  ];
  
  for (const test of cleanupTests) {
    const cleanedSlug = Utils.cleanupSlug(test.input);
    console.log(`Cleanup test (${test.description}): "${test.input}" → "${cleanedSlug}"`);
    
    if (!cleanedSlug.startsWith('-') && !cleanedSlug.endsWith('-') && !cleanedSlug.includes('--')) {
      console.log('✅ PASS\n');
      passed++;
    } else {
      console.log('❌ FAIL - Slug not properly cleaned\n');
      failed++;
    }
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
    console.log('\n🎉 All chapter slug tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.');
  }
  
  return { passed, failed };
}

// Run tests if called directly
if (require.main === module) {
  testChapterSlugGeneration()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testChapterSlugGeneration };