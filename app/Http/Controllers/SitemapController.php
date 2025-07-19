<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    const MANGA_PER_SITEMAP = 1000;
    const CHAPTERS_PER_SITEMAP = 5000;

    public function index()
    {
        $sitemap = Cache::remember('sitemap_index', config('cache.ttl.sitemap', 3600), function () {
            $xml = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            // Static pages sitemap
            $xml .= '<sitemap>';
            $xml .= '<loc>'.url('/sitemap-static.xml').'</loc>';
            $xml .= '<lastmod>'.now()->toISOString().'</lastmod>';
            $xml .= '</sitemap>';

            // Manga sitemaps
            $mangaCount = Manga::count();
            $mangaPages = ceil($mangaCount / self::MANGA_PER_SITEMAP);
            
            for ($page = 1; $page <= $mangaPages; $page++) {
                $xml .= '<sitemap>';
                $xml .= '<loc>'.url("/sitemap-manga-{$page}.xml").'</loc>';
                $xml .= '<lastmod>'.now()->toISOString().'</lastmod>';
                $xml .= '</sitemap>';
            }

            // Chapter sitemaps
            $chapterCount = Chapter::count();
            $chapterPages = ceil($chapterCount / self::CHAPTERS_PER_SITEMAP);
            
            for ($page = 1; $page <= $chapterPages; $page++) {
                $xml .= '<sitemap>';
                $xml .= '<loc>'.url("/sitemap-chapters-{$page}.xml").'</loc>';
                $xml .= '<lastmod>'.now()->toISOString().'</lastmod>';
                $xml .= '</sitemap>';
            }

            $xml .= '</sitemapindex>';

            return $xml;
        });

        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }

    public function static()
    {
        $sitemap = Cache::remember('sitemap_static', config('cache.ttl.sitemap', 3600), function () {
            $xml = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            // Homepage
            $xml .= '<url>';
            $xml .= '<loc>'.url('/').'</loc>';
            $xml .= '<changefreq>daily</changefreq>';
            $xml .= '<priority>1.0</priority>';
            $xml .= '<lastmod>'.now()->toISOString().'</lastmod>';
            $xml .= '</url>';

            // Manga index
            $xml .= '<url>';
            $xml .= '<loc>'.route('manga.index').'</loc>';
            $xml .= '<changefreq>daily</changefreq>';
            $xml .= '<priority>0.9</priority>';
            $xml .= '<lastmod>'.now()->toISOString().'</lastmod>';
            $xml .= '</url>';

            $xml .= '</urlset>';

            return $xml;
        });

        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }

    public function manga($page = 1)
    {
        $sitemap = Cache::remember("sitemap_manga_{$page}", config('cache.ttl.sitemap', 3600), function () use ($page) {
            $xml = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            $offset = ($page - 1) * self::MANGA_PER_SITEMAP;
            
            Manga::select('slug', 'updated_at')
                ->orderBy('updated_at', 'desc')
                ->offset($offset)
                ->limit(self::MANGA_PER_SITEMAP)
                ->chunk(100, function ($mangas) use (&$xml) {
                    foreach ($mangas as $manga) {
                        $xml .= '<url>';
                        $xml .= '<loc>'.route('manga.show', $manga->slug).'</loc>';
                        $xml .= '<changefreq>weekly</changefreq>';
                        $xml .= '<priority>0.8</priority>';
                        $xml .= '<lastmod>'.$manga->updated_at->toISOString().'</lastmod>';
                        $xml .= '</url>';
                    }
                });

            $xml .= '</urlset>';

            return $xml;
        });

        return response($sitemap, 200)
            ->header('Content-Type', 'application/xml');
    }

    public function chapters($page = 1)
    {
        $sitemap = Cache::remember("sitemap_chapters_{$page}", config('cache.ttl.sitemap', 3600), function () use ($page) {
            $xml = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            $offset = ($page - 1) * self::CHAPTERS_PER_SITEMAP;
            
            Chapter::with('manga:id,slug')
                ->select('slug', 'manga_id', 'updated_at')
                ->orderBy('updated_at', 'desc')
                ->offset($offset)
                ->limit(self::CHAPTERS_PER_SITEMAP)
                ->chunk(100, function ($chapters) use (&$xml) {
                    foreach ($chapters as $chapter) {
                        $xml .= '<url>';
                        $xml .= '<loc>'.route('manga.chapters.show', [$chapter->manga->slug, $chapter->slug]).'</loc>';
                        $xml .= '<changefreq>monthly</changefreq>';
                        $xml .= '<priority>0.6</priority>';
                        $xml .= '<lastmod>'.$chapter->updated_at->toISOString().'</lastmod>';
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
        $robots .= 'Sitemap: '.url('/sitemap.xml')."\n";

        return response($robots, 200)
            ->header('Content-Type', 'text/plain');
    }
}
