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

        // Share translations globally with all Inertia pages
        Inertia::share([
            'appName' => config('app.name'),
            'seoConfig' => config('seo'),
            'layoutTranslations' => fn () => [
                'home' => __('layout.home'),
                'library' => __('layout.library'),
                'search' => __('layout.search'),
                'search_placeholder' => __('layout.search_placeholder'),
                'favorites' => __('layout.favorites'),
                'history' => __('layout.history'),
                'ratings' => __('layout.ratings'),
                'settings' => __('layout.settings'),
                'profile' => __('layout.profile'),
                'login' => __('layout.login'),
                'register' => __('layout.register'),
                'logout' => __('layout.logout'),
                'toggle_menu' => __('layout.toggle_menu'),
                'user_menu' => __('layout.user_menu'),
                'navigation' => __('layout.navigation'),
                // Footer translations
                'footer_description' => __('layout.footer_description'),
                'explore' => __('layout.explore'),
                'copyright' => __('layout.copyright'),
                'online_status' => __('layout.online_status'),
                'server_status' => __('layout.server_status'),
                // Search dialog translations
                'search_dialog_title' => __('layout.search_dialog_title'),
                'search_dialog_description' => __('layout.search_dialog_description'),
                'search_dialog_placeholder' => __('layout.search_dialog_placeholder'),
                'recent_searches' => __('layout.recent_searches'),
                'clear_history' => __('layout.clear_history'),
                'popular_manga' => __('layout.popular_manga'),
                'popular_genres' => __('layout.popular_genres'),
                'search_for' => __('layout.search_for'),
                'press_enter_to_search' => __('layout.press_enter_to_search'),
                'manga_badge' => __('layout.manga_badge'),
                'genre_badge' => __('layout.genre_badge'),
                // Genres
                'genres' => __('layout.genres'),
                'view_all_genres' => __('layout.view_all_genres'),
                // Mobile menu
                'mobile_menu_description' => __('layout.mobile_menu_description'),
            ],
            'breadcrumbTranslations' => fn () => [
                'home' => __('breadcrumb.home'),
                'more' => __('breadcrumb.more'),
                'navigation' => __('breadcrumb.navigation'),
                'close' => __('breadcrumb.close'),
                'manga_list' => __('breadcrumb.manga_list'),
                'chapter_list' => __('breadcrumb.chapter_list'),
                'search' => __('breadcrumb.search'),
                'search_results' => __('breadcrumb.search_results'),
                'chapter_prefix' => __('breadcrumb.chapter_prefix'),
            ],
            'mangaTranslations' => fn () => [
                'rankings' => [
                    'title' => __('manga.rankings.title'),
                    'no_data' => __('manga.rankings.no_data'),
                    'view_all' => __('manga.rankings.view_all'),
                    'views' => __('manga.rankings.views'),
                ],
                'recommended' => [
                    'title' => __('manga.recommended.title'),
                    'no_data' => __('manga.recommended.no_data'),
                    'view_all' => __('manga.recommended.view_all'),
                    'rating_reason' => __('manga.recommended.rating_reason'),
                ],
            ],
        ]);
    }
}
