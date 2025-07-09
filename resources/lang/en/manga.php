<?php

return [
    'statuses' => [
        'ongoing' => 'Ongoing',
        'completed' => 'Completed',
        'hiatus' => 'Hiatus',
        'cancelled' => 'Cancelled',
    ],
    'status_label' => 'Status',
    'author_label' => 'Author',
    'artist_label' => 'Artist',
    'genre_label' => 'Genre',
    'tag_label' => 'Tags',
    'description_label' => 'Description',
    'rating_label' => 'Rating',
    'views_label' => 'Views',
    'chapters_label' => 'Chapters',
    'no_rating' => 'No rating',
    'ratings_count' => 'ratings',
    'read_now' => 'Read now',
    'read_first' => 'Read from beginning',
    'read_last' => 'Read latest chapter',
    'favorite' => 'Favorite',
    'expand_more' => 'Show more',
    'collapse' => 'Collapse',
    
    // Index manga page
    'index' => [
        'title' => 'Manga list',
        'found_count' => 'Found :count manga',
        'no_manga_found' => 'No manga found',
        'no_manga_message' => 'Try changing the filters to find more manga',
        'empty_message' => 'No manga to display',
        'no_manga_title' => 'No manga yet',
        'no_chapters' => 'No chapters yet',
        'loading' => 'Loading...',
        'chapters_count' => ':count chapters',
        'views_count' => ':count views',
        'sort_by' => [
            'latest' => 'Latest',
            'popular' => 'Popular',
            'rating' => 'Top rated',
            'title' => 'Title A-Z',
        ],
        'filters' => [
            'title' => 'Filters',
            'reset' => 'Reset',
            'sort_by' => 'Sort by',
            'sort_placeholder' => 'Choose sorting method',
            'status' => 'Status',
            'all' => 'All',
            'year' => 'Release year',
            'year_placeholder' => 'Choose year',
            'applying' => 'applying',
            'clear_all' => 'Clear all',
            'close' => 'Close',
            'apply' => 'Apply',
            'latest' => 'Latest',
            'oldest' => 'Oldest',
            'views' => 'Most views',
            'rating' => 'Highest rating',
            'name_asc' => 'Name A-Z',
            'name_desc' => 'Name Z-A',
        ],
    ],
    
    // ChapterList component
    'chapter_list' => [
        'title' => 'Chapter list',
        'chapter_column' => 'Chapter',
        'title_column' => 'Title',
        'updated_column' => 'Updated',
        'read_column' => 'Read',
        'read_button' => 'Read',
        'chapter_prefix' => 'Chapter',
        'chapter_short' => 'Ch.',
        'previous' => 'Previous',
        'next' => 'Next',
    ],
    
    // Taxonomy pages
    'taxonomy' => [
        'genre_title' => 'Genre: :name',
        'genre_description' => 'Manga list for genre :name',
        'author_title' => 'Author: :name',
        'author_description' => 'Manga list by author :name',
        'artist_title' => 'Artist: :name',
        'artist_description' => 'Manga list by artist :name',
        'tag_title' => 'Tag: :name',
        'tag_description' => 'Manga list with tag :name',
    ],
    
    // Rankings Card
    'rankings' => [
        'title' => 'Manga Rankings',
        'no_data' => 'No ranking data available',
        'view_all' => 'View all rankings →',
        'views' => 'views',
    ],
    
    // Recommended Card
    'recommended' => [
        'title' => 'Recommended for you',
        'no_data' => 'No recommendations available',
        'view_all' => 'View more recommendations →',
        'rating_reason' => 'Rating :rating/5',
    ],
];
