<?php

namespace App\Services;

use App\Contracts\MangaRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class HomePageService
{
    public function __construct(
        private MangaRepositoryInterface $mangaRepository
    ) {}

    public function getHomePageData(): array
    {
        return [
            'canLogin' => \Route::has('login'),
            'canRegister' => \Route::has('register'),
            'hotManga' => $this->getCachedHotManga(),
            'latestUpdates' => $this->getCachedLatestUpdates(),
            'featuredManga' => [],
            'rankings' => $this->getCachedRankings(),
            'recentComments' => [],
            'recommended' => $this->getCachedRecommended(),
            'translations' => [
                'latest_updates_title' => __('page.home.latest_updates_title'),
                'view_all' => __('page.home.view_all'),
                'hot_manga_title' => __('page.home.hot_manga_title'),
                'scroll_hint' => __('page.home.scroll_hint'),
            ]
        ];
    }

    private function getCachedHotManga(): \Illuminate\Support\Collection
    {
        return Cache::remember('homepage.hot_manga', 3600, function () {
            return $this->mangaRepository->getHotManga(10);
        });
    }

    private function getCachedLatestUpdates(): \Illuminate\Support\Collection
    {
        return Cache::remember('homepage.latest_updates', 1800, function () {
            return $this->mangaRepository->getLatestUpdates(12);
        });
    }

    private function getCachedRankings(): \Illuminate\Support\Collection
    {
        return Cache::remember('homepage.rankings', 7200, function () {
            return $this->mangaRepository->getRankings(10);
        });
    }

    private function getCachedRecommended(): \Illuminate\Support\Collection
    {
        return Cache::remember('homepage.recommended', 3600, function () {
            return $this->mangaRepository->getRecommended(6);
        });
    }

    public function clearCache(): void
    {
        Cache::forget('homepage.hot_manga');
        Cache::forget('homepage.latest_updates');
        Cache::forget('homepage.rankings');
        Cache::forget('homepage.recommended');
    }
}