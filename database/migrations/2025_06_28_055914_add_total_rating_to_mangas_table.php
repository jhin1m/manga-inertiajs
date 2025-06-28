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
        Schema::table('mangas', function (Blueprint $table) {
            $table->unsignedBigInteger('total_rating')->default(0)->after('rating')->comment('Total number of ratings');
            $table->index(['total_rating', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mangas', function (Blueprint $table) {
            $table->dropIndex(['total_rating', 'rating']);
            $table->dropColumn('total_rating');
        });
    }
};
