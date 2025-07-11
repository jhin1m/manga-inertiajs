<?php

namespace App\Providers;

use App\Contracts\MangaRepositoryInterface;
use App\Contracts\ChapterRepositoryInterface;
use App\Repositories\MangaRepository;
use App\Repositories\ChapterRepository;
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

        if ($this->app->environment('local')) {
            $this->app->register(\App\Providers\TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Share translations globally with all Inertia pages
        Inertia::share([
            'appName' => config('app.name'),
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
