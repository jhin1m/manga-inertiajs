<?php

namespace App\Http\Controllers;

use App\Models\Manga;
use App\Models\TaxonomyTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MangaController extends Controller
{
    public function index(Request $request)
    {
        $query = Manga::with([
            'taxonomyTerms', 
            'chapters' => function ($query) {
                $query->orderBy('chapter_number', 'desc')->limit(3);
            }
        ])
        ->withCount('chapters');

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('alternative_names', 'like', '%' . $request->search . '%');
        }

        // Filter by genres (multiple)
        if ($request->filled('genres')) {
            $genres = is_array($request->genres) ? $request->genres : [$request->genres];
            $query->whereHas('taxonomyTerms', function ($q) use ($genres) {
                $q->whereIn('taxonomy_terms.id', $genres)
                  ->whereHas('taxonomy', function ($taxonomy) {
                      $taxonomy->where('type', 'genre');
                  });
            });
        }

        // Filter by rating
        if ($request->filled('rating') && $request->rating > 0) {
            $query->where('rating', '>=', $request->rating);
        }

        // Filter by year
        if ($request->filled('year')) {
            $query->whereYear('created_at', $request->year);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort options
        $sortBy = $request->get('sortBy', 'latest');
        
        switch ($sortBy) {
            case 'views':
                $query->orderBy('views', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc')->orderBy('total_rating', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'latest':
            default:
                $query->orderBy('updated_at', 'desc');
                break;
        }

        $manga = $query->paginate(20)->withQueryString();
        
        // Transform chapters to recent_chapters format for MangaCard compatibility
        $manga->getCollection()->transform(function ($manga) {
            $manga->recent_chapters = $manga->chapters->map(function ($chapter) {
                return [
                    'chapter_number' => $chapter->chapter_number,
                    'title' => $chapter->title,
                    'slug' => $chapter->slug,
                    'updated_at' => $chapter->updated_at,
                    'created_at' => $chapter->created_at,
                ];
            });
            return $manga;
        });

        // Get filter options
        $genres = TaxonomyTerm::whereHas('taxonomy', function ($q) {
            $q->where('type', 'genre');
        })->withCount('mangas')->get(['id', 'name', 'slug']);

        return Inertia::render('Manga/Index', [
            'manga' => $manga,
            'filters' => [
                'search' => $request->search,
                'genres' => $request->genres ?: [],
                'status' => $request->status,
                'rating' => $request->rating ? (float) $request->rating : 0,
                'year' => $request->year,
                'sortBy' => $sortBy,
            ],
            'genres' => $genres,
            'statuses' => Manga::getStatuses(),
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
        $manga->load([
            'taxonomyTerms.taxonomy',
        ]);

        // Load chapters with pagination
        $chapters = $manga->chapters()
            ->orderBy('chapter_number', 'desc')
            ->paginate(150);

        // Increment view count
        $manga->increment('views');

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
            'chapters' => $chapters,
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

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'alternative_names' => 'nullable|array',
            'description' => 'nullable|string',
            'status' => 'required|in:ongoing,completed,hiatus,cancelled',
            'cover' => 'nullable|string',
            'slug' => 'required|string|unique:mangas,slug',
            'rating' => 'nullable|numeric|min:0|max:10',
            'total_rating' => 'nullable|integer|min:0',
        'genre_ids' => 'nullable|array',
            'genre_ids.*' => 'exists:taxonomy_terms,id'
        ]);

        $manga = Manga::create($validatedData);

        // Attach genres if provided
        if (isset($validatedData['genre_ids'])) {
            $manga->taxonomyTerms()->attach($validatedData['genre_ids']);
        }

        return redirect()->route('manga.show', $manga)
            ->with('success', 'Manga đã được tạo thành công!');
    }

    public function update(Request $request, Manga $manga)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'alternative_names' => 'nullable|array',
            'description' => 'nullable|string',
            'status' => 'required|in:ongoing,completed,hiatus,cancelled',
            'cover' => 'nullable|string',
            'slug' => 'required|string|unique:mangas,slug,' . $manga->id,
            'rating' => 'nullable|numeric|min:0|max:10',
            'total_rating' => 'nullable|integer|min:0',
            'genre_ids' => 'nullable|array',
            'genre_ids.*' => 'exists:taxonomy_terms,id'
        ]);

        $manga->update($validatedData);

        // Sync genres
        if (isset($validatedData['genre_ids'])) {
            $manga->taxonomyTerms()->sync($validatedData['genre_ids']);
        }

        return redirect()->route('manga.show', $manga)
            ->with('success', 'Manga đã được cập nhật thành công!');
    }

    public function destroy(Manga $manga)
    {
        $manga->delete();

        return redirect()->route('manga.index')
            ->with('success', 'Manga đã được xóa thành công!');
    }

    public function getLatestUpdates($limit = 12)
    {
        return Manga::with([
            'taxonomyTerms.taxonomy',
            'chapters' => function ($query) {
                $query->orderBy('chapter_number', 'desc')
                      ->limit(3);
            }
        ])
        ->whereHas('chapters')
        ->orderBy('updated_at', 'desc')
        ->limit($limit)
        ->get()
        ->map(function ($manga) {
            return [
                'id' => $manga->id,
                'name' => $manga->name,
                'slug' => $manga->slug,
                'cover' => $manga->cover,
                'status' => $manga->status,
                'recent_chapters' => $manga->chapters->map(function ($chapter) {
                    return [
                        'chapter_number' => $chapter->chapter_number,
                        'title' => $chapter->title,
                        'slug' => $chapter->slug,
                        'updated_at' => $chapter->updated_at,
                        'created_at' => $chapter->created_at,
                    ];
                })
            ];
        });
    }

    /**
     * Lấy danh sách Hot Manga dựa trên views và rating
     */
    public function getHotManga($limit = 10)
    {
        return Manga::with([
            'chapters' => function ($query) {
                $query->orderBy('chapter_number', 'desc')
                      ->limit(1); // Lấy chapter mới nhất
            }
        ])
        ->where('views', '>', 1000) // Chỉ lấy manga có views > 1000
        ->orderByRaw('(views * 0.7) + (rating * total_rating * 0.3) DESC') // Công thức tính hot score
        ->limit($limit)
        ->get()
        ->map(function ($manga) {
            return [
                'id' => $manga->id,
                'name' => $manga->name,
                'slug' => $manga->slug,
                'cover' => $manga->cover ?: '/api/placeholder/200/280',
                'status' => $manga->status,
                'latest_chapter' => $manga->chapters->first() ? [
                    'chapter_number' => $manga->chapters->first()->chapter_number,
                    'title' => $manga->chapters->first()->title,
                    'slug' => $manga->chapters->first()->slug,
                    'updated_at' => $manga->chapters->first()->updated_at->format('Y-m-d')
                ] : null
            ];
        });
    }

    /**
     * Lấy danh sách Rankings theo rating cao nhất
     */
    public function getRankings($limit = 10)
    {
        return Manga::select('id', 'name', 'slug', 'cover', 'rating', 'views')
            ->orderBy('rating', 'desc')
            ->orderBy('total_rating', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($manga, $index) {
                return [
                    'rank' => $index + 1,
                    'id' => $manga->id,
                    'name' => $manga->name,
                    'slug' => $manga->slug,
                    'cover' => $manga->cover ?: '/api/placeholder/100/140',
                    'rating' => $manga->rating,
                    'views' => $manga->views
                ];
            });
    }

    /**
     * Lấy danh sách Recommended manga
     */
    public function getRecommended($limit = 6)
    {
        return Manga::where('rating', '>=', 4.0)
            ->orderBy('rating', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($manga) {
                return [
                    'id' => $manga->id,
                    'name' => $manga->name,
                    'slug' => $manga->slug,
                    'cover' => $manga->cover ?: '/api/placeholder/150/200',
                    'rating' => $manga->rating
                ];
            });
    }
}
