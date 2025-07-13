<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index(Chapter $chapter)
    {
        $pages = $chapter->pages()
            ->orderBy('page_number')
            ->get();

        return Inertia::render('Page/Index', [
            'chapter' => $chapter->load('manga'),
            'pages' => $pages,
        ]);
    }

    public function store(Request $request, Chapter $chapter)
    {
        $validatedData = $request->validate([
            'pages' => 'required|array',
            'pages.*.image_url' => 'required|string',
            'pages.*.page_number' => 'required|integer|min:1',
        ]);

        $createdPages = [];

        foreach ($validatedData['pages'] as $pageData) {
            // Check if page number already exists for this chapter
            $existingPage = Page::where('chapter_id', $chapter->id)
                ->where('page_number', $pageData['page_number'])
                ->first();

            if ($existingPage) {
                return back()->withErrors([
                    'pages' => "Trang số {$pageData['page_number']} đã tồn tại cho chương này.",
                ]);
            }

            $pageData['chapter_id'] = $chapter->id;
            $createdPages[] = Page::create($pageData);
        }

        return redirect()->route('chapters.pages.index', $chapter)
            ->with('success', 'Đã tạo thành công '.count($createdPages).' trang!');
    }

    public function update(Request $request, Chapter $chapter, Page $page)
    {
        // Ensure page belongs to chapter
        if ($page->chapter_id !== $chapter->id) {
            abort(404);
        }

        $validatedData = $request->validate([
            'image_url' => 'required|string',
            'page_number' => 'required|integer|min:1',
        ]);

        // Check if page number already exists for this chapter (excluding current page)
        $existingPage = Page::where('chapter_id', $chapter->id)
            ->where('page_number', $validatedData['page_number'])
            ->where('id', '!=', $page->id)
            ->first();

        if ($existingPage) {
            return back()->withErrors([
                'page_number' => 'Số trang này đã tồn tại cho chương này.',
            ]);
        }

        $page->update($validatedData);

        return redirect()->route('chapters.pages.index', $chapter)
            ->with('success', 'Trang đã được cập nhật thành công!');
    }

    public function destroy(Chapter $chapter, Page $page)
    {
        // Ensure page belongs to chapter
        if ($page->chapter_id !== $chapter->id) {
            abort(404);
        }

        $page->delete();

        return redirect()->route('chapters.pages.index', $chapter)
            ->with('success', 'Trang đã được xóa thành công!');
    }

    public function bulkUpload(Request $request, Chapter $chapter)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max per image
        ]);

        $uploadedPages = [];
        $pageNumber = $chapter->pages()->max('page_number') + 1 ?? 1;

        foreach ($request->file('images') as $image) {
            // Store image (this would need proper file handling service)
            $imagePath = $image->store('manga/chapters/'.$chapter->id, 'public');

            $page = Page::create([
                'chapter_id' => $chapter->id,
                'image_url' => '/storage/'.$imagePath,
                'page_number' => $pageNumber,
            ]);

            $uploadedPages[] = $page;
            $pageNumber++;
        }

        return redirect()->route('chapters.pages.index', $chapter)
            ->with('success', 'Đã upload thành công '.count($uploadedPages).' trang!');
    }
}
