# Manga Crawler Test Suite

Bộ test comprehensive cho manga-crawler bao gồm kiểm tra các chức năng chính của hệ thống crawler.

## 📋 Test Suites

### 1. Test Tạo Slug Manga (`test-manga-slug.js`)
Kiểm tra chức năng tạo slug cho tên manga với hỗ trợ:
- ✅ Tiếng Anh (One Piece → one-piece)
- ✅ Tiếng Nhật (進撃の巨人 → transliterated romaji)
- ✅ Katakana (ワンピース → transliterated romaji) 
- ✅ Mixed languages (Tokyo Ghoul 東京喰種)
- ✅ Special characters và edge cases
- ✅ Performance testing
- ✅ Consistency testing

### 2. Test Tạo Slug Chapter (`test-chapter-slug.js`)
Kiểm tra chức năng tạo slug cho chapter với pattern đặc biệt:
- ✅ Japanese pattern: 第1話 → di-1hua
- ✅ Japanese với title: 第5話 始まり → di-5hua-hajimari
- ✅ English formats: Chapter 1, Ch. 25, Episode 10
- ✅ Special chapters: Prologue, Epilogue, Extra, Bonus
- ✅ Edge cases và cleanup functionality
- ✅ Performance testing với bulk generation

### 3. Test Import Genres vào Database (`test-genres-import.js`)
Kiểm tra hệ thống taxonomy và import genres:
- ✅ Validation của genres.json file structure
- ✅ Kiểm tra taxonomy tables existence
- ✅ Tạo genre taxonomy terms
- ✅ Association manga với genres
- ✅ Slug uniqueness validation
- ✅ Data integrity checks

## 🚀 Cách Chạy Tests

### Chạy Tất Cả Tests
```bash
# Sử dụng npm script
npm test

# Hoặc chạy trực tiếp
node run-tests.js
```

### Chạy Individual Test Suites
```bash
# Test manga slug generation
npm run test:manga-slug
# hoặc: node test-manga-slug.js

# Test chapter slug generation  
npm run test:chapter-slug
# hoặc: node test-chapter-slug.js

# Test genres import
npm run test:genres
# hoặc: node test-genres-import.js
```

## 📊 Test Output Format

Mỗi test suite sẽ hiển thị:
- 📝 **Test Description**: Mô tả test case
- 📥 **Input**: Dữ liệu đầu vào  
- 📤 **Output**: Kết quả generated
- ✅/❌ **Result**: Pass/Fail status
- 📊 **Summary**: Tổng kết passed/failed tests

## 🔧 Prerequisites

Đảm bảo các dependencies đã được cài đặt:

```bash
cd manga-crawler
npm install
```

### Required Files:
- ✅ `utils.js` - Utility functions với slug generation
- ✅ `database.js` - Database connection và operations  
- ✅ `genres.json` - Genres data file
- ✅ `config.js` - Configuration file

### Required Packages:
- ✅ `slugify` - Slug generation
- ✅ `mysql2` - Database connection
- ✅ `kuroshiro` - Japanese text processing
- ✅ `kuroshiro-analyzer-kuromoji` - Japanese analyzer

## 🗄️ Database Requirements

Để chạy genres import tests, cần có các bảng sau trong database:

```sql
-- Taxonomies table
CREATE TABLE taxonomies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Taxonomy terms table  
CREATE TABLE taxonomy_terms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  taxonomy_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (taxonomy_id) REFERENCES taxonomies(id),
  UNIQUE KEY unique_taxonomy_slug (taxonomy_id, slug)
);

-- Manga taxonomy association table
CREATE TABLE manga_taxonomy_terms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manga_id INT NOT NULL,
  taxonomy_term_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_manga_term (manga_id, taxonomy_term_id)
);
```

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Kiểm tra config.js database settings
   - Đảm bảo MySQL service đang chạy
   - Verify database credentials

2. **Kuroshiro Initialization Failed**
   - Check kuromoji dictionaries installation
   - Verify Kuroshiro packages are installed correctly

3. **Missing Dependencies**
   - Run `npm install` in manga-crawler directory
   - Check package.json dependencies

4. **Permission Denied**
   - Ensure test files are executable: `chmod +x test-*.js run-tests.js`

### Debug Mode:
Add verbose logging by setting environment variable:
```bash
DEBUG=true npm test
```

## 📈 Expected Results

### Successful Test Run:
```
🎉 ALL TESTS PASSED! 🎉
The manga-crawler functionality is working correctly.

📊 Statistics:
   Total Tests: 45
   ✅ Passed: 45  
   ❌ Failed: 0
   📈 Success Rate: 100.0%
```

### Failed Test Example:
```
⚠️ 2 TEST(S) FAILED
Please review the failed tests above and fix any issues.

💡 Recommendations:
   • Manga Slug Generation:
     - Check if Kuroshiro is properly initialized
     - Verify slugify library is installed
```

## 🔍 Test Coverage

- **Slug Generation**: 25+ test cases covering various input types
- **Chapter Processing**: 20+ test cases với Japanese patterns
- **Database Operations**: 10+ tests cho taxonomy system
- **Edge Cases**: Null, undefined, empty strings, special characters
- **Performance**: Bulk processing và timing tests
- **Data Integrity**: Uniqueness, validation, cleanup

## 📝 Adding New Tests

Để thêm test cases mới:

1. **Tạo test file mới** theo pattern `test-feature-name.js`
2. **Export test function** để có thể import vào run-tests.js
3. **Update run-tests.js** để include test suite mới
4. **Add npm script** trong package.json nếu cần

Example test function structure:
```javascript
async function testNewFeature() {
  const testCases = [
    { input: 'test', expected: /pattern/, description: 'Test case' }
  ];
  
  let passed = 0, failed = 0;
  
  // Run test cases...
  
  return { passed, failed };
}

module.exports = { testNewFeature };
```

---

## 📞 Support

Nếu gặp vấn đề với test suite, kiểm tra:
1. Database connection và schema
2. Required dependencies installation  
3. File permissions
4. Configuration settings

Happy testing! 🧪✨