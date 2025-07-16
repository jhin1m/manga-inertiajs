<?php

namespace App\Contracts;

use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface TaxonomyRepositoryInterface
{
    public function getAllTaxonomies(): Collection;

    public function getTaxonomyByType(string $type): ?Taxonomy;

    public function getTaxonomyBySlug(string $slug): ?Taxonomy;

    public function getTaxonomyWithTerms(Taxonomy $taxonomy, ?int $perPage = null): LengthAwarePaginator;

    public function getTermsByTaxonomy(Taxonomy $taxonomy): Collection;

    public function getTermsByType(string $type): Collection;

    public function getTermBySlugAndType(string $slug, string $type): ?TaxonomyTerm;

    public function getTermBySlugAndTaxonomyId(string $slug, int $taxonomyId): ?TaxonomyTerm;

    public function getTermWithMangas(TaxonomyTerm $term, ?int $perPage = null): LengthAwarePaginator;

    public function getMangaByTerm(TaxonomyTerm $term, ?int $perPage = null): LengthAwarePaginator;

    public function getPopularTermsByType(string $type, ?int $limit = null): Collection;

    public function getTermsWithMangaCount(string $type): Collection;

    public function createTaxonomy(array $data): Taxonomy;

    public function updateTaxonomy(Taxonomy $taxonomy, array $data): Taxonomy;

    public function deleteTaxonomy(Taxonomy $taxonomy): bool;

    public function createTaxonomyTerm(Taxonomy $taxonomy, array $data): TaxonomyTerm;

    public function updateTaxonomyTerm(TaxonomyTerm $term, array $data): TaxonomyTerm;

    public function deleteTaxonomyTerm(TaxonomyTerm $term): bool;

    public function attachMangaToTerm(TaxonomyTerm $term, int $mangaId): bool;

    public function detachMangaFromTerm(TaxonomyTerm $term, int $mangaId): bool;

    public function validateTermExists(int $taxonomyId, string $slug, ?int $excludeId = null): bool;
}