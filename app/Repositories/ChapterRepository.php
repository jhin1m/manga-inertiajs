<?php

namespace App\Repositories;

use App\Contracts\ChapterRepositoryInterface;
use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ChapterRepository implements ChapterRepositoryInterface
{
    public function getChaptersByManga(Manga $manga, ?int $perPage = null): LengthAwarePaginator
    {
        return $manga->chapters()
            ->select('id', 'manga_id', 'title', 'chapter_number', 'volume_number', 'slug', 'views', 'published_at', 'created_at', 'updated_at')
            ->orderBy('chapter_number', 'desc')
            ->paginate($perPage);
    }

    public function getChapterDetail(Chapter $chapter): Chapter
    {
        return $chapter->load([
            'manga:id,name,slug,status',
            'pages' => function ($query) {
                $query->select('id', 'chapter_id', 'page_number', 'image_url')
                    ->orderBy('page_number');
            },
        ]);
    }

    public function getAdjacentChapters(Chapter $chapter): array
    {
        $previousChapter = Chapter::select('id', 'manga_id', 'title', 'chapter_number', 'slug')
            ->where('manga_id', $chapter->manga_id)
            ->where('chapter_number', '<', $chapter->chapter_number)
            ->orderBy('chapter_number', 'desc')
            ->first();

        $nextChapter = Chapter::select('id', 'manga_id', 'title', 'chapter_number', 'slug')
            ->where('manga_id', $chapter->manga_id)
            ->where('chapter_number', '>', $chapter->chapter_number)
            ->orderBy('chapter_number', 'asc')
            ->first();

        return [
            'previous' => $previousChapter,
            'next' => $nextChapter,
        ];
    }

    public function getAllChaptersByManga(Manga $manga): Collection
    {
        return Chapter::where('manga_id', $manga->id)
            ->orderBy('chapter_number', 'asc')
            ->select('id', 'title', 'chapter_number', 'slug')
            ->get();
    }

    public function createChapter(Manga $manga, array $data): Chapter
    {
        // Check if chapter number already exists
        $existingChapter = Chapter::select('id')
            ->where('manga_id', $manga->id)
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
            $existingChapter = Chapter::select('id')
                ->where('manga_id', $chapter->manga_id)
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
        $chapter->pages()->delete();

        return $chapter->delete();
    }

    public function incrementViewCount(Chapter $chapter): void
    {
        $chapter->increment('views');
    }

    public function getNextChapterNumber(Manga $manga): float
    {
        $lastChapter = $manga->chapters()
            ->select('chapter_number')
            ->orderBy('chapter_number', 'desc')
            ->first();

        return $lastChapter ? $lastChapter->chapter_number + 1 : 1;
    }

    public function validateChapterNumber(Manga $manga, float $chapterNumber, ?int $excludeChapterId = null): bool
    {
        $query = Chapter::select('id')
            ->where('manga_id', $manga->id)
            ->where('chapter_number', $chapterNumber);

        if ($excludeChapterId) {
            $query->where('id', '!=', $excludeChapterId);
        }

        return ! $query->exists();
    }
}
