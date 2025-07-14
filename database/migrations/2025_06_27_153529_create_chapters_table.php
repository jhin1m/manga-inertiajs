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
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manga_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug'); // Consolidated: Added slug column
            $table->decimal('chapter_number', 8, 2);
            $table->integer('volume_number')->nullable();
            $table->unsignedBigInteger('views')->default(0);
            // Consolidated: Removed pages_count column (no longer needed)
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Consolidated: Updated unique constraints and indexes
            $table->unique(['manga_id', 'chapter_number']);
            $table->unique(['manga_id', 'slug'], 'chapters_manga_slug_unique');
            $table->index(['manga_id', 'published_at']);
            $table->index(['manga_id', 'chapter_number']);
            $table->index('slug', 'chapters_slug_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};
