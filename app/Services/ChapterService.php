<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Pagination\LengthAwarePaginator;

class ChapterService
{
    public function getChaptersByManga(Manga $manga, int $perPage = 20): LengthAwarePaginator
    {
        return $manga->chapters()
            ->orderBy('chapter_number', 'desc')
            ->paginate($perPage);
    }

    public function getChapterDetail(Chapter $chapter): Chapter
    {
        return $chapter->load(['manga', 'pages' => function ($query) {
            $query->orderBy('page_number');
        }]);
    }

    public function getAdjacentChapters(Chapter $chapter): array
    {
        $previousChapter = Chapter::where('manga_id', $chapter->manga_id)
            ->where('chapter_number', '<', $chapter->chapter_number)
            ->orderBy('chapter_number', 'desc')
            ->first();

        $nextChapter = Chapter::where('manga_id', $chapter->manga_id)
            ->where('chapter_number', '>', $chapter->chapter_number)
            ->orderBy('chapter_number', 'asc')
            ->first();

        return [
            'previous' => $previousChapter,
            'next' => $nextChapter
        ];
    }

    public function createChapter(Manga $manga, array $data): Chapter
    {
        // Check if chapter number already exists
        $existingChapter = Chapter::where('manga_id', $manga->id)
            ->where('chapter_number', $data['chapter_number'])
            ->first();

        if ($existingChapter) {
            throw new \InvalidArgumentException('Số chương này đã tồn tại cho manga này.');
        }

        $data['manga_id'] = $manga->id;
        $data['published_at'] = $data['published_at'] ?? now();

        return Chapter::create($data);
    }

    public function updateChapter(Chapter $chapter, array $data): Chapter
    {
        // Check if chapter number already exists (excluding current chapter)
        if (isset($data['chapter_number'])) {
            $existingChapter = Chapter::where('manga_id', $chapter->manga_id)
                ->where('chapter_number', $data['chapter_number'])
                ->where('id', '!=', $chapter->id)
                ->first();

            if ($existingChapter) {
                throw new \InvalidArgumentException('Số chương này đã tồn tại cho manga này.');
            }
        }

        $chapter->update($data);
        return $chapter;
    }

    public function deleteChapter(Chapter $chapter): bool
    {
        // Delete all pages associated with this chapter
        $chapter->pages()->delete();
        
        return $chapter->delete();
    }

    public function incrementViewCount(Chapter $chapter): void
    {
        $chapter->increment('views');
    }

    public function getLatestChapters(int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return Chapter::with(['manga'])
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();
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
    //         'pages_count' => $chapter->pages()->count(),
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