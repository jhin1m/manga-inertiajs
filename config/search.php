<?php

return [
    'pagination' => [
        'per_page' => env('SEARCH_PER_PAGE', 20),
        'suggestions_limit' => env('SEARCH_SUGGESTIONS_LIMIT', 10),
        'popular_limit' => env('SEARCH_POPULAR_LIMIT', 10),
    ],
    
    'rating_filters' => [
        'excellent' => [
            'min' => env('SEARCH_RATING_EXCELLENT_MIN', 9.0),
            'max' => env('SEARCH_RATING_EXCELLENT_MAX', 10.0),
        ],
        'very_good' => [
            'min' => env('SEARCH_RATING_VERY_GOOD_MIN', 8.0),
            'max' => env('SEARCH_RATING_VERY_GOOD_MAX', 8.9),
        ],
        'good' => [
            'min' => env('SEARCH_RATING_GOOD_MIN', 7.0),
            'max' => env('SEARCH_RATING_GOOD_MAX', 7.9),
        ],
        'average' => [
            'min' => env('SEARCH_RATING_AVERAGE_MIN', 6.0),
            'max' => env('SEARCH_RATING_AVERAGE_MAX', 6.9),
        ],
        'below_average' => [
            'min' => env('SEARCH_RATING_BELOW_AVERAGE_MIN', 5.0),
            'max' => env('SEARCH_RATING_BELOW_AVERAGE_MAX', 5.9),
        ],
        'poor' => [
            'min' => env('SEARCH_RATING_POOR_MIN', 0.0),
            'max' => env('SEARCH_RATING_POOR_MAX', 4.9),
        ],
    ],
];