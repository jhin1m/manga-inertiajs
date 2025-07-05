<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add type field to taxonomies table
        Schema::table('taxonomies', function (Blueprint $table) {
            $table->enum('type', ['genre', 'author', 'tag', 'status'])->default('genre')->after('slug');
            $table->index('type');
        });

        // Add rating field to mangas table
        Schema::table('mangas', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->default(0)->after('views')->comment('Rating from 0 to 10');
            $table->index(['rating', 'created_at']);
        });

        // Add views field to chapters table
        Schema::table('chapters', function (Blueprint $table) {
            $table->unsignedBigInteger('views')->default(0)->after('volume_number');
            $table->index(['views', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('taxonomies', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropColumn('type');
        });

        Schema::table('mangas', function (Blueprint $table) {
            $table->dropIndex(['rating', 'created_at']);
            $table->dropColumn('rating');
        });

        Schema::table('chapters', function (Blueprint $table) {
            $table->dropIndex(['views', 'created_at']);
            $table->dropColumn('views');
        });
    }
}; 