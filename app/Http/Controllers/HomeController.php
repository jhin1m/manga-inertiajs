<?php

namespace App\Http\Controllers;

use App\Services\HomePageService;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function __construct(
        private HomePageService $homePageService
    ) {}

    public function index()
    {
        return Inertia::render('Home', $this->homePageService->getHomePageData());
    }
}
