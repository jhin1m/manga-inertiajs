<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MangaController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\TaxonomyController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Search route
Route::get('/search', function () {
    $query = request()->get('q', '');
    return Inertia::render('Search', [
        'query' => $query
    ]);
})->name('search');

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
    Route::prefix('{manga}/chapters')->name('chapters.')->group(function () {
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

require __DIR__.'/auth.php';
