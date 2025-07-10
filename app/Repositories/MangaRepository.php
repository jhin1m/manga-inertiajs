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
    public function getHotManga(?int $limit = null): Collection
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'status', 'views', 'rating', 'total_rating')
            ->with([
                'chapters' => function ($query) {
                    $query->select('id', 'manga_id', 'chapter_number', 'title', 'slug', 'updated_at')
                        ->orderBy('chapter_number', 'desc')
                        ->limit(config('manga.limits.latest_chapter'));
                }
            ])
            ->where('views', '>', config('manga.thresholds.hot_manga_views'))
            ->orderByRaw('(views * ' . config('manga.thresholds.hot_manga_view_weight') . ') + (rating * total_rating * ' . config('manga.thresholds.hot_manga_rating_weight') . ') DESC');
        
        if ($limit) {
            $query->limit($limit);
        }
        
        $results = $query
        ->get()
        ->map(function ($manga) {
            return [
                'id' => $manga->id,
                'name' => $manga->name,
                'slug' => $manga->slug,
                'cover' => $manga->cover,
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

    public function getLatestUpdates(?int $limit = null): Collection
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'status', 'updated_at')
            ->with([
                'taxonomyTerms:id,name,slug', 
                'chapters' => function ($query) {
                    $query->select('id', 'manga_id', 'chapter_number', 'title', 'slug', 'updated_at', 'created_at')
                        ->orderBy('chapter_number', 'desc')
                        ->limit(config('manga.limits.recent_chapters'));
                }
            ])
            ->whereHas('chapters')
            ->orderBy('updated_at', 'desc');
        
        if ($limit) {
            $query->limit($limit);
        }
        
        $results = $query
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

    public function getRankings(?int $limit = null): Collection
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'rating', 'views')
            ->orderBy('rating', 'desc')
            ->orderBy('total_rating', 'desc');
            
        if ($limit) {
            $query->limit($limit);
        }
        
        $results = $query
            ->get()
            ->map(function ($manga, $index) {
                return [
                    'rank' => $index + 1,
                    'id' => $manga->id,
                    'name' => $manga->name,
                    'slug' => $manga->slug,
                    'cover' => $manga->cover,
                    'rating' => $manga->rating,
                    'views' => $manga->views
                ];
            });

        return collect($results);
    }

    public function getRecommended(?int $limit = null): Collection
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'rating')
            ->where('rating', '>=', config('manga.thresholds.recommended_rating'))
            ->orderBy('rating', 'desc');
            
        if ($limit) {
            $query->limit($limit);
        }
        
        $results = $query
            ->get()
            ->map(function ($manga) {
                return [
                    'id' => $manga->id,
                    'name' => $manga->name,
                    'slug' => $manga->slug,
                    'cover' => $manga->cover,
                    'rating' => $manga->rating
                ];
            });

        return collect($results);
    }

    public function getFeaturedManga(?int $limit = null): Collection
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'status', 'views', 'rating')
            ->with([
                'taxonomyTerms:id,name,slug',
                'chapters' => function ($query) {
                    $query->select('id', 'manga_id', 'chapter_number', 'title', 'slug');
                }
            ])
            ->withCount('chapters')
            ->orderBy('views', 'desc')
            ->orderBy('rating', 'desc');
            
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query->get();
    }

    public function getPopularManga(?int $limit = null): Collection
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'status', 'views')
            ->with([
                'taxonomyTerms:id,name,slug',
                'chapters' => function ($query) {
                    $query->select('id', 'manga_id', 'chapter_number', 'title', 'slug');
                }
            ])
            ->withCount('chapters')
            ->orderBy('views', 'desc');
            
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query->get();
    }

    public function getTopRatedManga(?int $limit = null): Collection
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'status', 'rating', 'total_rating')
            ->with([
                'taxonomyTerms:id,name,slug',
                'chapters' => function ($query) {
                    $query->select('id', 'manga_id', 'chapter_number', 'title', 'slug');
                }
            ])
            ->withCount('chapters')
            ->topRated();
            
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query->get();
    }

    public function getMangaWithFilters(array $filters, ?int $perPage = null): LengthAwarePaginator
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'status', 'views', 'rating', 'created_at', 'updated_at')
            ->with([
                'taxonomyTerms:id,name,slug',
                'chapters' => function ($query) {
                    $query->select('id', 'manga_id', 'chapter_number', 'title', 'slug', 'updated_at', 'created_at')
                        ->orderBy('chapter_number', 'desc')
                        ->limit(config('manga.limits.recent_chapters'));
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

    public function getRelatedManga(Manga $manga, ?int $limit = null): Collection
    {
        $query = Manga::select('id', 'name', 'slug', 'cover', 'status', 'views', 'rating')
            ->with('taxonomyTerms:id,name,slug')
            ->whereHas('taxonomyTerms', function ($query) use ($manga) {
                $query->whereIn('manga_taxonomy_terms.taxonomy_term_id', $manga->taxonomyTerms->pluck('id'));
            })
            ->where('mangas.id', '!=', $manga->id);
        
        if ($limit) {
            $query->limit($limit);
        }
        
        return $query->get();
    }

    public function searchManga(string $query, ?int $perPage = null): LengthAwarePaginator
    {
        return Manga::select('id', 'name', 'slug', 'cover', 'status', 'views', 'rating', 'alternative_names', 'description')
            ->with([
                'taxonomyTerms' => function ($query) {
                    $query->select('taxonomy_terms.id', 'taxonomy_terms.name', 'taxonomy_terms.slug')
                        ->with('taxonomy:id,name,slug');
                },
                'chapters' => function ($query) {
                    $query->select('id', 'manga_id', 'chapter_number', 'title', 'slug');
                }
            ])
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