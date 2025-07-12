<?php

namespace App\Http\Controllers;

use App\Services\HomePageService;
use App\Services\SeoService;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function __construct(
        private HomePageService $homePageService,
        private SeoService $seoService
    ) {}

    public function index()
    {
        $data = $this->homePageService->getHomePageData();
        
        return Inertia::render('Home', [
            'canLogin' => $data['canLogin'],
            'canRegister' => $data['canRegister'],
            'hotManga' => $data['hotManga'],
            // Use deferred props for latestUpdates to improve initial page load performance
            'latestUpdates' => Inertia::defer(function () {
                return $this->homePageService->getCachedLatestUpdates();
            }),
            'featuredManga' => $data['featuredManga'],
            'rankings' => $data['rankings'],
            'recentComments' => $data['recentComments'],
            'recommended' => $data['recommended'],
            'seo' => $this->seoService->forHome(),
            'translations' => $data['translations'],
        ]);
    }
}
