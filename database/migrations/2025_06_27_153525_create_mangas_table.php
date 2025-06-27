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
        Schema::create('mangas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('alternative_names')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['ongoing', 'completed', 'hiatus', 'cancelled'])->default('ongoing');
            $table->unsignedBigInteger('views')->default(0);
            $table->string('cover')->nullable();
            $table->string('slug')->unique();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index(['views', 'created_at']);
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mangas');
    }
};
