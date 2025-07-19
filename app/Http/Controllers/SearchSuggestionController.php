<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchSuggestionController extends Controller
{
    public function __construct(
        private SearchService $searchService
    ) {}

    public function suggestions(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'suggestions' => [],
                'popular' => $this->getPopularItems()
            ]);
        }

        $suggestions = $this->searchService->getSearchSuggestions($query, 8);
        
        return response()->json([
            'suggestions' => $suggestions,
            'popular' => []
        ]);
    }

    public function popular(): JsonResponse
    {
        return response()->json($this->getPopularItems());
    }

    private function getPopularItems(): array
    {
        return [
            'manga' => $this->searchService->getPopularManga(5)
        ];
    }
}