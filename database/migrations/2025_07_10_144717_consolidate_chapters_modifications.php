<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Consolidated migration for chapters table modifications
 * This migration combines the following operations:
 * - Add slug column with index
 * - Add unique constraint for manga_id + slug
 * - Remove pages_count column (no longer needed)
 * 
 * Replaces these migrations:
 * - 2025_07_06_082829_add_slug_to_chapters_table.php
 * - 2025_07_06_083031_add_unique_constraint_to_chapters_slug.php
 * - 2025_07_04_172226_drop_pages_count_from_chapters_table.php
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            // Add slug column (nullable initially for existing records)
            if (!Schema::hasColumn('chapters', 'slug')) {
                $table->string('slug')->nullable()->after('title');
            }
            
            // Remove pages_count column (no longer used)
            if (Schema::hasColumn('chapters', 'pages_count')) {
                $table->dropColumn('pages_count');
            }
        });
        
        // In a separate Schema::table call to avoid conflicts
        Schema::table('chapters', function (Blueprint $table) {
            // Make slug non-nullable if it's currently nullable
            if (Schema::hasColumn('chapters', 'slug')) {
                $table->string('slug')->nullable(false)->change();
            }
            
            // Add unique constraint if it doesn't exist
            if (!$this->constraintExists('chapters', 'chapters_manga_slug_unique')) {
                $table->unique(['manga_id', 'slug'], 'chapters_manga_slug_unique');
            }
            
            // Add index for slug lookups if it doesn't exist
            if (!$this->indexExists('chapters', 'chapters_slug_index')) {
                $table->index('slug', 'chapters_slug_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chapters', function (Blueprint $table) {
            // Drop unique constraint and index if they exist
            if ($this->constraintExists('chapters', 'chapters_manga_slug_unique')) {
                $table->dropUnique('chapters_manga_slug_unique');
            }
            
            if ($this->indexExists('chapters', 'chapters_slug_index')) {
                $table->dropIndex('chapters_slug_index');
            }
            
            // Drop slug column
            if (Schema::hasColumn('chapters', 'slug')) {
                $table->dropColumn('slug');
            }
            
            // Restore pages_count column
            if (!Schema::hasColumn('chapters', 'pages_count')) {
                $table->integer('pages_count')->default(0)->after('volume_number');
            }
        });
    }
    
    /**
     * Check if index exists
     */
    private function indexExists(string $table, string $indexName): bool
    {
        try {
            $indexes = \DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$indexName}'");
            return !empty($indexes);
        } catch (\Exception $e) {
            return false;
        }
    }
    
    /**
     * Check if constraint exists
     */
    private function constraintExists(string $table, string $constraintName): bool
    {
        try {
            $constraints = \DB::select("
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = '{$table}' 
                AND CONSTRAINT_NAME = '{$constraintName}'
            ");
            return !empty($constraints);
        } catch (\Exception $e) {
            return false;
        }
    }
};