<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChapterRequest;
use App\Models\Chapter;
use App\Models\Manga;
use App\Services\ChapterService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChapterController extends Controller
{
    public function __construct(
        private ChapterService $chapterService
    ) {}
    public function index(Manga $manga)
    {
        $chapters = $this->chapterService->getChaptersByManga($manga, 20);

        return Inertia::render('Chapter/Index', [
            'manga' => $manga,
            'chapters' => $chapters
        ]);
    }

    public function show(Manga $manga, Chapter $chapter)
    {
        // Ensure chapter belongs to manga
        if ($chapter->manga_id !== $manga->id) {
            abort(404);
        }

        $chapter = $this->chapterService->getChapterDetail($chapter);
        $adjacentChapters = $this->chapterService->getAdjacentChapters($chapter);

        // Increment view count
        $this->chapterService->incrementViewCount($chapter);

        return Inertia::render('Chapter/Show', [
            'manga' => $manga,
            'chapter' => $chapter,
            'previousChapter' => $adjacentChapters['previous'],
            'nextChapter' => $adjacentChapters['next'],
            // Defer allChapters to improve page load performance for manga with many chapters
            'allChapters' => Inertia::defer(function () use ($manga) {
                return $this->chapterService->getAllChaptersByManga($manga);
            }),
            'pages' => $chapter->pages,
            'translations' => [
                'home' => __('chapter.home'),
                'chapter_list' => __('chapter.chapter_list'),
                'previous_chapter' => __('chapter.previous_chapter'),
                'next_chapter' => __('chapter.next_chapter'),
                'select_chapter' => __('chapter.select_chapter'),
                'views' => __('chapter.views'),
                'chapter_short' => __('chapter.chapter_short'),
                'chapter_prefix' => __('chapter.chapter_prefix'),
            ]
        ]);
    }

    public function store(ChapterRequest $request, Manga $manga)
    {
        try {
            $chapter = $this->chapterService->createChapter($manga, $request->validated());
            return redirect()->route('manga.chapters.show', [$manga, $chapter])
                ->with('success', 'Chương đã được tạo thành công!');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['chapter_number' => $e->getMessage()]);
        }
    }

    public function update(ChapterRequest $request, Manga $manga, Chapter $chapter)
    {
        // Ensure chapter belongs to manga
        if ($chapter->manga_id !== $manga->id) {
            abort(404);
        }

        try {
            $chapter = $this->chapterService->updateChapter($chapter, $request->validated());
            return redirect()->route('manga.chapters.show', [$manga, $chapter])
                ->with('success', 'Chương đã được cập nhật thành công!');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['chapter_number' => $e->getMessage()]);
        }
    }

    public function destroy(Manga $manga, Chapter $chapter)
    {
        // Ensure chapter belongs to manga
        if ($chapter->manga_id !== $manga->id) {
            abort(404);
        }

        $this->chapterService->deleteChapter($chapter);

        return redirect()->route('manga.chapters.index', $manga)
            ->with('success', 'Chương đã được xóa thành công!');
    }
}
