<?php

namespace App\Http\Controllers;

use App\Models\TaxonomyTerm;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    public function index()
    {
        $translations = [
            // Bookmark translations
            'bookmarks' => __('bookmark.bookmarks'),
            'bookmarks_page_title' => __('bookmark.bookmarks_page_title'),
            'bookmarks_page_description' => __('bookmark.bookmarks_page_description'),
            'bookmark' => __('bookmark.bookmark'),
            'bookmarked' => __('bookmark.bookmarked'),
            'bookmark_chapter' => __('bookmark.bookmark_chapter'),
            'bookmarked_chapter' => __('bookmark.bookmarked_chapter'),
            'add_manga_bookmark' => __('bookmark.add_manga_bookmark'),
            'remove_manga_bookmark' => __('bookmark.remove_manga_bookmark'),
            'add_chapter_bookmark' => __('bookmark.add_chapter_bookmark'),
            'remove_chapter_bookmark' => __('bookmark.remove_chapter_bookmark'),
            'all' => __('bookmark.all'),
            'manga' => __('bookmark.manga'),
            'chapters' => __('bookmark.chapters'),
            'search_bookmarks' => __('bookmark.search_bookmarks'),
            'sort_newest' => __('bookmark.sort_newest'),
            'sort_oldest' => __('bookmark.sort_oldest'),
            'sort_name' => __('bookmark.sort_name'),
            'sort_name_desc' => __('bookmark.sort_name_desc'),
            'no_bookmarks' => __('bookmark.no_bookmarks'),
            'no_bookmarks_description' => __('bookmark.no_bookmarks_description'),
            'loading' => __('bookmark.loading'),
            'clear_all' => __('bookmark.clear_all'),
            'confirm_clear_bookmarks' => __('bookmark.confirm_clear_bookmarks'),
            'chapter' => __('bookmark.chapter'),
        ];

        $seo = [
            'title' => $translations['bookmarks_page_title'],
            'description' => $translations['bookmarks_page_description'],
            'robots' => 'noindex, nofollow'
        ];

        // Cache genres for header navigation
        $genres = Cache::remember('search_genres', config('cache.ttl.search_genres'), function () {
            return TaxonomyTerm::whereHas('taxonomy', function ($q) {
                $q->where('type', 'genre');
            })
                ->withCount('mangas')
                ->having('mangas_count', '>', 0) // Only genres with manga
                ->orderBy('mangas_count', 'desc')
                ->get(['id', 'name', 'slug']);
        });

        return Inertia::render('Bookmarks/Index', [
            'translations' => $translations,
            'seo' => $seo,
            'genres' => $genres,
        ]);
    }
}