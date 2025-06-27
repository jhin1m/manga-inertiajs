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
            $table->decimal('chapter_number', 8, 2);
            $table->integer('volume_number')->nullable();
            $table->integer('pages_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            
            $table->unique(['manga_id', 'chapter_number']);
            $table->index(['manga_id', 'published_at']);
            $table->index(['manga_id', 'chapter_number']);
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
