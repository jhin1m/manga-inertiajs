<?php

namespace App\Services;

use App\Contracts\MangaRepositoryInterface;
use App\Models\Manga;
use App\Models\TaxonomyTerm;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class MangaService
{
    public function __construct(
        private MangaRepositoryInterface $mangaRepository
    ) {}

    public function getMangaList(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->mangaRepository->getMangaWithFilters($filters, $perPage);
    }

    public function getMangaDetail(Manga $manga): Manga
    {
        return $this->mangaRepository->getMangaDetail($manga);
    }

    public function getRelatedManga(Manga $manga, int $limit = 6): Collection
    {
        return $this->mangaRepository->getRelatedManga($manga, $limit);
    }

    public function getFeaturedManga(int $limit = 10): Collection
    {
        return $this->mangaRepository->getFeaturedManga($limit);
    }

    public function getLatestManga(int $limit = 10): Collection
    {
        return $this->mangaRepository->getFeaturedManga($limit);
    }

    public function getPopularManga(int $limit = 10): Collection
    {
        return $this->mangaRepository->getPopularManga($limit);
    }

    public function createManga(array $data): Manga
    {
        return $this->mangaRepository->createManga($data);
    }

    public function updateManga(Manga $manga, array $data): Manga
    {
        return $this->mangaRepository->updateManga($manga, $data);
    }

    public function deleteManga(Manga $manga): bool
    {
        return $this->mangaRepository->deleteManga($manga);
    }

    public function incrementViewCount(Manga $manga): void
    {
        $this->mangaRepository->incrementViewCount($manga);
    }

    public function addRating(Manga $manga, float $rating): void
    {
        $manga->updateRating($rating);
    }

    public function getTopRatedManga(int $limit = 10): Collection
    {
        return $this->mangaRepository->getTopRatedManga($limit);
    }

    public function searchManga(string $query, int $perPage = 20): LengthAwarePaginator
    {
        return $this->mangaRepository->searchManga($query, $perPage);
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
            
            'statuses' => Manga::getStatuses(),
            
            'years' => Manga::selectRaw('DISTINCT publication_year')
                ->whereNotNull('publication_year')
                ->orderBy('publication_year', 'desc')
                ->pluck('publication_year')
                ->filter()
                ->values()
        ];
    }
} 