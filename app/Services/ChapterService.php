<?php

namespace App\Services;

use App\Contracts\ChapterRepositoryInterface;
use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ChapterService
{
    public function __construct(
        private ChapterRepositoryInterface $chapterRepository
    ) {}
    public function getChaptersByManga(Manga $manga, int $perPage = 20): LengthAwarePaginator
    {
        return $this->chapterRepository->getChaptersByManga($manga, $perPage);
    }

    public function getChapterDetail(Chapter $chapter): Chapter
    {
        return $this->chapterRepository->getChapterDetail($chapter);
    }

    public function getAdjacentChapters(Chapter $chapter): array
    {
        return $this->chapterRepository->getAdjacentChapters($chapter);
    }

    public function getAllChaptersByManga(Manga $manga): Collection
    {
        return $this->chapterRepository->getAllChaptersByManga($manga);
    }

    public function createChapter(Manga $manga, array $data): Chapter
    {
        return $this->chapterRepository->createChapter($manga, $data);
    }

    public function updateChapter(Chapter $chapter, array $data): Chapter
    {
        return $this->chapterRepository->updateChapter($chapter, $data);
    }

    public function deleteChapter(Chapter $chapter): bool
    {
        return $this->chapterRepository->deleteChapter($chapter);
    }

    public function incrementViewCount(Chapter $chapter): void
    {
        $this->chapterRepository->incrementViewCount($chapter);
    }

    public function getLatestChapters(int $limit = 20): Collection
    {
        return $this->chapterRepository->getLatestChapters($limit);
    }

    // TODO: Implement this
    // public function getChapterProgress(Chapter $chapter): array
    // {
    //     $totalPages = $chapter->pages()->count();
        
    //     return [
    //         'total_pages' => $totalPages,
    //         'current_page' => 1, // This would be tracked per user in a real app
    //         'progress_percentage' => $totalPages > 0 ? (1 / $totalPages) * 100 : 0
    //     ];
    // }

    public function getNextChapterNumber(Manga $manga): float
    {
        $lastChapter = $manga->chapters()
            ->orderBy('chapter_number', 'desc')
            ->first();

        return $lastChapter ? $lastChapter->chapter_number + 1 : 1;
    }

    public function validateChapterNumber(Manga $manga, float $chapterNumber, ?int $excludeChapterId = null): bool
    {
        $query = Chapter::where('manga_id', $manga->id)
            ->where('chapter_number', $chapterNumber);

        if ($excludeChapterId) {
            $query->where('id', '!=', $excludeChapterId);
        }

        return !$query->exists();
    }

    public function bulkUpdateChapterNumbers(Manga $manga, array $chapterUpdates): bool
    {
        try {
            \DB::beginTransaction();

            foreach ($chapterUpdates as $update) {
                $chapter = Chapter::findOrFail($update['id']);
                
                if ($chapter->manga_id !== $manga->id) {
                    throw new \InvalidArgumentException('Chapter không thuộc về manga này.');
                }

                $chapter->update(['chapter_number' => $update['chapter_number']]);
            }

            \DB::commit();
            return true;
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    // TODO: Implement this
    // public function getChapterStats(Chapter $chapter): array
    // {
    //     return [
    //         'views' => $chapter->views,
    //         'published_at' => $chapter->published_at,
    //         'reading_time_estimate' => $this->estimateReadingTime($chapter)
    //     ];
    // }

    // private function estimateReadingTime(Chapter $chapter): int
    // {
    //     // Estimate 30 seconds per page for manga reading
    //     $pagesCount = $chapter->pages()->count();
    //     return $pagesCount * 30; // seconds
    // }
} 