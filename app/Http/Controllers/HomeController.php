<?php

namespace App\Http\Controllers;

use App\Models\Manga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $mangaController = new MangaController();
        
        return Inertia::render('Home', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'hotManga' => $mangaController->getHotManga(10),
            'latestUpdates' => $mangaController->getLatestUpdates(12),
            'featuredManga' => [],
            'rankings' => $mangaController->getRankings(10),
            'recentComments' => [],
            'recommended' => $mangaController->getRecommended(6),
            'translations' => [
                'latest_updates_title' => __('page.home.latest_updates_title'),
                'view_all' => __('page.home.view_all'),
                'hot_manga_title' => __('page.home.hot_manga_title'),
                'scroll_hint' => __('page.home.scroll_hint'),
            ]
        ]);
    }
}
