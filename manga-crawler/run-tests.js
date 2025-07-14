#!/usr/bin/env node

const { testMangaSlugGeneration } = require('./test-manga-slug');
const { testChapterSlugGeneration } = require('./test-chapter-slug');
const { testGenresImport } = require('./test-genres-import');

/**
 * Comprehensive test runner for manga-crawler
 * Runs all available test suites and provides summary
 */

class TestRunner {
  constructor() {
    this.results = {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      suites: []
    };
  }

  async runTestSuite(name, testFunction) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Running Test Suite: ${name}`);
    console.log(`${'='.repeat(60)}`);
    
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const suiteResult = {
        name,
        passed: result.passed || 0,
        failed: result.failed || 0,
        duration,
        status: (result.failed || 0) === 0 ? 'PASSED' : 'FAILED'
      };
      
      this.results.suites.push(suiteResult);
      this.results.totalTests += suiteResult.passed + suiteResult.failed;
      this.results.totalPassed += suiteResult.passed;
      this.results.totalFailed += suiteResult.failed;
      
      console.log(`\n📊 Suite Summary: ${name}`);
      console.log(`   Status: ${suiteResult.status === 'PASSED' ? '✅' : '❌'} ${suiteResult.status}`);
      console.log(`   Tests: ${suiteResult.passed + suiteResult.failed}`);
      console.log(`   Passed: ${suiteResult.passed}`);
      console.log(`   Failed: ${suiteResult.failed}`);
      console.log(`   Duration: ${duration}ms`);
      
      return suiteResult.status === 'PASSED';
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const suiteResult = {
        name,
        passed: 0,
        failed: 1,
        duration,
        status: 'ERROR',
        error: error.message
      };
      
      this.results.suites.push(suiteResult);
      this.results.totalTests += 1;
      this.results.totalFailed += 1;
      
      console.log(`\n📊 Suite Summary: ${name}`);
      console.log(`   Status: ❌ ERROR`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Duration: ${duration}ms`);
      
      return false;
    }
  }

  printOverallSummary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🏁 OVERALL TEST RESULTS');
    console.log(`${'='.repeat(60)}`);
    
    // Overall statistics
    const successRate = this.results.totalTests > 0 
      ? ((this.results.totalPassed / this.results.totalTests) * 100).toFixed(1)
      : '0.0';
    
    const totalDuration = this.results.suites.reduce((sum, suite) => sum + suite.duration, 0);
    
    console.log(`📊 Statistics:`);
    console.log(`   Total Tests: ${this.results.totalTests}`);
    console.log(`   ✅ Passed: ${this.results.totalPassed}`);
    console.log(`   ❌ Failed: ${this.results.totalFailed}`);
    console.log(`   📈 Success Rate: ${successRate}%`);
    console.log(`   ⏱️  Total Duration: ${totalDuration}ms`);
    
    // Suite breakdown
    console.log(`\n📋 Suite Breakdown:`);
    this.results.suites.forEach((suite, index) => {
      const statusIcon = suite.status === 'PASSED' ? '✅' : suite.status === 'FAILED' ? '❌' : '💥';
      const successRate = suite.passed + suite.failed > 0 
        ? ((suite.passed / (suite.passed + suite.failed)) * 100).toFixed(1)
        : '0.0';
      
      console.log(`   ${index + 1}. ${statusIcon} ${suite.name}`);
      console.log(`      Tests: ${suite.passed + suite.failed} | Passed: ${suite.passed} | Failed: ${suite.failed}`);
      console.log(`      Success Rate: ${successRate}% | Duration: ${suite.duration}ms`);
      
      if (suite.error) {
        console.log(`      Error: ${suite.error}`);
      }
    });
    
    // Final verdict
    const allPassed = this.results.totalFailed === 0;
    console.log(`\n🎯 Final Verdict:`);
    
    if (allPassed) {
      console.log('   🎉 ALL TESTS PASSED! 🎉');
      console.log('   The manga-crawler functionality is working correctly.');
    } else {
      console.log(`   ⚠️  ${this.results.totalFailed} TEST(S) FAILED`);
      console.log('   Please review the failed tests above and fix any issues.');
      
      // Provide recommendations
      const failedSuites = this.results.suites.filter(suite => suite.status !== 'PASSED');
      if (failedSuites.length > 0) {
        console.log(`\n💡 Recommendations:`);
        
        failedSuites.forEach(suite => {
          console.log(`   • ${suite.name}:`);
          
          if (suite.name.includes('Slug')) {
            console.log('     - Check if Kuroshiro is properly initialized');
            console.log('     - Verify slugify library is installed');
            console.log('     - Ensure Japanese text processing is working');
          } else if (suite.name.includes('Genre')) {
            console.log('     - Verify database connection and schema');
            console.log('     - Check if taxonomy tables exist');
            console.log('     - Ensure genres.json file is present and valid');
          }
        });
      }
    }
    
    return allPassed;
  }

  async runAllTests() {
    console.log('🧪 Manga Crawler Test Suite');
    console.log('============================');
    console.log('Running comprehensive tests for manga-crawler functionality...\n');
    
    const startTime = Date.now();
    
    // Define test suites
    const testSuites = [
      {
        name: 'Manga Slug Generation',
        testFunction: testMangaSlugGeneration,
        description: 'Tests slug generation for manga titles with Japanese text support'
      },
      {
        name: 'Chapter Slug Generation', 
        testFunction: testChapterSlugGeneration,
        description: 'Tests slug generation for chapter titles with Japanese pattern recognition'
      },
      {
        name: 'Genres Import to Database',
        testFunction: testGenresImport,
        description: 'Tests genre taxonomy system and database import functionality'
      }
    ];
    
    // Print test plan
    console.log('📋 Test Plan:');
    testSuites.forEach((suite, index) => {
      console.log(`   ${index + 1}. ${suite.name}`);
      console.log(`      ${suite.description}`);
    });
    
    console.log(`\n⏱️  Starting ${testSuites.length} test suites...\n`);
    
    // Run each test suite
    let allPassed = true;
    for (const suite of testSuites) {
      const passed = await this.runTestSuite(suite.name, suite.testFunction);
      if (!passed) {
        allPassed = false;
      }
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // Print overall summary
    this.printOverallSummary();
    
    console.log(`\n⏱️  Total execution time: ${totalDuration}ms`);
    console.log(`${'='.repeat(60)}\n`);
    
    return allPassed;
  }
}

