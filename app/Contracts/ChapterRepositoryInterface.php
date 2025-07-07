<?php

namespace App\Contracts;

use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ChapterRepositoryInterface
{
    public function getChaptersByManga(Manga $manga, int $perPage = 20): LengthAwarePaginator;
    
    public function getChapterDetail(Chapter $chapter): Chapter;
    
    public function getAdjacentChapters(Chapter $chapter): array;
    
    public function getAllChaptersByManga(Manga $manga): Collection;
    
    public function getLatestChapters(int $limit = 20): Collection;
    
    public function createChapter(Manga $manga, array $data): Chapter;
    
    public function updateChapter(Chapter $chapter, array $data): Chapter;
    
    public function deleteChapter(Chapter $chapter): bool;
    
    public function incrementViewCount(Chapter $chapter): void;
    
    public function getNextChapterNumber(Manga $manga): float;
    
    public function validateChapterNumber(Manga $manga, float $chapterNumber, ?int $excludeChapterId = null): bool;
}