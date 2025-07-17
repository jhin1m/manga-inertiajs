<?php

namespace App\Repositories;

use App\Contracts\TaxonomyRepositoryInterface;
use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TaxonomyRepository implements TaxonomyRepositoryInterface
{
    public function getAllTaxonomies(): Collection
    {
        return Taxonomy::withCount('terms')
            ->orderBy('name')
            ->get();
    }

    public function getTaxonomyByType(string $type): ?Taxonomy
    {
        return Taxonomy::where('type', $type)->first();
    }

    public function getTaxonomyBySlug(string $slug): ?Taxonomy
    {
        return Taxonomy::where('slug', $slug)->first();
    }

    public function getTaxonomyWithTerms(Taxonomy $taxonomy, ?int $perPage = null): LengthAwarePaginator
    {
        $query = $taxonomy->terms()
            ->withCount('mangas')
            ->orderBy('name');

        return $query->paginate($perPage ?? config('manga.pagination.per_page', 20));
    }

    public function getTermsByTaxonomy(Taxonomy $taxonomy): Collection
    {
        return $taxonomy->terms()
            ->withCount('mangas')
            ->orderBy('name')
            ->get();
    }

    public function getTermsByType(string $type): Collection
    {
        return TaxonomyTerm::whereHas('taxonomy', function ($query) use ($type) {
            $query->where('type', $type);
        })
            ->select('id', 'name', 'slug', 'taxonomy_id')
            ->orderBy('name')
            ->get();
    }

    public function getTermBySlugAndType(string $slug, string $type): ?TaxonomyTerm
    {
        return TaxonomyTerm::whereHas('taxonomy', function ($query) use ($type) {
            $query->where('type', $type);
        })
            ->where('slug', $slug)
            ->with('taxonomy')
            ->first();
    }

    public function getTermBySlugAndTaxonomyId(string $slug, int $taxonomyId): ?TaxonomyTerm
    {
        return TaxonomyTerm::where('slug', $slug)
            ->where('taxonomy_id', $taxonomyId)
            ->with('taxonomy')
            ->first();
    }

    public function getTermWithMangas(TaxonomyTerm $term, ?int $perPage = null): LengthAwarePaginator
    {
        $query = $term->mangas()
            ->with([
                'taxonomyTerms.taxonomy',
                'chapters' => function ($query) {
                    $query->select('id', 'manga_id', 'chapter_number', 'title', 'slug', 'updated_at', 'created_at')
                        ->orderBy('chapter_number', 'desc')
                        ->limit(config('manga.limits.recent_chapters'));
                },
            ])
            ->withCount('chapters')
            ->withMax('chapters', 'updated_at')
            ->orderBy('chapters_max_updated_at', 'desc');

        return $query->paginate($perPage ?? config('manga.pagination.per_page', 20));
    }

    public function getMangaByTerm(TaxonomyTerm $term, ?int $perPage = null): LengthAwarePaginator
    {
        return $this->getTermWithMangas($term, $perPage);
    }

    public function getPopularTermsByType(string $type, ?int $limit = null): Collection
    {
        $query = TaxonomyTerm::whereHas('taxonomy', function ($query) use ($type) {
            $query->where('type', $type);
        })
            ->withCount('mangas')
            ->having('mangas_count', '>', 0)
            ->orderBy('mangas_count', 'desc')
            ->orderBy('name');

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    public function getTermsWithMangaCount(string $type): Collection
    {
        return TaxonomyTerm::whereHas('taxonomy', function ($query) use ($type) {
            $query->where('type', $type);
        })
            ->withCount('mangas')
            ->orderBy('name')
            ->get();
    }

    public function createTaxonomy(array $data): Taxonomy
    {
        if (!isset($data['slug'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        return Taxonomy::create($data);
    }

    public function updateTaxonomy(Taxonomy $taxonomy, array $data): Taxonomy
    {
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        $taxonomy->update($data);
        return $taxonomy->fresh();
    }

    public function deleteTaxonomy(Taxonomy $taxonomy): bool
    {
        // Check if taxonomy has terms
        if ($taxonomy->terms()->count() > 0) {
            throw new \Exception('Cannot delete taxonomy that has terms. Please delete all terms first.');
        }

        return $taxonomy->delete();
    }

    public function createTaxonomyTerm(Taxonomy $taxonomy, array $data): TaxonomyTerm
    {
        $data['taxonomy_id'] = $taxonomy->id;
        
        if (!isset($data['slug'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        // Check if term already exists for this taxonomy
        if ($this->validateTermExists($taxonomy->id, $data['slug'])) {
            throw new \Exception('Term with this name already exists in this taxonomy.');
        }

        return TaxonomyTerm::create($data);
    }

    public function updateTaxonomyTerm(TaxonomyTerm $term, array $data): TaxonomyTerm
    {
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        // Check if term already exists for this taxonomy (excluding current term)
        if (isset($data['slug']) && $this->validateTermExists($term->taxonomy_id, $data['slug'], $term->id)) {
            throw new \Exception('Term with this name already exists in this taxonomy.');
        }

        $term->update($data);
        return $term->fresh();
    }

    public function deleteTaxonomyTerm(TaxonomyTerm $term): bool
    {
        // Check if term is used by any manga
        if ($term->mangas()->count() > 0) {
            throw new \Exception('Cannot delete term that is being used by manga. Please remove all associations first.');
        }

        return $term->delete();
    }

    public function attachMangaToTerm(TaxonomyTerm $term, int $mangaId): bool
    {
        try {
            $term->mangas()->syncWithoutDetaching([$mangaId]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function detachMangaFromTerm(TaxonomyTerm $term, int $mangaId): bool
    {
        try {
            $term->mangas()->detach($mangaId);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function validateTermExists(int $taxonomyId, string $slug, ?int $excludeId = null): bool
    {
        $query = TaxonomyTerm::where('taxonomy_id', $taxonomyId)
            ->where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}