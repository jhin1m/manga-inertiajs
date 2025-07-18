<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'locale' => fn () => app()->getLocale(),
            
            // Move translations from AppServiceProvider to middleware for Octane compatibility
            'appName' => config('app.name'),
            'seoConfig' => config('seo'),
            'layoutTranslations' => fn () => $this->getLayoutTranslations(),
            'breadcrumbTranslations' => fn () => $this->getBreadcrumbTranslations(),
            'mangaTranslations' => fn () => $this->getMangaTranslations(),
        ];
    }
    
    /**
     * Get layout translations for Inertia shared props
     * Moved from AppServiceProvider for Octane compatibility
     */
    private function getLayoutTranslations(): array
    {
        return [
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
        ];
    }

    /**
     * Get breadcrumb translations for Inertia shared props
     * Moved from AppServiceProvider for Octane compatibility
     */
    private function getBreadcrumbTranslations(): array
    {
        return [
            'home' => __('breadcrumb.home'),
            'more' => __('breadcrumb.more'),
            'navigation' => __('breadcrumb.navigation'),
            'close' => __('breadcrumb.close'),
            'manga_list' => __('breadcrumb.manga_list'),
            'chapter_list' => __('breadcrumb.chapter_list'),
            'search' => __('breadcrumb.search'),
            'search_results' => __('breadcrumb.search_results'),
            'chapter_prefix' => __('breadcrumb.chapter_prefix'),
        ];
    }

    /**
     * Get manga translations for Inertia shared props
     * Moved from AppServiceProvider for Octane compatibility
     */
    private function getMangaTranslations(): array
    {
        return [
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
        ];
    }
}
