<?php

namespace App\Http\Controllers;

use App\Models\TaxonomyTerm;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index()
    {
        $translations = [
            // History translations
            'reading_history' => __('history.reading_history'),
            'history_page_title' => __('history.history_page_title'),
            'history_page_description' => __('history.history_page_description'),
            'search_history' => __('history.search_history'),
            'filter_by_progress' => __('history.filter_by_progress'),
            'all_progress' => __('history.all_progress'),
            'completed' => __('history.completed'),
            'in_progress' => __('history.in_progress'),
            'not_started' => __('history.not_started'),
            'sort_recent' => __('history.sort_recent'),
            'sort_oldest' => __('history.sort_oldest'),
            'sort_title' => __('history.sort_title'),
            'sort_manga' => __('history.sort_manga'),
            'sort_progress' => __('history.sort_progress'),
            'chapter_list' => __('history.chapter_list'),
            'by_manga' => __('history.by_manga'),
            'no_history' => __('history.no_history'),
            'no_history_description' => __('history.no_history_description'),
            'loading' => __('history.loading'),
            'reading_stats' => __('history.reading_stats'),
            'manga_read' => __('history.manga_read'),
            'total_chapters' => __('history.total_chapters'),
            'chapters_read' => __('history.chapters_read'),
            'last_read' => __('history.last_read'),
            'view_all_chapters' => __('history.view_all_chapters'),
            'more' => __('history.more'),
            'clear_all' => __('history.clear_all'),
            'confirm_clear_history' => __('history.confirm_clear_history'),
            'confirm_remove_item' => __('history.confirm_remove_item'),
            'chapter' => __('history.chapter'),
        ];

        $seo = [
            'title' => $translations['history_page_title'],
            'description' => $translations['history_page_description'],
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

        return Inertia::render('History/Index', [
            'translations' => $translations,
            'seo' => $seo,
            'genres' => $genres,
        ]);
    }
}