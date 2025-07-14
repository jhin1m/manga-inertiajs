#!/usr/bin/env node

/**
 * Test script for S3 uploader - processes only a small batch for testing
 */

const S3ImageUploader = require('./s3-uploader');

async function testUpload() {
  console.log('🧪 Starting S3 Upload Test (Limited Batch)');
  console.log('==========================================\n');
  
  const uploader = new S3ImageUploader();
  
  try {
    // Test with only 5 pages maximum
    await uploader.uploadImages(5, 5);
    
    console.log('\n✅ Test completed successfully!');
    console.log('If the test looks good, run the full upload with:');
    console.log('node s3-uploader.js [batch_size] [max_pages]');
    console.log('Example: node s3-uploader.js 50 1000');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. Database connection settings in config.js');
    console.log('2. AWS S3 credentials in .env file');
    console.log('3. Proxy configuration in proxies.txt');
    process.exit(1);
  }
}

testUpload();