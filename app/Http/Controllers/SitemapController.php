<?php

namespace App\Http\Controllers;

use App\Models\Manga;
use App\Models\Chapter;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function index()
    {
        $sitemap = Cache::remember('sitemap', config('cache.ttl.sitemap'), function () {
            $xml = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            // Homepage
            $xml .= '<url>';
            $xml .= '<loc>' . url('/') . '</loc>';
            $xml .= '<changefreq>daily</changefreq>';
            $xml .= '<priority>1.0</priority>';
            $xml .= '<lastmod>' . now()->toISOString() . '</lastmod>';
            $xml .= '</url>';

            // Manga index
            $xml .= '<url>';
            $xml .= '<loc>' . route('manga.index') . '</loc>';
            $xml .= '<changefreq>daily</changefreq>';
            $xml .= '<priority>0.9</priority>';
            $xml .= '<lastmod>' . now()->toISOString() . '</lastmod>';
            $xml .= '</url>';

            // Search page
            $xml .= '<url>';
            $xml .= '<loc>' . route('search') . '</loc>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.8</priority>';
            $xml .= '<lastmod>' . now()->toISOString() . '</lastmod>';
            $xml .= '</url>';

            // All manga
            Manga::select('slug', 'updated_at')
                ->orderBy('updated_at', 'desc')
                ->chunk(config('manga.sitemap.chunk_size'), function ($mangas) use (&$xml) {
                    foreach ($mangas as $manga) {
                        $xml .= '<url>';
                        $xml .= '<loc>' . route('manga.show', $manga->slug) . '</loc>';
                        $xml .= '<changefreq>weekly</changefreq>';
                        $xml .= '<priority>0.8</priority>';
                        $xml .= '<lastmod>' . $manga->updated_at->toISOString() . '</lastmod>';
                        $xml .= '</url>';
                    }
                });

            // All chapters
            Chapter::with('manga:id,slug')
                ->select('slug', 'manga_id', 'updated_at')
                ->orderBy('updated_at', 'desc')
                ->chunk(config('manga.sitemap.chunk_size'), function ($chapters) use (&$xml) {
                    foreach ($chapters as $chapter) {
                        $xml .= '<url>';
                        $xml .= '<loc>' . route('chapter.show', [$chapter->manga->slug, $chapter->slug]) . '</loc>';
                        $xml .= '<changefreq>monthly</changefreq>';
                        $xml .= '<priority>0.6</priority>';
                        $xml .= '<lastmod>' . $chapter->updated_at->toISOString() . '</lastmod>';
                        $xml .= '</url>';
                    }
                });

            $xml .= '</urlset>';
            return $xml;
        });

        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }

    public function robots()
    {
        $robots = "User-agent: *\n";
        $robots .= "Allow: /\n";
        $robots .= "Disallow: /admin/\n";
        $robots .= "Disallow: /api/\n";
        $robots .= "Disallow: /login\n";
        $robots .= "Disallow: /register\n";
        $robots .= "\n";
        $robots .= "Sitemap: " . url('/sitemap.xml') . "\n";

        return response($robots, 200)
            ->header('Content-Type', 'text/plain');
    }
}