// Helper function to check prerequisites
async function checkPrerequisites() {
  console.log('🔍 Checking Prerequisites...');
  
  const checks = [];
  
  // Check if required files exist
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    await fs.access(path.join(__dirname, 'utils.js'));
    checks.push({ name: 'utils.js', status: '✅ Found' });
  } catch {
    checks.push({ name: 'utils.js', status: '❌ Missing' });
  }
  
  try {
    await fs.access(path.join(__dirname, 'database.js'));
    checks.push({ name: 'database.js', status: '✅ Found' });
  } catch {
    checks.push({ name: 'database.js', status: '❌ Missing' });
  }
  
  try {
    await fs.access(path.join(__dirname, 'genres.json'));
    checks.push({ name: 'genres.json', status: '✅ Found' });
  } catch {
    checks.push({ name: 'genres.json', status: '❌ Missing' });
  }
  
  try {
    await fs.access(path.join(__dirname, 'config.js'));
    checks.push({ name: 'config.js', status: '✅ Found' });
  } catch {
    checks.push({ name: 'config.js', status: '❌ Missing' });
  }
  
  // Check if required packages are installed
  try {
    require('slugify');
    checks.push({ name: 'slugify package', status: '✅ Installed' });
  } catch {
    checks.push({ name: 'slugify package', status: '❌ Missing' });
  }
  
  try {
    require('mysql2/promise');
    checks.push({ name: 'mysql2 package', status: '✅ Installed' });
  } catch {
    checks.push({ name: 'mysql2 package', status: '❌ Missing' });
  }
  
  checks.forEach(check => {
    console.log(`   ${check.status} ${check.name}`);
  });
  
  const missingItems = checks.filter(check => check.status.includes('❌'));
  
  if (missingItems.length > 0) {
    console.log(`\n⚠️  Warning: ${missingItems.length} prerequisites are missing.`);
    console.log('Some tests may fail due to missing dependencies.');
    return false;
  } else {
    console.log('\n✅ All prerequisites check passed!');
    return true;
  }
}

// Main execution
async function main() {
  try {
    // Check prerequisites
    await checkPrerequisites();
    
    // Run all tests
    const runner = new TestRunner();
    const allPassed = await runner.runAllTests();
    
    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { TestRunner, checkPrerequisites };