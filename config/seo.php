<?php

return [
    'defaults' => [
        'title' => env('SEO_DEFAULT_TITLE', 'Manga Reader - Đọc Truyện Tranh Online Miễn Phí'),
        'description' => env('SEO_DEFAULT_DESCRIPTION', 'Website đọc truyện tranh manga online miễn phí với hàng ngàn bộ truyện hay, cập nhật liên tục. Đọc manga, manhwa, manhua chất lượng cao.'),
        'keywords' => env('SEO_DEFAULT_KEYWORDS', 'manga, truyện tranh, đọc online, manhwa, manhua, truyện tranh online, manga tiếng việt'),
        'image' => env('SEO_DEFAULT_IMAGE', '/images/default-og.jpg'),
        'site_name' => env('SEO_SITE_NAME', 'Manga Reader'),
        'locale' => env('SEO_LOCALE', 'vi_VN'),
        'type' => env('SEO_OG_TYPE', 'website'),
    ],

    'templates' => [
        'manga_index' => [
            'title' => env('SEO_MANGA_INDEX_TITLE', 'Danh Sách Manga - Đọc Truyện Tranh Online'),
            'description' => env('SEO_MANGA_INDEX_DESCRIPTION', 'Khám phá hàng ngàn bộ manga hay nhất. Tìm kiếm theo thể loại, xếp hạng và cập nhật mới nhất.'),
            'keywords' => env('SEO_MANGA_INDEX_KEYWORDS', 'danh sách manga, tìm kiếm manga, manga hay, manga mới'),
        ],
        
        'manga_show' => [
            'title' => env('SEO_MANGA_SHOW_TITLE', '{manga_name} - Đọc Truyện Tranh Online'),
            'description' => env('SEO_MANGA_SHOW_DESCRIPTION', '{manga_description}'),
            'keywords' => env('SEO_MANGA_SHOW_KEYWORDS', '{manga_name}, {manga_genres}, manga, truyện tranh'),
        ],
        
        'chapter_show' => [
            'title' => env('SEO_CHAPTER_SHOW_TITLE', '{manga_name} - Chương {chapter_number}: {chapter_title}'),
            'description' => env('SEO_CHAPTER_SHOW_DESCRIPTION', 'Đọc {manga_name} chương {chapter_number} - {chapter_title}. Cập nhật nhanh nhất, hình ảnh chất lượng cao.'),
            'keywords' => env('SEO_CHAPTER_SHOW_KEYWORDS', '{manga_name}, chương {chapter_number}, {manga_genres}, đọc online'),
        ],
        
        'search' => [
            'title' => env('SEO_SEARCH_TITLE', 'Tìm Kiếm Manga - {query}'),
            'description' => env('SEO_SEARCH_DESCRIPTION', 'Kết quả tìm kiếm cho "{query}". Tìm thấy {count} manga phù hợp.'),
            'keywords' => env('SEO_SEARCH_KEYWORDS', 'tìm kiếm manga, {query}, kết quả tìm kiếm'),
        ],
        
        'home' => [
            'title' => env('SEO_HOME_TITLE', 'Trang Chủ - Manga Reader'),
            'description' => env('SEO_HOME_DESCRIPTION', 'Đọc manga online miễn phí. Cập nhật manga mới nhất, manga hot, manga được đánh giá cao. Trải nghiệm đọc truyện tuyệt vời.'),
            'keywords' => env('SEO_HOME_KEYWORDS', 'manga mới, manga hot, trang chủ, đọc truyện online'),
        ],
    ],

    'schema' => [
        'organization' => [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => env('SEO_SITE_NAME', 'Manga Reader'),
            'url' => env('APP_URL'),
            'logo' => env('APP_URL') . env('SEO_SCHEMA_LOGO_PATH', '/images/logo.png'),
            'description' => env('SEO_DEFAULT_DESCRIPTION', 'Website đọc truyện tranh manga online miễn phí'),
            'sameAs' => array_filter(explode(',', env('SEO_SCHEMA_SOCIAL_MEDIA_LINKS', ''))),
        ],
        
        'website' => [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => env('SEO_SITE_NAME', 'Manga Reader'),
            'url' => env('APP_URL'),
            'description' => env('SEO_DEFAULT_DESCRIPTION', 'Website đọc truyện tranh manga online miễn phí'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => env('APP_URL') . '/search?q={search_term_string}',
                ],
                'query-input' => 'required name=search_term_string',
            ],
        ],
    ],

    'og' => [
        'type' => env('SEO_OG_TYPE', 'website'),
        'locale' => env('SEO_LOCALE', 'vi_VN'),
        'site_name' => env('SEO_SITE_NAME', 'Manga Reader'),
    ],

    'twitter' => [
        'card' => 'summary_large_image',
        'site' => env('SEO_TWITTER_HANDLE', '@mangareader'),
    ],

    'robots' => [
        'index' => env('SEO_ROBOTS_INDEX', true),
        'follow' => env('SEO_ROBOTS_FOLLOW', true),
        'max_image_preview' => env('SEO_ROBOTS_MAX_IMAGE_PREVIEW', 'large'),
        'max_snippet' => env('SEO_ROBOTS_MAX_SNIPPET', -1),
        'max_video_preview' => env('SEO_ROBOTS_MAX_VIDEO_PREVIEW', -1),
    ],

    'labels' => [
        'home' => env('SEO_LABEL_HOME', 'Trang chủ'),
        'manga' => env('SEO_LABEL_MANGA', 'Manga'),
        'chapter' => env('SEO_LABEL_CHAPTER', 'Chương'),
        'chapter_description_prefix' => env('SEO_CHAPTER_DESCRIPTION_PREFIX', 'Đọc'),
        'chapter_description_suffix' => env('SEO_CHAPTER_DESCRIPTION_SUFFIX', 'chương'),
    ],
];