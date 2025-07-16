<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('taxonomies', function (Blueprint $table) {
            $table->enum('type', ['genre', 'author', 'tag', 'status', 'year', 'artist'])->default('genre')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('taxonomies', function (Blueprint $table) {
            $table->enum('type', ['genre', 'author', 'tag', 'status'])->default('genre')->change();
        });
    }
};
