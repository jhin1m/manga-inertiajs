<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\Manga;
use App\Models\TaxonomyTerm;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class SearchService
{
    public function searchAll(string $query, ?int $perPage = null): array
    {
        $perPage = $perPage ?? config('search.pagination.per_page');

        return [
            'manga' => $this->searchManga($query, $perPage),
            'chapters' => $this->searchChapters($query, $perPage),
            'terms' => $this->searchTaxonomyTerms($query, $perPage),
        ];
    }

    public function searchManga(string $query, ?int $perPage = null): LengthAwarePaginator
    {
        $perPage = $perPage ?? config('search.pagination.per_page');

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
            ->orderByRaw('
                CASE 
                    WHEN title LIKE ? THEN 1
                    WHEN author LIKE ? THEN 2
                    WHEN artist LIKE ? THEN 3
                    WHEN description LIKE ? THEN 4
                    ELSE 5
                END
            ', ["%{$query}%", "%{$query}%", "%{$query}%", "%{$query}%"])
            ->orderBy('views', 'desc')
            ->paginate($perPage);
    }

    public function searchChapters(string $query, ?int $perPage = null): LengthAwarePaginator
    {
        $perPage = $perPage ?? config('search.pagination.per_page');

        return Chapter::with(['manga'])
            ->where('title', 'like', "%{$query}%")
            ->orWhereHas('manga', function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%");
            })
            ->orderByRaw('
                CASE 
                    WHEN title LIKE ? THEN 1
                    ELSE 2
                END
            ', ["%{$query}%"])
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    public function searchTaxonomyTerms(string $query, ?int $perPage = null): LengthAwarePaginator
    {
        $perPage = $perPage ?? config('search.pagination.per_page');

        return TaxonomyTerm::with(['taxonomy'])
            ->withCount('manga')
            ->where('name', 'like', "%{$query}%")
            ->orderByRaw('
                CASE 
                    WHEN name LIKE ? THEN 1
                    ELSE 2
                END
            ', ["%{$query}%"])
            ->orderBy('manga_count', 'desc')
            ->paginate($perPage);
    }

    public function advancedMangaSearch(array $criteria, ?int $perPage = null): LengthAwarePaginator
    {
        $perPage = $perPage ?? config('search.pagination.per_page');

        $query = Manga::with(['taxonomyTerms.taxonomy', 'chapters'])
            ->withCount('chapters');

        // Text search
        if (! empty($criteria['search'])) {
            $search = $criteria['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('artist', 'like', "%{$search}%");
            });
        }

        // Genre filter
        if (! empty($criteria['genres'])) {
            $genres = is_array($criteria['genres']) ? $criteria['genres'] : [$criteria['genres']];
            $query->whereHas('taxonomyTerms', function ($q) use ($genres) {
                $q->whereIn('slug', $genres)
                    ->whereHas('taxonomy', function ($taxonomy) {
                        $taxonomy->where('type', 'genre');
                    });
            });
        }

        // Author filter
        if (! empty($criteria['authors'])) {
            $authors = is_array($criteria['authors']) ? $criteria['authors'] : [$criteria['authors']];
            $query->whereHas('taxonomyTerms', function ($q) use ($authors) {
                $q->whereIn('slug', $authors)
                    ->whereHas('taxonomy', function ($taxonomy) {
                        $taxonomy->where('type', 'author');
                    });
            });
        }

        // Status filter
        if (! empty($criteria['status'])) {
            $statuses = is_array($criteria['status']) ? $criteria['status'] : [$criteria['status']];
            $query->whereIn('status', $statuses);
        }

        // Publication year filter
        if (! empty($criteria['year_from'])) {
            $query->where('publication_year', '>=', $criteria['year_from']);
        }

        if (! empty($criteria['year_to'])) {
            $query->where('publication_year', '<=', $criteria['year_to']);
        }

        // Chapter count filter
        if (! empty($criteria['min_chapters'])) {
            $query->having('chapters_count', '>=', $criteria['min_chapters']);
        }

        if (! empty($criteria['max_chapters'])) {
            $query->having('chapters_count', '<=', $criteria['max_chapters']);
        }

        // Exclude completed/ongoing
        if (! empty($criteria['exclude_completed'])) {
            $query->where('status', '!=', 'completed');
        }

        if (! empty($criteria['exclude_ongoing'])) {
            $query->where('status', '!=', 'ongoing');
        }

        // Apply sorting
        $this->applySorting($query, $criteria);

        return $query->paginate($perPage)->withQueryString();
    }

    public function getSearchSuggestions(string $query, ?int $limit = null): array
    {
        $limit = $limit ?? config('search.pagination.suggestions_limit');

        $mangaTitles = Manga::where('title', 'like', "%{$query}%")
            ->limit($limit)
            ->pluck('title')
            ->toArray();

        $authors = Manga::where('author', 'like', "%{$query}%")
            ->whereNotNull('author')
            ->limit($limit)
            ->pluck('author')
            ->unique()
            ->values()
            ->toArray();

        $genres = TaxonomyTerm::whereHas('taxonomy', function ($q) {
            $q->where('type', 'genre');
        })
            ->where('name', 'like', "%{$query}%")
            ->limit($limit)
            ->pluck('name')
            ->toArray();

        return [
            'manga' => $mangaTitles,
            'authors' => $authors,
            'genres' => $genres,
        ];
    }

    public function getSearchFilters(): array
    {
        return [
            'genres' => TaxonomyTerm::whereHas('taxonomy', function ($q) {
                $q->where('type', 'genre');
            })
                ->withCount('manga')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'manga_count']),

            'authors' => TaxonomyTerm::whereHas('taxonomy', function ($q) {
                $q->where('type', 'author');
            })
                ->withCount('manga')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'manga_count']),

            'statuses' => Manga::getStatuses(),

            'years' => Manga::selectRaw('DISTINCT publication_year')
                ->whereNotNull('publication_year')
                ->orderBy('publication_year', 'desc')
                ->pluck('publication_year')
                ->filter()
                ->values(),

        ];
    }

    private function applySorting(Builder $query, array $criteria): void
    {
        $sortBy = $criteria['sort'] ?? 'relevance';
        $order = $criteria['order'] ?? 'desc';

        switch ($sortBy) {
            case 'title':
                $query->orderBy('title', $order);
                break;
            case 'rating':
                $query->orderBy('rating', $order);
                break;
            case 'views':
            case 'popular':
                $query->orderBy('views', $order);
                break;
            case 'chapters':
                $query->orderBy('chapters_count', $order);
                break;
            case 'created_at':
            case 'newest':
                $query->orderBy('created_at', $order);
                break;
            case 'updated_at':
            case 'latest':
                $query->orderBy('updated_at', $order);
                break;
            case 'publication_year':
                $query->orderBy('publication_year', $order);
                break;
            case 'relevance':
            default:
                if (! empty($criteria['search'])) {
                    $search = $criteria['search'];
                    $query->orderByRaw('
                        CASE 
                            WHEN title LIKE ? THEN 1
                            WHEN author LIKE ? THEN 2
                            WHEN artist LIKE ? THEN 3
                            WHEN description LIKE ? THEN 4
                            ELSE 5
                        END
                    ', ["%{$search}%", "%{$search}%", "%{$search}%", "%{$search}%"]);
                }
                $query->orderBy('views', 'desc');
                break;
        }
    }
}
