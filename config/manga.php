<?php

return [
    'pagination' => [
        'per_page' => env('MANGA_PER_PAGE', 24),
        'chapters_per_page' => env('MANGA_CHAPTERS_PER_PAGE', 150),
    ],
    
    'thresholds' => [
        'hot_manga_views' => env('MANGA_HOT_VIEWS', 1000),
        'recommended_rating' => env('MANGA_RECOMMENDED_RATING', 4.0),
        'hot_manga_view_weight' => env('MANGA_HOT_VIEW_WEIGHT', 0.7),
        'hot_manga_rating_weight' => env('MANGA_HOT_RATING_WEIGHT', 0.3),
    ],
    
    'limits' => [
        'recent_chapters' => env('MANGA_RECENT_CHAPTERS', 3),
        'latest_chapter' => env('MANGA_LATEST_CHAPTER', 1),
        'popular_display' => env('MANGA_POPULAR_DISPLAY', 10),
        'top_genres' => env('MANGA_TOP_GENRES', 20),
    ],
    
    'validation' => [
        'name_max_length' => env('MANGA_NAME_MAX_LENGTH', 255),
        'cover_max_length' => env('MANGA_COVER_MAX_LENGTH', 500),
        'rating_min' => env('MANGA_RATING_MIN', 0),
        'rating_max' => env('MANGA_RATING_MAX', 10),
        'chapter_title_max' => env('MANGA_CHAPTER_TITLE_MAX', 255),
        'page_url_max' => env('MANGA_PAGE_URL_MAX', 500),
    ],
    
    'seo' => [
        'description_max_length' => env('MANGA_SEO_DESC_MAX', 160),
        'rating_scale_min' => env('MANGA_RATING_SCALE_MIN', 1),
        'rating_scale_max' => env('MANGA_RATING_SCALE_MAX', 5),
    ],
    
    'sitemap' => [
        'chunk_size' => env('MANGA_SITEMAP_CHUNK_SIZE', 1000),
    ],
];