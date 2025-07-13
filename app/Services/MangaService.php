<?php

namespace App\Services;

use App\Contracts\MangaRepositoryInterface;
use App\Models\Manga;
use App\Models\TaxonomyTerm;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class MangaService
{
    public function __construct(
        private MangaRepositoryInterface $mangaRepository
    ) {}

    public function getMangaList(array $filters = [], ?int $perPage = null): LengthAwarePaginator
    {
        return $this->mangaRepository->getMangaWithFilters($filters, $perPage);
    }

    public function getMangaDetail(Manga $manga): Manga
    {
        return $this->mangaRepository->getMangaDetail($manga);
    }

    public function getRelatedManga(Manga $manga, ?int $limit = null): Collection
    {
        return $this->mangaRepository->getRelatedManga($manga, $limit);
    }

    public function getFeaturedManga(?int $limit = null): Collection
    {
        return $this->mangaRepository->getFeaturedManga($limit);
    }

    public function getLatestManga(?int $limit = null): Collection
    {
        return $this->mangaRepository->getFeaturedManga($limit);
    }

    public function getPopularManga(?int $limit = null): Collection
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

    public function getTopRatedManga(?int $limit = null): Collection
    {
        return $this->mangaRepository->getTopRatedManga($limit);
    }

    public function searchManga(string $query, ?int $perPage = null): LengthAwarePaginator
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

        ];
    }
}
