<?php

namespace App\Http\Controllers;

use App\Http\Requests\MangaRequest;
use App\Models\Manga;
use App\Models\TaxonomyTerm;
use App\Services\MangaService;
use App\Services\ChapterService;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class MangaController extends Controller
{
    public function __construct(
        private MangaService $mangaService,
        private ChapterService $chapterService,
        private SeoService $seoService
    ) {}
    public function index(Request $request)
    {
        $filters = [
            'search' => $request->search,
            'genres' => $request->genres ?: [],
            'status' => $request->status,
            'rating' => $request->rating ? (float) $request->rating : 0,
            'sortBy' => $request->get('sortBy', 'latest'),
        ];

        // Allow user to specify per_page, otherwise use model default (12)
        $perPage = $request->get('per_page');

        // Get filter options
        $genres = TaxonomyTerm::whereHas('taxonomy', function ($q) {
            $q->where('type', 'genre');
        })->withCount('mangas')->get(['id', 'name', 'slug']);

        return Inertia::render('Manga/Index', [
            'manga' => Inertia::defer(fn() => $this->mangaService->getMangaList($filters, $perPage)),
            'filters' => $filters,
            'genres' => $genres,
            'statuses' => Manga::getStatuses(),
            'seo' => $this->seoService->forMangaIndex($filters),
            'translations' => [
                'title' => __('manga.index.title'),
                'found_count' => __('manga.index.found_count'),
                'no_manga_found' => __('manga.index.no_manga_found'),
                'no_manga_message' => __('manga.index.no_manga_message'),
                'chapters_count' => __('manga.index.chapters_count'),
                'views_count' => __('manga.index.views_count'),
                'sort_by' => __('manga.index.sort_by'),
                'filters' => __('manga.index.filters'),
            ],
        ]);
    }

    public function show(Manga $manga, Request $request)
    {
        $manga = $this->mangaService->getMangaDetail($manga);

        // Increment view count
        $this->mangaService->incrementViewCount($manga);

        // Get first and last chapters for navigation
        $firstChapter = $manga->chapters()->orderBy('chapter_number', 'asc')->first();
        $lastChapter = $manga->chapters()->orderBy('chapter_number', 'desc')->first();

        // Get genres, authors, artists, tags separately for better organization
        $genres = $manga->taxonomyTerms->filter(function ($term) {
            return $term->taxonomy->type === 'genre';
        })->values();

        $authors = $manga->taxonomyTerms->filter(function ($term) {
            return $term->taxonomy->type === 'author';
        })->values();

        $artists = $manga->taxonomyTerms->filter(function ($term) {
            return $term->taxonomy->type === 'artist';
        })->values();

        $tags = $manga->taxonomyTerms->filter(function ($term) {
            return $term->taxonomy->type === 'tag';
        })->values();

        return Inertia::render('Manga/Show', [
            'manga' => array_merge($manga->toArray(), [
                'genres' => $genres,
                'authors' => $authors,
                'artists' => $artists,
                'tags' => $tags,
                'first_chapter' => $firstChapter,
                'last_chapter' => $lastChapter,
            ]),
            'seo' => $manga->getSeoData(),
            // Use deferred props for chapters to improve initial page load performance
            
            'chapters' => Inertia::defer(function () use ($manga) {
                return $this->chapterService->getChaptersByManga($manga);
            }),
            'translations' => [
                'chapter_list' => __('manga.chapter_list'),
                'status_label' => __('manga.status_label'),
                'author_label' => __('manga.author_label'),
                'artist_label' => __('manga.artist_label'),
                'genre_label' => __('manga.genre_label'),
                'description_label' => __('manga.description_label'),
                'rating_label' => __('manga.rating_label'),
                'views_label' => __('manga.views_label'),
                'chapters_label' => __('manga.chapters_label'),
                'no_rating' => __('manga.no_rating'),
                'ratings_count' => __('manga.ratings_count'),
                'read_now' => __('manga.read_now'),
                'read_first' => __('manga.read_first'),
                'read_last' => __('manga.read_last'),
                'favorite' => __('manga.favorite'),
                'expand_more' => __('manga.expand_more'),
                'collapse' => __('manga.collapse'),
            ],
        ]);
    }

    public function store(MangaRequest $request)
    {
        $manga = $this->mangaService->createManga($request->validated());

        return redirect()->route('manga.show', $manga)
            ->with('success', 'Manga đã được tạo thành công!');
    }

    public function update(MangaRequest $request, Manga $manga)
    {
        $manga = $this->mangaService->updateManga($manga, $request->validated());

        return redirect()->route('manga.show', $manga)
            ->with('success', 'Manga đã được cập nhật thành công!');
    }

    public function destroy(Manga $manga)
    {
        $this->mangaService->deleteManga($manga);

        return redirect()->route('manga.index')
            ->with('success', 'Manga đã được xóa thành công!');
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $filters = [
            'search' => $query,
            'genres' => $request->get('genres', []),
            'status' => $request->get('status'),
            'rating' => $request->get('rating') ? (float) $request->get('rating') : 0,
            'sortBy' => $request->get('sortBy', 'latest'),
        ];

        // Allow user to specify per_page, otherwise use model default (12)
        $perPage = $request->get('per_page');

        // Cache genres for 1 hour since they don't change frequently
        $genres = Cache::remember('search_genres', config('cache.ttl.search_genres'), function () {
            return TaxonomyTerm::whereHas('taxonomy', function ($q) {
                $q->where('type', 'genre');
            })
            ->withCount('mangas')
            ->having('mangas_count', '>', 0) // Only genres with manga
            ->orderBy('mangas_count', 'desc')
            ->limit(config('manga.limits.top_genres')) // Limit to top genres
            ->get(['id', 'name', 'slug']);
        });

        // Cache popular manga for 30 minutes
        $popularManga = Cache::remember('search_popular_manga', config('cache.ttl.popular_manga'), function () {
            return Manga::where('status', 'published')
                ->orderBy('views', 'desc')
                ->limit(config('manga.limits.popular_display'))
                ->get(['id', 'name', 'slug']);
        });

        $manga = $this->mangaService->getMangaList($filters, $perPage);

        return Inertia::render('Search/Index', [
            'manga' => $manga,
            'query' => $query,
            'filters' => $filters,
            'genres' => $genres,
            'statuses' => Manga::getStatuses(),
            'popularManga' => $popularManga,
            'seo' => $this->seoService->forSearch($query, $manga->total()),
            'translations' => [
                'title' => __('search.title'),
                'placeholder' => __('search.placeholder'),
                'button' => __('search.button'),
                'results' => __('search.results'),
                'no_results' => __('search.no_results'),
                'no_results_message' => __('search.no_results_message'),
                'found_count' => __('search.found_count'),
                'search_for' => __('search.search_for'),
                'clear' => __('search.clear'),
                'advanced' => __('search.advanced'),
                'categories' => __('search.categories'),
                'all_categories' => __('search.all_categories'),
                'status' => __('search.status'),
                'all_statuses' => __('search.all_statuses'),
                'sort_by' => __('search.sort_by'),
                'sort_latest' => __('search.sort_latest'),
                'sort_popular' => __('search.sort_popular'),
                'sort_rating' => __('search.sort_rating'),
                'sort_alphabetical' => __('search.sort_alphabetical'),
                'min_rating' => __('search.min_rating'),
                'popular_manga' => __('search.popular_manga'),
                'popular_genres' => __('search.popular_genres'),
                'search_tips' => __('search.search_tips'),
                'tip_title' => __('search.tip_title'),
                'tip_author' => __('search.tip_author'),
                'tip_genre' => __('search.tip_genre'),
                'tip_hotkey' => __('search.tip_hotkey'),
                'back_to_home' => __('search.back_to_home'),
            ],
        ]);
    }

}
