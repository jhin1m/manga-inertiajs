<?php

namespace App\Providers;

use App\Contracts\ChapterRepositoryInterface;
use App\Contracts\MangaRepositoryInterface;
use App\Contracts\TaxonomyRepositoryInterface;
use App\Models\TaxonomyTerm;
use App\Repositories\ChapterRepository;
use App\Repositories\MangaRepository;
use App\Repositories\TaxonomyRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register Repository bindings
        $this->app->bind(MangaRepositoryInterface::class, MangaRepository::class);
        $this->app->bind(ChapterRepositoryInterface::class, ChapterRepository::class);
        $this->app->bind(TaxonomyRepositoryInterface::class, TaxonomyRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Custom route model binding for taxonomy terms to resolve by type
        Route::bind('term', function ($value) {
            $request = request();
            $routeName = $request->route()->getName();
            
            // Extract type from route name (e.g., 'artist.show' -> 'artist')
            if ($routeName && str_contains($routeName, '.show')) {
                $type = explode('.', $routeName)[0];
                
                // Valid taxonomy types
                $validTypes = ['genre', 'author', 'artist', 'tag', 'status', 'year'];
                
                if (in_array($type, $validTypes)) {
                    // Find term by slug AND taxonomy type
                    return TaxonomyTerm::whereHas('taxonomy', function ($query) use ($type) {
                        $query->where('type', $type);
                    })
                    ->where('slug', $value)
                    ->with('taxonomy')
                    ->first() ?? abort(404);
                }
            }
            
            // Fallback to default behavior for other routes
            return TaxonomyTerm::where('slug', $value)->with('taxonomy')->first() ?? abort(404);
        });

        // Translations moved to HandleInertiaRequests middleware for Octane compatibility
        // This ensures translations are fresh for each request and work with Octane
    }
}