<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Additional indexes for mangas table
        Schema::table('mangas', function (Blueprint $table) {
            // Composite index for hot manga calculations (views + rating)
            $table->index(['views', 'rating', 'total_rating'], 'idx_mangas_hot_ranking');
            
            // Composite index for recommended manga filter
            $table->index(['rating', 'total_rating'], 'idx_mangas_rating_composite');
            
            // Index for alternative_names search
            $table->index(['alternative_names'], 'idx_mangas_alt_names');
            
            // Composite index for status + rating (filtered rankings)
            $table->index(['status', 'rating', 'total_rating'], 'idx_mangas_status_rating');
            
            // Index for created_at (oldest sorting)
            $table->index(['created_at'], 'idx_mangas_created_at');
        });

        // Additional indexes for chapters table
        Schema::table('chapters', function (Blueprint $table) {
            // Composite index for chapter navigation (prev/next)
            $table->index(['manga_id', 'chapter_number', 'id'], 'idx_chapters_navigation');
            
            // Index for slug-based chapter lookups  
            $table->index(['slug'], 'idx_chapters_slug');
            
            // Composite index for chapter ordering with updated_at
            $table->index(['manga_id', 'updated_at', 'chapter_number'], 'idx_chapters_manga_updated');
        });

        // Additional indexes for taxonomy_terms table
        Schema::table('taxonomy_terms', function (Blueprint $table) {
            // Composite index for taxonomy filtering
            $table->index(['taxonomy_id', 'name'], 'idx_taxonomy_terms_type_name');
            
            // Index for slug-based term lookups
            $table->index(['slug'], 'idx_taxonomy_terms_slug');
        });

        // Additional indexes for manga_taxonomy_terms table
        Schema::table('manga_taxonomy_terms', function (Blueprint $table) {
            // Covering index for related manga queries
            $table->index(['taxonomy_term_id', 'manga_id', 'created_at'], 'idx_manga_taxonomy_covering');
        });

        // Additional indexes for pages table
        Schema::table('pages', function (Blueprint $table) {
            // Composite index for page ordering
            $table->index(['chapter_id', 'page_number', 'id'], 'idx_pages_ordering');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop additional indexes from mangas
        Schema::table('mangas', function (Blueprint $table) {
            $table->dropIndex('idx_mangas_hot_ranking');
            $table->dropIndex('idx_mangas_rating_composite');
            $table->dropIndex('idx_mangas_alt_names');
            $table->dropIndex('idx_mangas_status_rating');
            $table->dropIndex('idx_mangas_created_at');
        });

        // Drop additional indexes from chapters
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropIndex('idx_chapters_navigation');
            $table->dropIndex('idx_chapters_slug');
            $table->dropIndex('idx_chapters_manga_updated');
        });

        // Drop additional indexes from taxonomy_terms
        Schema::table('taxonomy_terms', function (Blueprint $table) {
            $table->dropIndex('idx_taxonomy_terms_type_name');
            $table->dropIndex('idx_taxonomy_terms_slug');
        });

        // Drop additional indexes from manga_taxonomy_terms
        Schema::table('manga_taxonomy_terms', function (Blueprint $table) {
            $table->dropIndex('idx_manga_taxonomy_covering');
        });

        // Drop additional indexes from pages
        Schema::table('pages', function (Blueprint $table) {
            $table->dropIndex('idx_pages_ordering');
        });
    }
};
