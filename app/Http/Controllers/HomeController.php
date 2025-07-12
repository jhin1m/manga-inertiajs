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
        $data['seo'] = $this->seoService->forHome();
        
        // Convert latestUpdates to use defer mechanism
        $data['latestUpdates'] = Inertia::defer(fn() => $this->homePageService->getCachedLatestUpdates());
        
        return Inertia::render('Home', $data);
    }
}
