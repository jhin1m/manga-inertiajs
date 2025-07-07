<?php

namespace App\Contracts;

use App\Models\Manga;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface MangaRepositoryInterface
{
    public function getHotManga(int $limit = 10): Collection;
    
    public function getLatestUpdates(int $limit = 12): Collection;
    
    public function getRankings(int $limit = 10): Collection;
    
    public function getRecommended(int $limit = 6): Collection;
    
    public function getFeaturedManga(int $limit = 10): Collection;
    
    public function getPopularManga(int $limit = 10): Collection;
    
    public function getTopRatedManga(int $limit = 10): Collection;
    
    public function getMangaWithFilters(array $filters, int $perPage = 20): LengthAwarePaginator;
    
    public function getMangaDetail(Manga $manga): Manga;
    
    public function getRelatedManga(Manga $manga, int $limit = 6): Collection;
    
    public function searchManga(string $query, int $perPage = 20): LengthAwarePaginator;
    
    public function createManga(array $data): Manga;
    
    public function updateManga(Manga $manga, array $data): Manga;
    
    public function deleteManga(Manga $manga): bool;
    
    public function incrementViewCount(Manga $manga): void;
}