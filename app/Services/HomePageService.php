<?php

namespace App\Services;

use App\Contracts\MangaRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
class HomePageService
{
    public function __construct(
        private MangaRepositoryInterface $mangaRepository
    ) {}

    public function getHomePageData(): array
    {
        return [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'hotManga' => $this->getCachedHotManga(),
            // latestUpdates now handled via defer in controller
            'featuredManga' => [],
            'rankings' => $this->getCachedRankings(),
            'recentComments' => [],
            'recommended' => $this->getCachedRecommended(),
            'genres' => $this->getCachedGenres(),
            'translations' => [
                // Page specific translations
                'latest_updates_title' => __('page.home.latest_updates_title'),
                'view_all' => __('page.home.view_all'),
                'hot_manga_title' => __('page.home.hot_manga_title'),
                'scroll_hint' => __('page.home.scroll_hint'),
            ],
        ];
    }

    private function getCachedHotManga(): Collection
    {
        return Cache::remember('homepage.hot_manga', config('homepage.cache.hot_manga_ttl'), function () {
            return $this->mangaRepository->getHotManga(config('homepage.limits.hot_manga'));
        });
    }

    public function getCachedLatestUpdates(): Collection
    {
        return Cache::remember('homepage.latest_updates', config('homepage.cache.latest_updates_ttl'), function () {
            return $this->mangaRepository->getLatestUpdates(config('homepage.limits.latest_updates'));
        });
    }

    private function getCachedRankings(): Collection
    {
        return Cache::remember('homepage.rankings', config('homepage.cache.rankings_ttl'), function () {
            return $this->mangaRepository->getRankings(config('homepage.limits.rankings'));
        });
    }

    private function getCachedRecommended(): Collection
    {
        return Cache::remember('homepage.recommended', config('homepage.cache.recommended_ttl'), function () {
            return $this->mangaRepository->getRecommended(config('homepage.limits.recommended'));
        });
    }

    private function getCachedGenres(): Collection
    {
        return Cache::remember('homepage.genres', config('homepage.cache.genres_ttl'), function () {
            return $this->mangaRepository->getGenres();
        });
    }

    public function clearCache(): void
    {
        Cache::forget('homepage.hot_manga');
        Cache::forget('homepage.latest_updates');
        Cache::forget('homepage.rankings');
        Cache::forget('homepage.recommended');
        Cache::forget('homepage.genres');
    }
}
