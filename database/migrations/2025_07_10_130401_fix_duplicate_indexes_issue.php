<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop duplicate indexes if they exist (safe cleanup)
        $this->dropIndexIfExists('mangas', 'idx_mangas_hot_ranking');
        $this->dropIndexIfExists('mangas', 'idx_mangas_rating_composite');
        $this->dropIndexIfExists('mangas', 'idx_mangas_alt_names');
        $this->dropIndexIfExists('mangas', 'idx_mangas_status_rating');
        $this->dropIndexIfExists('mangas', 'idx_mangas_created_at');

        $this->dropIndexIfExists('chapters', 'idx_chapters_navigation');
        $this->dropIndexIfExists('chapters', 'idx_chapters_slug');
        $this->dropIndexIfExists('chapters', 'idx_chapters_manga_updated');

        $this->dropIndexIfExists('taxonomy_terms', 'idx_taxonomy_terms_type_name');
        $this->dropIndexIfExists('taxonomy_terms', 'idx_taxonomy_terms_slug');

        $this->dropIndexIfExists('manga_taxonomy_terms', 'idx_manga_taxonomy_covering');
        $this->dropIndexIfExists('pages', 'idx_pages_ordering');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nothing to rollback
    }

    private function dropIndexIfExists($table, $indexName)
    {
        try {
            $indexExists = collect(DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$indexName}'"))->isNotEmpty();
            if ($indexExists) {
                DB::statement("DROP INDEX {$indexName} ON {$table}");
            }
        } catch (\Exception $e) {
            // Index doesn't exist, ignore
        }
    }
};
