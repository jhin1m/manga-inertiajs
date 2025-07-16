<?php

namespace App\Services;

use App\Contracts\TaxonomyRepositoryInterface;
use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TaxonomyService
{
    public function __construct(
        private TaxonomyRepositoryInterface $taxonomyRepository
    ) {}

    public function getAllTaxonomies(): Collection
    {
        return $this->taxonomyRepository->getAllTaxonomies();
    }

    public function getTaxonomyWithTerms(Taxonomy $taxonomy, ?int $perPage = null): LengthAwarePaginator
    {
        return $this->taxonomyRepository->getTaxonomyWithTerms($taxonomy, $perPage);
    }

    public function getTermsByType(string $type): Collection
    {
        $validTypes = ['genre', 'author', 'artist', 'tag', 'status', 'year'];
        
        if (!in_array($type, $validTypes)) {
            throw new \InvalidArgumentException("Invalid taxonomy type: {$type}");
        }

        return $this->taxonomyRepository->getTermsByType($type);
    }

    public function getTermBySlugAndType(string $slug, string $type): ?TaxonomyTerm
    {
        $validTypes = ['genre', 'author', 'artist', 'tag', 'status', 'year'];
        
        if (!in_array($type, $validTypes)) {
            throw new \InvalidArgumentException("Invalid taxonomy type: {$type}");
        }

        return $this->taxonomyRepository->getTermBySlugAndType($slug, $type);
    }

    public function getMangaByTerm(TaxonomyTerm $term, ?int $perPage = null): LengthAwarePaginator
    {
        $manga = $this->taxonomyRepository->getMangaByTerm($term, $perPage);

        // Transform chapters to recent_chapters format for MangaCard compatibility
        $manga->getCollection()->transform(function ($manga) {
            $manga->recent_chapters = $manga->chapters->map(function ($chapter) {
                return [
                    'chapter_number' => $chapter->chapter_number,
                    'title' => $chapter->title,
                    'slug' => $chapter->slug,
                    'updated_at' => $chapter->updated_at,
                    'created_at' => $chapter->created_at,
                ];
            });

            return $manga;
        });

        return $manga;
    }

    public function getPopularTermsByType(string $type, ?int $limit = null): Collection
    {
        $validTypes = ['genre', 'author', 'artist', 'tag', 'status', 'year'];
        
        if (!in_array($type, $validTypes)) {
            throw new \InvalidArgumentException("Invalid taxonomy type: {$type}");
        }

        return $this->taxonomyRepository->getPopularTermsByType($type, $limit);
    }

    public function getTermsWithMangaCount(string $type): Collection
    {
        $validTypes = ['genre', 'author', 'artist', 'tag', 'status', 'year'];
        
        if (!in_array($type, $validTypes)) {
            throw new \InvalidArgumentException("Invalid taxonomy type: {$type}");
        }

        return $this->taxonomyRepository->getTermsWithMangaCount($type);
    }

    public function createTaxonomy(array $data): array
    {
        try {
            $taxonomy = $this->taxonomyRepository->createTaxonomy($data);
            
            return [
                'success' => true,
                'message' => 'Taxonomy created successfully',
                'data' => $taxonomy,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create taxonomy: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }

    public function updateTaxonomy(Taxonomy $taxonomy, array $data): array
    {
        try {
            $updatedTaxonomy = $this->taxonomyRepository->updateTaxonomy($taxonomy, $data);
            
            return [
                'success' => true,
                'message' => 'Taxonomy updated successfully',
                'data' => $updatedTaxonomy,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update taxonomy: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }

    public function deleteTaxonomy(Taxonomy $taxonomy): array
    {
        try {
            $this->taxonomyRepository->deleteTaxonomy($taxonomy);
            
            return [
                'success' => true,
                'message' => 'Taxonomy deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete taxonomy: ' . $e->getMessage(),
            ];
        }
    }

    public function createTaxonomyTerm(Taxonomy $taxonomy, array $data): array
    {
        try {
            $term = $this->taxonomyRepository->createTaxonomyTerm($taxonomy, $data);
            
            return [
                'success' => true,
                'message' => 'Term created successfully',
                'data' => $term,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create term: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }

    public function updateTaxonomyTerm(TaxonomyTerm $term, array $data): array
    {
        try {
            $updatedTerm = $this->taxonomyRepository->updateTaxonomyTerm($term, $data);
            
            return [
                'success' => true,
                'message' => 'Term updated successfully',
                'data' => $updatedTerm,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update term: ' . $e->getMessage(),
                'data' => null,
            ];
        }
    }

    public function deleteTaxonomyTerm(TaxonomyTerm $term): array
    {
        try {
            $this->taxonomyRepository->deleteTaxonomyTerm($term);
            
            return [
                'success' => true,
                'message' => 'Term deleted successfully',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete term: ' . $e->getMessage(),
            ];
        }
    }

    public function attachMangaToTerm(TaxonomyTerm $term, int $mangaId): array
    {
        $result = $this->taxonomyRepository->attachMangaToTerm($term, $mangaId);
        
        return [
            'success' => $result,
            'message' => $result ? 'Manga attached to term successfully' : 'Failed to attach manga to term',
        ];
    }

    public function detachMangaFromTerm(TaxonomyTerm $term, int $mangaId): array
    {
        $result = $this->taxonomyRepository->detachMangaFromTerm($term, $mangaId);
        
        return [
            'success' => $result,
            'message' => $result ? 'Manga detached from term successfully' : 'Failed to detach manga from term',
        ];
    }

    public function validateTermExists(int $taxonomyId, string $slug, ?int $excludeId = null): bool
    {
        return $this->taxonomyRepository->validateTermExists($taxonomyId, $slug, $excludeId);
    }

    /**
     * Get the type from route name
     */
    public function getTypeFromRouteName(string $routeName): string
    {
        return explode('.', $routeName)[0];
    }

    /**
     * Validate term belongs to the correct taxonomy type
     */
    public function validateTermType(TaxonomyTerm $term, string $expectedType): bool
    {
        return $term->taxonomy->type === $expectedType;
    }
}