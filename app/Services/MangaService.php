<?php

namespace App\Services;

use App\Models\Manga;
use App\Models\TaxonomyTerm;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class MangaService
{
    public function getMangaList(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Manga::with(['taxonomyTerms.taxonomy', 'chapters'])
            ->withCount('chapters');

        $query = $this->applyFilters($query, $filters);
        $query = $this->applySorting($query, $filters);

        return $query->paginate($perPage)->withQueryString();
    }

    public function getMangaDetail(Manga $manga): Manga
    {
        return $manga->load([
            'taxonomyTerms.taxonomy',
            'chapters' => function ($query) {
                $query->orderBy('chapter_number', 'desc');
            }
        ]);
    }

    public function getRelatedManga(Manga $manga, int $limit = 6): \Illuminate\Database\Eloquent\Collection
    {
        return Manga::whereHas('taxonomyTerms', function ($query) use ($manga) {
            $query->whereIn('taxonomy_term_id', $manga->taxonomyTerms->pluck('id'));
        })
        ->where('id', '!=', $manga->id)
        ->limit($limit)
        ->get();
    }

    public function getFeaturedManga(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return Manga::with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters')
            ->orderBy('views', 'desc')
            ->orderBy('rating', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getLatestManga(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return Manga::with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getPopularManga(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return Manga::with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters')
            ->orderBy('views', 'desc')
            ->limit($limit)
            ->get();
    }

    public function createManga(array $data): Manga
    {
        $genreIds = $data['genre_ids'] ?? [];
        $authorIds = $data['author_ids'] ?? [];
        $tagIds = $data['tag_ids'] ?? [];
        
        unset($data['genre_ids'], $data['author_ids'], $data['tag_ids']);

        $manga = Manga::create($data);

        // Attach taxonomy terms
        $taxonomyTermIds = array_merge($genreIds, $authorIds, $tagIds);
        if (!empty($taxonomyTermIds)) {
            $manga->taxonomyTerms()->attach($taxonomyTermIds);
        }

        return $manga->load(['taxonomyTerms.taxonomy']);
    }

    public function updateManga(Manga $manga, array $data): Manga
    {
        $genreIds = $data['genre_ids'] ?? [];
        $authorIds = $data['author_ids'] ?? [];
        $tagIds = $data['tag_ids'] ?? [];
        
        unset($data['genre_ids'], $data['author_ids'], $data['tag_ids']);

        $manga->update($data);

        // Sync taxonomy terms
        $taxonomyTermIds = array_merge($genreIds, $authorIds, $tagIds);
        $manga->taxonomyTerms()->sync($taxonomyTermIds);

        return $manga->load(['taxonomyTerms.taxonomy']);
    }

    public function deleteManga(Manga $manga): bool
    {
        // Detach all taxonomy terms
        $manga->taxonomyTerms()->detach();
        
        // Delete all chapters and their pages (cascade should handle this)
        $manga->chapters()->delete();

        return $manga->delete();
    }

    public function incrementViewCount(Manga $manga): void
    {
        $manga->increment('views');
    }

    public function addRating(Manga $manga, float $rating): void
    {
        $manga->updateRating($rating);
    }

    public function getTopRatedManga(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return Manga::with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters')
            ->topRated()
            ->limit($limit)
            ->get();
    }

    public function searchManga(string $query, int $perPage = 20): LengthAwarePaginator
    {
        return Manga::with(['taxonomyTerms.taxonomy', 'chapters'])
            ->withCount('chapters')
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('author', 'like', "%{$query}%")
                  ->orWhere('artist', 'like', "%{$query}%");
            })
            ->orWhereHas('taxonomyTerms', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orderBy('views', 'desc')
            ->paginate($perPage);
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('artist', 'like', "%{$search}%");
            });
        }

        // Genre filter
        if (!empty($filters['genre'])) {
            $query->whereHas('taxonomyTerms', function ($q) use ($filters) {
                $q->where('slug', $filters['genre'])
                  ->whereHas('taxonomy', function ($taxonomy) {
                      $taxonomy->where('type', 'genre');
                  });
            });
        }

        // Author filter
        if (!empty($filters['author'])) {
            $query->whereHas('taxonomyTerms', function ($q) use ($filters) {
                $q->where('slug', $filters['author'])
                  ->whereHas('taxonomy', function ($taxonomy) {
                      $taxonomy->where('type', 'author');
                  });
            });
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Rating filter
        if (!empty($filters['min_rating'])) {
            $query->where('rating', '>=', $filters['min_rating']);
        }

        // Year filter
        if (!empty($filters['year'])) {
            $query->where('publication_year', $filters['year']);
        }

        return $query;
    }

    private function applySorting(Builder $query, array $filters): Builder
    {
        $sortBy = $filters['sort'] ?? 'updated_at';
        $sortOrder = $filters['order'] ?? 'desc';

        switch ($sortBy) {
            case 'popular':
                $query->orderBy('views', 'desc');
                break;
            case 'rating':
            case 'top_rated':
                $query->orderBy('rating', 'desc')
                      ->orderBy('total_rating', 'desc');
                break;
            case 'title':
                $query->orderBy('name', 'asc');
                break;
            case 'latest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'chapters':
                $query->orderBy('chapters_count', 'desc');
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        return $query;
    }

    public function getFilterOptions(): array
    {
        return [
            'genres' => TaxonomyTerm::whereHas('taxonomy', function ($q) {
                $q->where('type', 'genre');
            })->orderBy('name')->get(['id', 'name', 'slug']),
            
            'authors' => TaxonomyTerm::whereHas('taxonomy', function ($q) {
                $q->where('type', 'author');
            })->orderBy('name')->get(['id', 'name', 'slug']),
            
            'statuses' => [
                'ongoing' => 'Đang tiến hành',
                'completed' => 'Hoàn thành',
                'hiatus' => 'Tạm dừng',
                'cancelled' => 'Đã hủy'
            ],
            
            'years' => Manga::selectRaw('DISTINCT publication_year')
                ->whereNotNull('publication_year')
                ->orderBy('publication_year', 'desc')
                ->pluck('publication_year')
                ->filter()
                ->values()
        ];
    }
} 