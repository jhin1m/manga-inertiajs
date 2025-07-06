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
        $query = Manga::with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters');

        // Search functionality
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('alternative_names', 'like', '%' . $request->search . '%');
        }

        // Filter by genre
        if ($request->filled('genre')) {
            $query->whereHas('taxonomyTerms', function ($q) use ($request) {
                $q->where('slug', $request->genre)
                  ->whereHas('taxonomy', function ($taxonomy) {
                      $taxonomy->where('type', 'genre');
                  });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort options
        $sortBy = $request->get('sort', 'updated_at');
        $sortOrder = $request->get('order', 'desc');
        
        if ($sortBy === 'popular') {
            $query->orderBy('views', 'desc');
        } elseif ($sortBy === 'rating') {
            $query->orderBy('rating', 'desc');
        } elseif ($sortBy === 'title') {
            $query->orderBy('name', 'asc');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $manga = $query->paginate(20)->withQueryString();

        // Get filter options
        $genres = TaxonomyTerm::whereHas('taxonomy', function ($q) {
            $q->where('type', 'genre');
        })->get(['name', 'slug']);

        return Inertia::render('Manga/Index', [
            'manga' => $manga,
            'filters' => [
                'search' => $request->search,
                'genre' => $request->genre,
                'status' => $request->status,
                'sort' => $sortBy,
                'order' => $sortOrder,
            ],
            'genres' => $genres,
            'statuses' => Manga::getStatuses(),
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

        // Get genres, authors, tags separately for better organization
        $genres = $manga->taxonomyTerms->filter(function ($term) {
            return $term->taxonomy->type === 'genre';
        })->values();

        $authors = $manga->taxonomyTerms->filter(function ($term) {
            return $term->taxonomy->type === 'author';
        })->values();

        return Inertia::render('Manga/Show', [
            'manga' => $manga->load([
                'taxonomyTerms.taxonomy',
            ]),
            'chapters' => $chapters,
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
