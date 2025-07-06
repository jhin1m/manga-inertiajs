<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\Manga;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChapterController extends Controller
{
    public function index(Manga $manga)
    {
        $chapters = $manga->chapters()
            ->orderBy('chapter_number', 'desc')
            ->paginate(20);

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

        $chapter->load('pages');

        // Get adjacent chapters for navigation
        $previousChapter = Chapter::where('manga_id', $manga->id)
            ->where('chapter_number', '<', $chapter->chapter_number)
            ->orderBy('chapter_number', 'desc')
            ->first();

        $nextChapter = Chapter::where('manga_id', $manga->id)
            ->where('chapter_number', '>', $chapter->chapter_number)
            ->orderBy('chapter_number', 'asc')
            ->first();

        // Get all chapters for select dropdown
        $allChapters = Chapter::where('manga_id', $manga->id)
            ->orderBy('chapter_number', 'asc')
            ->select('id', 'title', 'chapter_number', 'slug')
            ->get();

        // Increment view count
        $chapter->increment('views');

        return Inertia::render('Chapter/Show', [
            'manga' => $manga,
            'chapter' => $chapter,
            'previousChapter' => $previousChapter,
            'nextChapter' => $nextChapter,
            'allChapters' => $allChapters,
            'pages' => $chapter->pages()->orderBy('page_number')->get()
        ]);
    }

    public function store(Request $request, Manga $manga)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'chapter_number' => 'required|numeric|min:0',
            'volume_number' => 'nullable|integer|min:1',
            'published_at' => 'nullable|date'
        ]);

        // Check if chapter number already exists for this manga
        $existingChapter = Chapter::where('manga_id', $manga->id)
            ->where('chapter_number', $validatedData['chapter_number'])
            ->first();

        if ($existingChapter) {
            return back()->withErrors([
                'chapter_number' => 'Số chương này đã tồn tại cho manga này.'
            ]);
        }

        // Check if slug already exists for this manga (if provided)
        if (!empty($validatedData['slug'])) {
            $existingSlug = Chapter::where('manga_id', $manga->id)
                ->where('slug', $validatedData['slug'])
                ->first();

            if ($existingSlug) {
                return back()->withErrors([
                    'slug' => 'Slug này đã tồn tại cho manga này.'
                ]);
            }
        }

        $validatedData['manga_id'] = $manga->id;
        $validatedData['published_at'] = $validatedData['published_at'] ?? now();

        $chapter = Chapter::create($validatedData);

        return redirect()->route('manga.chapters.show', [$manga, $chapter])
            ->with('success', 'Chương đã được tạo thành công!');
    }

    public function update(Request $request, Manga $manga, Chapter $chapter)
    {
        // Ensure chapter belongs to manga
        if ($chapter->manga_id !== $manga->id) {
            abort(404);
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'chapter_number' => 'required|numeric|min:0',
            'volume_number' => 'nullable|integer|min:1',
            'published_at' => 'nullable|date'
        ]);

        // Check if chapter number already exists for this manga (excluding current chapter)
        $existingChapter = Chapter::where('manga_id', $manga->id)
            ->where('chapter_number', $validatedData['chapter_number'])
            ->where('id', '!=', $chapter->id)
            ->first();

        if ($existingChapter) {
            return back()->withErrors([
                'chapter_number' => 'Số chương này đã tồn tại cho manga này.'
            ]);
        }

        // Check if slug already exists for this manga (if provided, excluding current chapter)
        if (!empty($validatedData['slug'])) {
            $existingSlug = Chapter::where('manga_id', $manga->id)
                ->where('slug', $validatedData['slug'])
                ->where('id', '!=', $chapter->id)
                ->first();

            if ($existingSlug) {
                return back()->withErrors([
                    'slug' => 'Slug này đã tồn tại cho manga này.'
                ]);
            }
        }

        $chapter->update($validatedData);

        return redirect()->route('manga.chapters.show', [$manga, $chapter])
            ->with('success', 'Chương đã được cập nhật thành công!');
    }

    public function destroy(Manga $manga, Chapter $chapter)
    {
        // Ensure chapter belongs to manga
        if ($chapter->manga_id !== $manga->id) {
            abort(404);
        }

        $chapter->delete();

        return redirect()->route('manga.chapters.index', $manga)
            ->with('success', 'Chương đã được xóa thành công!');
    }
}
