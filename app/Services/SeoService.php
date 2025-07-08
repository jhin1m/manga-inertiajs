<?php

namespace App\Services;

use App\Models\Manga;
use App\Models\Chapter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Config;

class SeoService
{
    public function __construct()
    {
        //
    }

    public function getDefaults(): array
    {
        return Config::get('seo.defaults', []);
    }

    public function getTemplate(string $template): array
    {
        return Config::get("seo.templates.{$template}", []);
    }

    public function forHome(): array
    {
        $template = $this->getTemplate('home');
        $defaults = $this->getDefaults();

        return [
            'title' => $template['title'] ?? $defaults['title'],
            'description' => $template['description'] ?? $defaults['description'],
            'keywords' => $template['keywords'] ?? $defaults['keywords'],
            'image' => $defaults['image'],
            'url' => url('/'),
            'type' => $defaults['type'],
            'site_name' => $defaults['site_name'],
            'locale' => $defaults['locale'],
            'schema' => $this->getWebsiteSchema(),
            'robots' => $this->getRobotsContent(),
        ];
    }

    public function forManga(Manga $manga): array
    {
        $template = $this->getTemplate('manga_show');
        $defaults = $this->getDefaults();

        $genres = $manga->taxonomyTerms()
            ->whereHas('taxonomy', fn($q) => $q->where('type', 'genre'))
            ->pluck('name')
            ->implode(', ');

        $title = str_replace('{manga_name}', $manga->name, $template['title']);
        $cleanDescription = strip_tags($manga->description ?? '');
        $limitedDescription = mb_strlen($cleanDescription) > 160 
            ? mb_substr($cleanDescription, 0, 160) . '...' 
            : $cleanDescription;
        
        $description = str_replace(
            '{manga_description}',
            $limitedDescription,
            $template['description']
        );
        $keywords = str_replace(['{manga_name}', '{manga_genres}'], [$manga->name, $genres], $template['keywords']);

        return [
            'title' => $title,
            'description' => $description,
            'keywords' => $keywords,
            'image' => $manga->cover_image ? url($manga->cover_image) : $defaults['image'],
            'url' => route('manga.show', $manga->slug),
            'type' => 'article',
            'site_name' => $defaults['site_name'],
            'locale' => $defaults['locale'],
            'schema' => $this->getMangaSchema($manga),
            'robots' => $this->getRobotsContent(),
        ];
    }

    public function forChapter(Chapter $chapter): array
    {
        $template = $this->getTemplate('chapter_show');
        $defaults = $this->getDefaults();
        $manga = $chapter->manga;

        $genres = $manga->taxonomyTerms()
            ->whereHas('taxonomy', fn($q) => $q->where('type', 'genre'))
            ->pluck('name')
            ->implode(', ');

        $title = str_replace(
            ['{manga_name}', '{chapter_number}', '{chapter_title}'],
            [$manga->name, $chapter->chapter_number, $chapter->title ?? ''],
            $template['title']
        );

        $description = str_replace(
            ['{manga_name}', '{chapter_number}', '{chapter_title}'],
            [$manga->name, $chapter->chapter_number, $chapter->title ?? ''],
            $template['description']
        );

        $keywords = str_replace(
            ['{manga_name}', '{chapter_number}', '{manga_genres}'],
            [$manga->name, $chapter->chapter_number, $genres],
            $template['keywords']
        );

        return [
            'title' => $title,
            'description' => $description,
            'keywords' => $keywords,
            'image' => $manga->cover_image ? url($manga->cover_image) : $defaults['image'],
            'url' => route('manga.chapters.show', [$manga->slug, $chapter->slug]),
            'type' => 'article',
            'site_name' => $defaults['site_name'],
            'locale' => $defaults['locale'],
            'schema' => $this->getChapterSchema($chapter),
            'robots' => $this->getRobotsContent(),
        ];
    }

    public function forMangaIndex(array $filters = []): array
    {
        $template = $this->getTemplate('manga_index');
        $defaults = $this->getDefaults();

        return [
            'title' => $template['title'],
            'description' => $template['description'],
            'keywords' => $template['keywords'],
            'image' => $defaults['image'],
            'url' => route('manga.index'),
            'type' => $defaults['type'],
            'site_name' => $defaults['site_name'],
            'locale' => $defaults['locale'],
            'schema' => $this->getWebsiteSchema(),
            'robots' => $this->getRobotsContent(),
        ];
    }

    public function forSearch(string $query, int $count = 0): array
    {
        $template = $this->getTemplate('search');
        $defaults = $this->getDefaults();

        $title = str_replace('{query}', $query, $template['title']);
        $description = str_replace(['{query}', '{count}'], [$query, $count], $template['description']);
        $keywords = str_replace('{query}', $query, $template['keywords']);

        return [
            'title' => $title,
            'description' => $description,
            'keywords' => $keywords,
            'image' => $defaults['image'],
            'url' => route('search', ['q' => $query]),
            'type' => $defaults['type'],
            'site_name' => $defaults['site_name'],
            'locale' => $defaults['locale'],
            'schema' => $this->getWebsiteSchema(),
            'robots' => $this->getRobotsContent(),
        ];
    }

