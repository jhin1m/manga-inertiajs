<?php

return [
    'cache' => [
        'hot_manga_ttl' => env('HOMEPAGE_HOT_MANGA_TTL', 3600),
        'latest_updates_ttl' => env('HOMEPAGE_LATEST_UPDATES_TTL', 1800),
        'rankings_ttl' => env('HOMEPAGE_RANKINGS_TTL', 7200),
        'recommended_ttl' => env('HOMEPAGE_RECOMMENDED_TTL', 3600),
        'genres_ttl' => env('HOMEPAGE_GENRES_TTL', 86400),
    ],

    'limits' => [
        'hot_manga' => env('HOMEPAGE_HOT_MANGA_LIMIT', 10),
        'latest_updates' => env('HOMEPAGE_LATEST_UPDATES_LIMIT', 24),
        'rankings' => env('HOMEPAGE_RANKINGS_LIMIT', 10),
        'recommended' => env('HOMEPAGE_RECOMMENDED_LIMIT', 6),
    ],
];
