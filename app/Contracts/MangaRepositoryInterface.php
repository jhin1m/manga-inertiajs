<?php

namespace App\Contracts;

use App\Models\Manga;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface MangaRepositoryInterface
{
    public function getHotManga(?int $limit = null): Collection;

    public function getLatestUpdates(?int $limit = null): Collection;

    public function getRankings(?int $limit = null): Collection;

    public function getRecommended(?int $limit = null): Collection;

    public function getFeaturedManga(?int $limit = null): Collection;

    public function getPopularManga(?int $limit = null): Collection;

    public function getTopRatedManga(?int $limit = null): Collection;

    public function getMangaWithFilters(array $filters, ?int $perPage = null): LengthAwarePaginator;

    public function getMangaDetail(Manga $manga): Manga;

    public function getRelatedManga(Manga $manga, ?int $limit = null): Collection;

    public function getGenres(): Collection;

    public function searchManga(string $query, ?int $perPage = null): LengthAwarePaginator;

    public function createManga(array $data): Manga;

    public function updateManga(Manga $manga, array $data): Manga;

    public function deleteManga(Manga $manga): bool;

    public function incrementViewCount(Manga $manga): void;
}
