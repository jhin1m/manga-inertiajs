<?php

use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MangaController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchSuggestionController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\TaxonomyController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Search routes
Route::get('/search', [MangaController::class, 'search'])->name('search');

// Bookmark and History routes
Route::get('/bookmarks', [BookmarkController::class, 'index'])->name('bookmarks');
Route::get('/history', [HistoryController::class, 'index'])->name('history');

// Live search API routes (minimal JSON API for performance)
Route::get('/api/search/suggestions', [SearchSuggestionController::class, 'suggestions'])->name('search.suggestions');
Route::get('/api/search/popular', [SearchSuggestionController::class, 'popular'])->name('search.popular');

// SEO Routes
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/sitemap-static.xml', [SitemapController::class, 'static'])->name('sitemap.static');
Route::get('/sitemap-manga-{page}.xml', [SitemapController::class, 'manga'])->name('sitemap.manga')->where('page', '[0-9]+');
Route::get('/sitemap-chapters-{page}.xml', [SitemapController::class, 'chapters'])->name('sitemap.chapters')->where('page', '[0-9]+');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Manga routes
Route::prefix('manga')->name('manga.')->group(function () {
    Route::get('/', [MangaController::class, 'index'])->name('index');
    Route::get('/{manga}', [MangaController::class, 'show'])->name('show');

    // Admin routes (protected by auth middleware)
    Route::middleware('auth')->group(function () {
        Route::post('/', [MangaController::class, 'store'])->name('store');
        Route::put('/{manga}', [MangaController::class, 'update'])->name('update');
        Route::delete('/{manga}', [MangaController::class, 'destroy'])->name('destroy');
    });

    // Chapter routes nested under manga
    Route::prefix('{manga}/chapters')->name('chapters.')->scopeBindings()->group(function () {
        Route::get('/', [ChapterController::class, 'index'])->name('index');
        Route::get('/{chapter}', [ChapterController::class, 'show'])->name('show');

        // Admin routes
        Route::middleware('auth')->group(function () {
            Route::post('/', [ChapterController::class, 'store'])->name('store');
            Route::put('/{chapter}', [ChapterController::class, 'update'])->name('update');
            Route::delete('/{chapter}', [ChapterController::class, 'destroy'])->name('destroy');
        });
    });
});

// Chapter routes (alternative direct access)
Route::prefix('chapters')->name('chapters.')->group(function () {
    Route::prefix('{chapter}/pages')->name('pages.')->group(function () {
        Route::get('/', [PageController::class, 'index'])->name('index');

        // Admin routes
        Route::middleware('auth')->group(function () {
            Route::post('/', [PageController::class, 'store'])->name('store');
            Route::post('/bulk-upload', [PageController::class, 'bulkUpload'])->name('bulk-upload');
            Route::put('/{page}', [PageController::class, 'update'])->name('update');
            Route::delete('/{page}', [PageController::class, 'destroy'])->name('destroy');
        });
    });
});

// Taxonomy routes
Route::prefix('taxonomies')->name('taxonomies.')->group(function () {
    Route::get('/', [TaxonomyController::class, 'index'])->name('index');
    Route::get('/{taxonomy}', [TaxonomyController::class, 'show'])->name('show');
    Route::get('/terms/{term}', [TaxonomyController::class, 'terms'])->name('terms');

    // API-like route for getting terms by type
    Route::get('/api/terms-by-type', [TaxonomyController::class, 'getTermsByType'])->name('api.terms-by-type');

    // Admin routes
    Route::middleware('auth')->group(function () {
        Route::post('/', [TaxonomyController::class, 'store'])->name('store');
        Route::put('/{taxonomy}', [TaxonomyController::class, 'update'])->name('update');
        Route::delete('/{taxonomy}', [TaxonomyController::class, 'destroy'])->name('destroy');

        // Taxonomy terms management
        Route::post('/{taxonomy}/terms', [TaxonomyController::class, 'storeTerm'])->name('terms.store');
        Route::put('/{taxonomy}/terms/{term}', [TaxonomyController::class, 'updateTerm'])->name('terms.update');
        Route::delete('/{taxonomy}/terms/{term}', [TaxonomyController::class, 'destroyTerm'])->name('terms.destroy');
    });
});

// Taxonomy term routes by type (SEO-friendly URLs)
Route::get('/genre/{term}', [TaxonomyController::class, 'termsByType'])->name('genre.show');
Route::get('/author/{term}', [TaxonomyController::class, 'termsByType'])->name('author.show');
Route::get('/artist/{term}', [TaxonomyController::class, 'termsByType'])->name('artist.show');
Route::get('/tag/{term}', [TaxonomyController::class, 'termsByType'])->name('tag.show');
Route::get('/status/{term}', [TaxonomyController::class, 'termsByType'])->name('status.show');
Route::get('/year/{term}', [TaxonomyController::class, 'termsByType'])->name('year.show');
require __DIR__.'/auth.php';
