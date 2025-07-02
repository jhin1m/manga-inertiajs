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
        $latestUpdates = $mangaController->getLatestUpdates(12);
        
        // Sample hot manga data for testing (sẽ được thay thế bằng dữ liệu thật sau)
        $hotManga = [
            [
                'id' => 1,
                'name' => 'Jujutsu Kaisen',
                'slug' => 'jujutsu-kaisen',
                'cover' => '/api/placeholder/200/280',
                'rating' => 4.9,
                'views' => 2500000,
                'status' => 'ongoing',
                'total_chapters' => 245,
                'genres' => [
                    ['name' => 'Action'],
                    ['name' => 'Supernatural'],
                    ['name' => 'School']
                ],
                'latest_chapter' => [
                    'chapter_number' => 245,
                    'updated_at' => '2024-01-20'
                ]
            ],
            [
                'id' => 2,
                'name' => 'Demon Slayer',
                'slug' => 'demon-slayer',
                'cover' => '/api/placeholder/200/280',
                'rating' => 4.8,
                'views' => 3200000,
                'status' => 'completed',
                'total_chapters' => 205,
                'genres' => [
                    ['name' => 'Action'],
                    ['name' => 'Historical'],
                    ['name' => 'Supernatural']
                ],
                'latest_chapter' => [
                    'chapter_number' => 205,
                    'updated_at' => '2024-01-18'
                ]
            ]
        ];

        return Inertia::render('Home', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'hotManga' => $hotManga,
            'latestUpdates' => $latestUpdates,
            'featuredManga' => [],
            'rankings' => [],
            'recentComments' => [],
            'recommended' => []
        ]);
    }
}
