<?php

namespace App\Repositories;

use App\Contracts\MangaRepositoryInterface;
use App\Models\Manga;
use App\Models\TaxonomyTerm;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class MangaRepository implements MangaRepositoryInterface
{
    public function getHotManga(int $limit = 10): Collection
    {
        $results = Manga::with([
            'chapters' => function ($query) {
                $query->orderBy('chapter_number', 'desc')->limit(1);
            }
        ])
        ->where('views', '>', 1000)
        ->orderByRaw('(views * 0.7) + (rating * total_rating * 0.3) DESC')
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

        return collect($results);
    }

    public function getLatestUpdates(int $limit = 12): Collection
    {
        $results = Manga::with([
            'taxonomyTerms', 
            'chapters' => function ($query) {
                $query->orderBy('chapter_number', 'desc')->limit(3);
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

        return collect($results);
    }

    public function getRankings(int $limit = 10): Collection
    {
        $results = Manga::select('id', 'name', 'slug', 'cover', 'rating', 'views')
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

        return collect($results);
    }

    public function getRecommended(int $limit = 6): Collection
    {
        $results = Manga::where('rating', '>=', 4.0)
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

        return collect($results);
    }

    public function getFeaturedManga(int $limit = 10): Collection
    {
        return Manga::with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters')
            ->orderBy('views', 'desc')
            ->orderBy('rating', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getPopularManga(int $limit = 10): Collection
    {
        return Manga::with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters')
            ->orderBy('views', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getTopRatedManga(int $limit = 10): Collection
    {
        return Manga::with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters')
            ->topRated()
            ->limit($limit)
            ->get();
    }

    public function getMangaWithFilters(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = Manga::with([
            'taxonomyTerms', 
            'chapters' => function ($query) {
                $query->orderBy('chapter_number', 'desc')->limit(3);
            }
        ])
        ->withCount('chapters');

        $query = $this->applyFilters($query, $filters);
        $query = $this->applySorting($query, $filters);

        $manga = $query->paginate($perPage)->withQueryString();
        
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

        return $manga;
    }

    public function getMangaDetail(Manga $manga): Manga
    {
        return $manga->load([
            'taxonomyTerms.taxonomy',
        ]);
    }

    public function getRelatedManga(Manga $manga, int $limit = 6): Collection
    {
        return Manga::whereHas('taxonomyTerms', function ($query) use ($manga) {
            $query->whereIn('manga_taxonomy_terms.taxonomy_term_id', $manga->taxonomyTerms->pluck('id'));
        })
        ->where('mangas.id', '!=', $manga->id)
        ->limit($limit)
        ->get();
    }

    public function searchManga(string $query, int $perPage = 20): LengthAwarePaginator
    {
        return Manga::with(['taxonomyTerms.taxonomy', 'chapters'])
            ->withCount('chapters')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('alternative_names', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->orWhereHas('taxonomyTerms', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orderBy('views', 'desc')
            ->paginate($perPage);
    }

    public function createManga(array $data): Manga
    {
        $genreIds = $data['genre_ids'] ?? [];
        unset($data['genre_ids']);

        $manga = Manga::create($data);

        if (!empty($genreIds)) {
            $manga->taxonomyTerms()->attach($genreIds);
        }

        return $manga->load(['taxonomyTerms.taxonomy']);
    }

    public function updateManga(Manga $manga, array $data): Manga
    {
        $genreIds = $data['genre_ids'] ?? [];
        unset($data['genre_ids']);

        $manga->update($data);

        if (isset($genreIds)) {
            $manga->taxonomyTerms()->sync($genreIds);
        }

        return $manga->load(['taxonomyTerms.taxonomy']);
    }

    public function deleteManga(Manga $manga): bool
    {
        $manga->taxonomyTerms()->detach();
        $manga->chapters()->delete();
        return $manga->delete();
    }

    public function incrementViewCount(Manga $manga): void
    {
        $manga->increment('views');
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        // Search functionality
        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('alternative_names', 'like', '%' . $filters['search'] . '%');
        }

        // Filter by genres (multiple)
        if (!empty($filters['genres'])) {
            $genres = is_array($filters['genres']) ? $filters['genres'] : [$filters['genres']];
            $query->whereHas('taxonomyTerms', function ($q) use ($genres) {
                $q->whereIn('taxonomy_terms.id', $genres)
                  ->whereHas('taxonomy', function ($taxonomy) {
                      $taxonomy->where('type', 'genre');
                  });
            });
        }

        // Filter by rating
        if (!empty($filters['rating']) && $filters['rating'] > 0) {
            $query->where('rating', '>=', $filters['rating']);
        }

        // Filter by year
        if (!empty($filters['year'])) {
            $query->whereYear('created_at', $filters['year']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query;
    }

    private function applySorting(Builder $query, array $filters): Builder
    {
        $sortBy = $filters['sortBy'] ?? 'latest';
        
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

        return $query;
    }
}