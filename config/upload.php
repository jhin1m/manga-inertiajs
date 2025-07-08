<?php

return [
    'limits' => [
        'max_file_size' => env('UPLOAD_MAX_FILE_SIZE', 10485760), // 10MB in bytes
        'image_max_size' => env('UPLOAD_IMAGE_MAX_SIZE', 10240), // 10MB in KB
    ],
    
    'validation' => [
        'manga_name_max' => env('VALIDATION_MANGA_NAME_MAX', 255),
        'manga_cover_max' => env('VALIDATION_MANGA_COVER_MAX', 500),
        'chapter_title_max' => env('VALIDATION_CHAPTER_TITLE_MAX', 255),
        'page_url_max' => env('VALIDATION_PAGE_URL_MAX', 500),
        'rating_min' => env('VALIDATION_RATING_MIN', 0),
        'rating_max' => env('VALIDATION_RATING_MAX', 10),
        'chapter_number_min' => env('VALIDATION_CHAPTER_NUMBER_MIN', 0),
        'volume_number_min' => env('VALIDATION_VOLUME_NUMBER_MIN', 1),
        'page_number_min' => env('VALIDATION_PAGE_NUMBER_MIN', 1),
    ],
    
    'file' => [
        'random_string_length' => env('UPLOAD_RANDOM_STRING_LENGTH', 8),
    ],
];