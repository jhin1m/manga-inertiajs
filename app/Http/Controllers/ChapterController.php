<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChapterRequest;
use App\Models\Chapter;
use App\Models\Manga;
use App\Services\ChapterService;
use App\Services\ImageEncryptionService;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChapterController extends Controller
{
    public function __construct(
        private ChapterService $chapterService,
        private SeoService $seoService,
        private ImageEncryptionService $encryptionService
    ) {}

    public function index(Manga $manga, Request $request)
    {
        // Allow user to specify per_page, otherwise use model default
        $perPage = $request->get('per_page');
        $chapters = $this->chapterService->getChaptersByManga($manga, $perPage);

        return Inertia::render('Chapter/Index', [
            'manga' => $manga,
            'chapters' => $chapters,
            'seo' => $this->seoService->forManga($manga),
        ]);
    }

    public function show(Manga $manga, Chapter $chapter, Request $request)
    {
        // Ensure chapter belongs to manga
        if ($chapter->manga_id !== $manga->id) {
            abort(404);
        }

        $chapter = $this->chapterService->getChapterDetail($chapter);
        $adjacentChapters = $this->chapterService->getAdjacentChapters($chapter);

        // Only load recent chapters for bookmark functionality (optimized)
        $recentChapters = $manga->chapters()
            ->select('chapter_number', 'title', 'slug', 'updated_at', 'created_at')
            ->orderBy('chapter_number', 'desc')
            ->limit(config('manga.limits.recent_chapters', 3))
            ->get()
            ->map(function ($ch) {
                return [
                    'chapter_number' => $ch->chapter_number,
                    'title' => $ch->title,
                    'slug' => $ch->slug,
                    'updated_at' => $ch->updated_at,
                    'created_at' => $ch->created_at,
                ];
            })->toArray();

        // Only increment view count on the initial HTML request, not on subsequent asset requests.
        if ($request->acceptsHtml() && ! $request->header('X-Inertia')) {
            $this->chapterService->incrementViewCount($chapter);
        }

        // Encrypt page image URLs for frontend
        $encryptedPages = $chapter->pages->map(function ($page) {
            return [
                'id' => $page->id,
                'chapter_id' => $page->chapter_id,
                'page_number' => $page->page_number,
                'image_url' => $this->encryptionService->encrypt($page->image_url),
                'image_url_2' => $page->image_url_2 ? $this->encryptionService->encrypt($page->image_url_2) : null,
            ];
        });

        return Inertia::render('Chapter/Show', [
            'manga' => array_merge($manga->toArray(), [
                'recent_chapters' => $recentChapters,
            ]),
            'chapter' => $chapter,
            'previousChapter' => $adjacentChapters['previous'],
            'nextChapter' => $adjacentChapters['next'],
            'seo' => $chapter->getSeoData(),
            // Defer allChapters to improve page load performance for manga with many chapters
            'allChapters' => Inertia::defer(function () use ($manga) {
                return $this->chapterService->getAllChaptersByManga($manga);
            }),
            'pages' => $encryptedPages,
            'translations' => [
                'home' => __('chapter.home'),
                'chapter_list' => __('chapter.chapter_list'),
                'previous_chapter' => __('chapter.previous_chapter'),
                'next_chapter' => __('chapter.next_chapter'),
                'select_chapter' => __('chapter.select_chapter'),
                'views' => __('chapter.views'),
                'chapter_short' => __('chapter.chapter_short'),
                'chapter_prefix' => __('chapter.chapter_prefix'),
            ],
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
