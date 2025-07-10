<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Consolidated migration for all performance indexes
 * This migration combines all performance indexes from multiple migrations:
 * - Base performance indexes (2025_06_27_160006)
 * - Additional performance indexes (2025_07_10_125814) - fixed version
 * 
 * Excludes problematic JSON index on alternative_names column
 * All duplicate indexes are avoided with proper existence checks
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // === MANGAS TABLE INDEXES ===
        Schema::table('mangas', function (Blueprint $table) {
            // Basic indexes
            $this->addIndexIfNotExists('mangas', 'name', 'idx_mangas_name');
            $this->addIndexIfNotExists('mangas', 'updated_at', 'idx_mangas_updated_at');
            $this->addIndexIfNotExists('mangas', 'created_at', 'idx_mangas_created_at');
            
            // Composite indexes for filtering and sorting
            $this->addCompositeIndexIfNotExists('mangas', ['status', 'views'], 'idx_mangas_status_views');
            $this->addCompositeIndexIfNotExists('mangas', ['status', 'updated_at'], 'idx_mangas_status_updated');
            $this->addCompositeIndexIfNotExists('mangas', ['status', 'rating', 'total_rating'], 'idx_mangas_status_rating');
            
            // Rating and popularity indexes
            $this->addCompositeIndexIfNotExists('mangas', ['rating', 'total_rating'], 'idx_mangas_rating_composite');
            $this->addCompositeIndexIfNotExists('mangas', ['views', 'rating', 'total_rating'], 'idx_mangas_hot_ranking');
            
            // Views descending index (for MySQL - using raw expression)
            if (!$this->indexExists('mangas', 'idx_mangas_views_desc')) {
                try {
                    $table->index([DB::raw('views DESC')], 'idx_mangas_views_desc');
                } catch (\Exception $e) {
                    // Fallback to regular views index
                    $this->addIndexIfNotExists('mangas', 'views', 'idx_mangas_views_desc');
                }
            }
        });

        // Add FULLTEXT index for search (MySQL only)
        if (DB::getDriverName() === 'mysql') {
            if (!$this->indexExists('mangas', 'idx_mangas_search')) {
                try {
                    DB::statement('ALTER TABLE mangas ADD FULLTEXT idx_mangas_search (name, description)');
                } catch (\Exception $e) {
                    // Ignore if already exists or not supported
                }
            }
        }

        // === CHAPTERS TABLE INDEXES ===
        Schema::table('chapters', function (Blueprint $table) {
            // Basic indexes
            $this->addIndexIfNotExists('chapters', 'published_at', 'idx_chapters_published_at');
            $this->addIndexIfNotExists('chapters', 'volume_number', 'idx_chapters_volume');
            $this->addIndexIfNotExists('chapters', 'slug', 'idx_chapters_slug');
            
            // Composite indexes for navigation and filtering
            $this->addCompositeIndexIfNotExists('chapters', ['manga_id', 'published_at', 'chapter_number'], 'idx_chapters_manga_pub_num');
            $this->addCompositeIndexIfNotExists('chapters', ['manga_id', 'volume_number'], 'idx_chapters_manga_volume');
            $this->addCompositeIndexIfNotExists('chapters', ['manga_id', 'chapter_number', 'id'], 'idx_chapters_navigation');
            $this->addCompositeIndexIfNotExists('chapters', ['manga_id', 'updated_at', 'chapter_number'], 'idx_chapters_manga_updated');
        });

        // === PAGES TABLE INDEXES ===
        Schema::table('pages', function (Blueprint $table) {
            // Image URL index for duplicate checks
            $this->addIndexIfNotExists('pages', 'image_url', 'idx_pages_image_url');
            
            // Composite index for page ordering
            $this->addCompositeIndexIfNotExists('pages', ['chapter_id', 'page_number', 'id'], 'idx_pages_ordering');
        });

        // === TAXONOMY_TERMS TABLE INDEXES ===
        Schema::table('taxonomy_terms', function (Blueprint $table) {
            // Basic indexes
            $this->addIndexIfNotExists('taxonomy_terms', 'name', 'idx_taxonomy_terms_name');
            $this->addIndexIfNotExists('taxonomy_terms', 'slug', 'idx_taxonomy_terms_slug');
            
            // Composite index for taxonomy filtering
            $this->addCompositeIndexIfNotExists('taxonomy_terms', ['taxonomy_id', 'name'], 'idx_taxonomy_terms_type_name');
        });

        // === MANGA_TAXONOMY_TERMS TABLE INDEXES ===
        Schema::table('manga_taxonomy_terms', function (Blueprint $table) {
            // Basic indexes
            $this->addIndexIfNotExists('manga_taxonomy_terms', 'created_at', 'idx_manga_taxonomy_created_at');
            
            // Composite indexes for relationship queries
            $this->addCompositeIndexIfNotExists('manga_taxonomy_terms', ['taxonomy_term_id', 'manga_id'], 'idx_term_manga');
            $this->addCompositeIndexIfNotExists('manga_taxonomy_terms', ['taxonomy_term_id', 'manga_id', 'created_at'], 'idx_manga_taxonomy_covering');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop all custom indexes
        $this->dropIndexIfExists('mangas', 'idx_mangas_name');
        $this->dropIndexIfExists('mangas', 'idx_mangas_updated_at');
        $this->dropIndexIfExists('mangas', 'idx_mangas_created_at');
        $this->dropIndexIfExists('mangas', 'idx_mangas_status_views');
        $this->dropIndexIfExists('mangas', 'idx_mangas_status_updated');
        $this->dropIndexIfExists('mangas', 'idx_mangas_status_rating');
        $this->dropIndexIfExists('mangas', 'idx_mangas_rating_composite');
        $this->dropIndexIfExists('mangas', 'idx_mangas_hot_ranking');
        $this->dropIndexIfExists('mangas', 'idx_mangas_views_desc');
        
        // Drop FULLTEXT index
        if (DB::getDriverName() === 'mysql') {
            try {
                DB::statement('ALTER TABLE mangas DROP INDEX idx_mangas_search');
            } catch (\Exception $e) {
                // Ignore if doesn't exist
            }
        }
        
        // Drop chapters indexes
        $this->dropIndexIfExists('chapters', 'idx_chapters_published_at');
        $this->dropIndexIfExists('chapters', 'idx_chapters_volume');
        $this->dropIndexIfExists('chapters', 'idx_chapters_slug');
        $this->dropIndexIfExists('chapters', 'idx_chapters_manga_pub_num');
        $this->dropIndexIfExists('chapters', 'idx_chapters_manga_volume');
        $this->dropIndexIfExists('chapters', 'idx_chapters_navigation');
        $this->dropIndexIfExists('chapters', 'idx_chapters_manga_updated');
        
        // Drop pages indexes
        $this->dropIndexIfExists('pages', 'idx_pages_image_url');
        $this->dropIndexIfExists('pages', 'idx_pages_ordering');
        
        // Drop taxonomy_terms indexes
        $this->dropIndexIfExists('taxonomy_terms', 'idx_taxonomy_terms_name');
        $this->dropIndexIfExists('taxonomy_terms', 'idx_taxonomy_terms_slug');
        $this->dropIndexIfExists('taxonomy_terms', 'idx_taxonomy_terms_type_name');
        
        // Drop manga_taxonomy_terms indexes
        $this->dropIndexIfExists('manga_taxonomy_terms', 'idx_manga_taxonomy_created_at');
        $this->dropIndexIfExists('manga_taxonomy_terms', 'idx_term_manga');
        $this->dropIndexIfExists('manga_taxonomy_terms', 'idx_manga_taxonomy_covering');
    }
    
    /**
     * Helper method to check if index exists
     */
    private function indexExists(string $table, string $indexName): bool
    {
        try {
            $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$indexName}'");
            return !empty($indexes);
        } catch (\Exception $e) {
            return false;
        }
    }
    
    /**
     * Helper method to add single column index if not exists
     */
    private function addIndexIfNotExists(string $table, string $column, string $indexName): void
    {
        if (!$this->indexExists($table, $indexName)) {
            try {
                DB::statement("ALTER TABLE {$table} ADD INDEX {$indexName} ({$column})");
            } catch (\Exception $e) {
                // Ignore if already exists or error
            }
        }
    }
    
    /**
     * Helper method to add composite index if not exists
     */
    private function addCompositeIndexIfNotExists(string $table, array $columns, string $indexName): void
    {
        if (!$this->indexExists($table, $indexName)) {
            try {
                $columnList = implode(', ', $columns);
                DB::statement("ALTER TABLE {$table} ADD INDEX {$indexName} ({$columnList})");
            } catch (\Exception $e) {
                // Ignore if already exists or error
            }
        }
    }
    
    /**
     * Helper method to drop index if exists
     */
    private function dropIndexIfExists(string $table, string $indexName): void
    {
        if ($this->indexExists($table, $indexName)) {
            try {
                DB::statement("DROP INDEX {$indexName} ON {$table}");
            } catch (\Exception $e) {
                // Ignore if doesn't exist
            }
        }
    }
};