    private function getMangaSchema(Manga $manga): array
    {
        $genres = $manga->taxonomyTerms()
            ->whereHas('taxonomy', fn($q) => $q->where('type', 'genre'))
            ->pluck('name')
            ->toArray();

        $authors = $manga->taxonomyTerms()
            ->whereHas('taxonomy', fn($q) => $q->where('type', 'author'))
            ->pluck('name')
            ->toArray();

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Book',
            'name' => $manga->name,
            'description' => strip_tags($manga->description ?? ''),
            'url' => route('manga.show', $manga->slug),
            'image' => $manga->cover_image ? url($manga->cover_image) : null,
            'genre' => $genres,
            'author' => array_map(fn($name) => ['@type' => 'Person', 'name' => $name], $authors),
            'publisher' => [
                '@type' => 'Organization',
                'name' => Config::get('seo.defaults.site_name'),
            ],
            'datePublished' => $manga->created_at?->toISOString(),
            'dateModified' => $manga->updated_at?->toISOString(),
            'aggregateRating' => [
                '@type' => 'AggregateRating',
                'ratingValue' => round($manga->rating, 1),
                'ratingCount' => $manga->rating_count,
                'bestRating' => 5,
                'worstRating' => 1,
            ],
            'offers' => [
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
                'availability' => 'https://schema.org/InStock',
            ],
        ];

        // Add breadcrumb
        $schema['breadcrumb'] = [
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => Config::get('seo.labels.home', 'Trang chủ'),
                    'item' => url('/'),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => Config::get('seo.labels.manga', 'Manga'),
                    'item' => route('manga.index'),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => $manga->name,
                    'item' => route('manga.show', $manga->slug),
                ],
            ],
        ];

        return $schema;
    }

    private function getChapterSchema(Chapter $chapter): array
    {
        $manga = $chapter->manga;
        
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $manga->name . ' - ' . Config::get('seo.labels.chapter', 'Chương') . ' ' . $chapter->chapter_number,
            'description' => Config::get('seo.labels.chapter_description_prefix', 'Đọc') . ' ' . $manga->name . ' ' . Config::get('seo.labels.chapter_description_suffix', 'chương') . ' ' . $chapter->chapter_number,
            'url' => route('manga.chapters.show', [$manga->slug, $chapter->slug]),
            'image' => $manga->cover_image ? url($manga->cover_image) : null,
            'datePublished' => $chapter->created_at?->toISOString(),
            'dateModified' => $chapter->updated_at?->toISOString(),
            'author' => [
                '@type' => 'Organization',
                'name' => Config::get('seo.defaults.site_name'),
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => Config::get('seo.defaults.site_name'),
            ],
            'isPartOf' => [
                '@type' => 'Book',
                'name' => $manga->name,
                'url' => route('manga.show', $manga->slug),
            ],
            'breadcrumb' => [
                '@type' => 'BreadcrumbList',
                'itemListElement' => [
                    [
                        '@type' => 'ListItem',
                        'position' => 1,
                        'name' => Config::get('seo.labels.home', 'Trang chủ'),
                        'item' => url('/'),
                    ],
                    [
                        '@type' => 'ListItem',
                        'position' => 2,
                        'name' => Config::get('seo.labels.manga', 'Manga'),
                        'item' => route('manga.index'),
                    ],
                    [
                        '@type' => 'ListItem',
                        'position' => 3,
                        'name' => $manga->name,
                        'item' => route('manga.show', $manga->slug),
                    ],
                    [
                        '@type' => 'ListItem',
                        'position' => 4,
                        'name' => Config::get('seo.labels.chapter', 'Chương') . ' ' . $chapter->chapter_number,
                        'item' => route('manga.chapters.show', [$manga->slug, $chapter->slug]),
                    ],
                ],
            ],
        ];
    }

    private function getWebsiteSchema(): array
    {
        return Config::get('seo.schema.website', []);
    }

    private function getRobotsContent(): string
    {
        $robots = Config::get('seo.robots', []);
        $content = [];

        if ($robots['index']) {
            $content[] = 'index';
        } else {
            $content[] = 'noindex';
        }

        if ($robots['follow']) {
            $content[] = 'follow';
        } else {
            $content[] = 'nofollow';
        }

        if (isset($robots['max_image_preview'])) {
            $content[] = 'max-image-preview:' . $robots['max_image_preview'];
        }

        if (isset($robots['max_snippet'])) {
            $content[] = 'max-snippet:' . $robots['max_snippet'];
        }

        if (isset($robots['max_video_preview'])) {
            $content[] = 'max-video-preview:' . $robots['max_video_preview'];
        }

        return implode(', ', $content);
    }
}