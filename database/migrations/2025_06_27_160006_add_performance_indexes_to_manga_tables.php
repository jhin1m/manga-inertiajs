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
        // Thêm indexes cho bảng mangas
        Schema::table('mangas', function (Blueprint $table) {
            // Index cho tìm kiếm theo tên (alphabetical sorting)
            $table->index('name', 'idx_mangas_name');
            
            // Index cho updated_at (recent updates)
            $table->index('updated_at', 'idx_mangas_updated_at');
            
            // Composite index cho filter + sort phổ biến
            $table->index(['status', 'views'], 'idx_mangas_status_views');
            $table->index(['status', 'updated_at'], 'idx_mangas_status_updated');
            
            // Index cho views descending (popularity sorting)
            $table->index([DB::raw('views DESC')], 'idx_mangas_views_desc');
        });

        // Thêm FULLTEXT index cho tìm kiếm (chỉ với MySQL/MariaDB)
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE mangas ADD FULLTEXT idx_mangas_search (name, description)');
        }

        // Thêm indexes cho bảng chapters
        Schema::table('chapters', function (Blueprint $table) {
            // Index cho published_at (chronological sorting)
            $table->index('published_at', 'idx_chapters_published_at');
            
            // Index cho volume_number (filter by volume)
            $table->index('volume_number', 'idx_chapters_volume');
            
            // Composite index cho complex queries
            $table->index(['manga_id', 'published_at', 'chapter_number'], 'idx_chapters_manga_pub_num');
            
            // Index cho status queries nếu có
            $table->index(['manga_id', 'volume_number'], 'idx_chapters_manga_volume');
        });

        // Thêm indexes cho bảng pages
        Schema::table('pages', function (Blueprint $table) {
            // Index cho image_url nếu cần check duplicates
            $table->index('image_url', 'idx_pages_image_url');
        });

        // Thêm indexes cho bảng taxonomy_terms
        Schema::table('taxonomy_terms', function (Blueprint $table) {
            // Index cho tên (alphabetical sorting của terms)
            $table->index('name', 'idx_taxonomy_terms_name');
        });

        // Thêm indexes cho bảng manga_taxonomy_terms
        Schema::table('manga_taxonomy_terms', function (Blueprint $table) {
            // Index cho created_at (khi relationship được tạo)
            $table->index('created_at', 'idx_manga_taxonomy_created_at');
            
            // Composite index cho reverse lookup
            $table->index(['taxonomy_term_id', 'manga_id'], 'idx_term_manga');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes từ mangas
        Schema::table('mangas', function (Blueprint $table) {
            $table->dropIndex('idx_mangas_name');
            $table->dropIndex('idx_mangas_updated_at');
            $table->dropIndex('idx_mangas_status_views');
            $table->dropIndex('idx_mangas_status_updated');
            $table->dropIndex('idx_mangas_views_desc');
        });

        // Drop FULLTEXT index
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE mangas DROP INDEX idx_mangas_search');
        }

        // Drop indexes từ chapters
        Schema::table('chapters', function (Blueprint $table) {
            $table->dropIndex('idx_chapters_published_at');
            $table->dropIndex('idx_chapters_volume');
            $table->dropIndex('idx_chapters_manga_pub_num');
            $table->dropIndex('idx_chapters_manga_volume');
        });

        // Drop indexes từ pages
        Schema::table('pages', function (Blueprint $table) {
            $table->dropIndex('idx_pages_image_url');
        });

        // Drop indexes từ taxonomy_terms
        Schema::table('taxonomy_terms', function (Blueprint $table) {
            $table->dropIndex('idx_taxonomy_terms_name');
        });

        // Drop indexes từ manga_taxonomy_terms
        Schema::table('manga_taxonomy_terms', function (Blueprint $table) {
            $table->dropIndex('idx_manga_taxonomy_created_at');
            $table->dropIndex('idx_term_manga');
        });
    }
};
