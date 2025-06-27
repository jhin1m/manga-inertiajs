# Database Indexes Documentation

## 📊 Tổng quan về Indexes

Dự án Manga Reader đã được tối ưu với các indexes quan trọng để đảm bảo hiệu suất tốt nhất cho các truy vấn phổ biến.

## 🗂️ Danh sách Indexes

### 1. **MANGAS Table**

#### Indexes cơ bản (từ migration gốc):
- `mangas_slug_unique` - Unique index cho slug
- `idx_mangas_status_created_at` - Composite index cho filter theo status và sort theo ngày tạo
- `idx_mangas_views_created_at` - Composite index cho sort theo views và ngày tạo

#### Indexes bổ sung (performance optimization):
- `idx_mangas_name` - Index cho tìm kiếm alphabetical và sorting theo tên
- `idx_mangas_updated_at` - Index cho sort theo recent updates
- `idx_mangas_status_views` - Composite index cho filter status + sort views
- `idx_mangas_status_updated` - Composite index cho filter status + sort updates
- `idx_mangas_views_desc` - Index cho sort popularity (views descending)
- `idx_mangas_search` - FULLTEXT index cho search trong name và description (MySQL only)

**Lý do cần thiết:**
- Tìm kiếm manga theo tên
- Filter theo status (ongoing, completed, hiatus, cancelled)
- Sort theo popularity (views)
- Sort theo recent updates
- Full-text search trong tên và mô tả

### 2. **CHAPTERS Table**

#### Indexes cơ bản:
- `chapters_manga_id_chapter_number_unique` - Unique constraint
- `idx_chapters_manga_id` - Foreign key index
- `idx_chapters_manga_published_at` - Composite index cho manga + published date
- `idx_chapters_manga_chapter_number` - Composite index cho manga + chapter number

#### Indexes bổ sung:
- `idx_chapters_published_at` - Index cho chronological sorting
- `idx_chapters_volume` - Index cho filter theo volume
- `idx_chapters_manga_pub_num` - Complex composite index (manga_id, published_at, chapter_number)
- `idx_chapters_manga_volume` - Composite index (manga_id, volume_number)

**Lý do cần thiết:**
- Load chapters của một manga
- Sort chapters theo thứ tự xuất bản
- Filter chapters theo volume
- Navigation giữa các chapters

### 3. **PAGES Table**

#### Indexes cơ bản:
- `pages_chapter_id_page_number_unique` - Unique constraint
- `idx_pages_chapter_page_number` - Composite index cho chapter + page number

#### Indexes bổ sung:
- `idx_pages_image_url` - Index cho check duplicate images

**Lý do cần thiết:**
- Load pages của một chapter
- Navigation giữa các pages
- Kiểm tra duplicate images

### 4. **TAXONOMIES Table**

#### Indexes:
- `taxonomies_name_unique` - Unique constraint cho name
- `taxonomies_slug_unique` - Unique constraint cho slug
- `idx_taxonomies_name_slug` - Composite index

**Lý do cần thiết:**
- Lookup taxonomies theo name hoặc slug
- Đảm bảo uniqueness

### 5. **TAXONOMY_TERMS Table**

#### Indexes cơ bản:
- `taxonomy_terms_taxonomy_id_slug_unique` - Unique constraint
- `idx_taxonomy_terms_taxonomy_name` - Composite index cho taxonomy + name

#### Indexes bổ sung:
- `idx_taxonomy_terms_name` - Index cho alphabetical sorting

**Lý do cần thiết:**
- Load terms của một taxonomy
- Sort terms alphabetically
- Lookup terms theo name

### 6. **MANGA_TAXONOMY_TERMS Table**

#### Indexes cơ bản:
- `manga_taxonomy_terms_manga_id_taxonomy_term_id_unique` - Unique constraint
- `idx_manga_taxonomy_terms_manga_id` - Index cho manga lookup
- `idx_manga_taxonomy_terms_taxonomy_term_id` - Index cho term lookup

#### Indexes bổ sung:
- `idx_manga_taxonomy_created_at` - Index cho relationship creation date
- `idx_term_manga` - Reverse lookup index (taxonomy_term_id, manga_id)

**Lý do cần thiết:**
- Load manga theo genre/tag/author
- Load genres/tags của một manga
- Reverse lookups

## 🚀 Performance Impact

### Query Performance:
- **Search queries**: Cải thiện 10-50x với FULLTEXT index
- **Filter queries**: Cải thiện 5-20x với composite indexes
- **Sort queries**: Cải thiện 3-10x với dedicated indexes
- **Join queries**: Cải thiện 2-5x với foreign key indexes

### Storage Impact:
- Indexes chiếm thêm ~20-30% storage space
- Trade-off: Slower INSERT/UPDATE nhưng faster SELECT

## 📈 Monitoring & Maintenance

### Commands hữu ích:
```bash
# Phân tích performance
php artisan db:analyze-performance

# Phân tích chi tiết
php artisan db:analyze-performance --detailed

# Check slow queries (MySQL)
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

# Analyze table statistics
ANALYZE TABLE mangas, chapters, pages;
```

### Best Practices:
1. **Monitor slow queries** - Sử dụng Laravel Telescope hoặc database logs
2. **Regular maintenance** - Chạy ANALYZE TABLE định kỳ
3. **Index usage monitoring** - Kiểm tra indexes không sử dụng
4. **Query optimization** - Sử dụng EXPLAIN để analyze execution plans

## 🔧 Tuning Recommendations

### For Production:
1. **Enable query caching** - MySQL query cache hoặc Redis
2. **Connection pooling** - Sử dụng connection pooling
3. **Read replicas** - Cho read-heavy workloads
4. **Partitioning** - Cho tables rất lớn (>10M records)

### For Development:
1. **Laravel Telescope** - Monitor queries
2. **Database profiling** - Enable slow query log
3. **Regular analysis** - Chạy performance analysis command

## ⚠️ Notes

- FULLTEXT index chỉ hoạt động với MySQL/MariaDB
- Composite indexes có thứ tự quan trọng (leftmost prefix rule)
- Quá nhiều indexes có thể làm chậm INSERT/UPDATE operations
- Regular monitoring và maintenance là cần thiết 