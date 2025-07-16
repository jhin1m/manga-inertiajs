<?php

namespace App\Http\Controllers;

use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use App\Services\TaxonomyService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxonomyController extends Controller
{
    public function __construct(
        private TaxonomyService $taxonomyService
    ) {}

    public function index()
    {
        $taxonomies = $this->taxonomyService->getAllTaxonomies();

        return Inertia::render('Taxonomy/Index', [
            'taxonomies' => $taxonomies,
        ]);
    }

    public function show(Taxonomy $taxonomy)
    {
        $terms = $this->taxonomyService->getTaxonomyWithTerms($taxonomy);

        return Inertia::render('Taxonomy/Show', [
            'taxonomy' => $taxonomy,
            'terms' => $terms,
        ]);
    }

    public function terms(TaxonomyTerm $term)
    {
        $manga = $this->taxonomyService->getMangaByTerm($term);

        return Inertia::render('Taxonomy/Terms', [
            'term' => $term,
            'manga' => $manga,
        ]);
    }

    public function termsByType(TaxonomyTerm $term, Request $request)
    {
        // Get the type from the route name
        $routeName = $request->route()->getName();
        $type = $this->taxonomyService->getTypeFromRouteName($routeName);

        // Note: No need to validate term type here since our custom route model binding
        // in AppServiceProvider already ensures the term matches the taxonomy type

        $manga = $this->taxonomyService->getMangaByTerm($term);

        return Inertia::render('Taxonomy/TermsByType', [
            'term' => $term,
            'manga' => $manga,
            'type' => $type,
            'translations' => [
                'title' => __('manga.taxonomy.'.$type.'_title', ['name' => $term->name]),
                'description' => __('manga.taxonomy.'.$type.'_description', ['name' => $term->name]),
                'found_count' => __('manga.index.found_count'),
                'no_manga_found' => __('manga.index.no_manga_found'),
                'no_manga_message' => __('manga.index.no_manga_message'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:genre,author,tag,status,year,artist',
            'description' => 'nullable|string',
        ]);

        $validatedData['slug'] = \Str::slug($validatedData['name']);

        $taxonomy = Taxonomy::create($validatedData);

        return redirect()->route('taxonomies.show', $taxonomy)
            ->with('success', 'Taxonomy đã được tạo thành công!');
    }

    public function update(Request $request, Taxonomy $taxonomy)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:genre,author,tag,status,year,artist',
            'description' => 'nullable|string',
        ]);

        $validatedData['slug'] = \Str::slug($validatedData['name']);

        $taxonomy->update($validatedData);

        return redirect()->route('taxonomies.show', $taxonomy)
            ->with('success', 'Taxonomy đã được cập nhật thành công!');
    }

    public function destroy(Taxonomy $taxonomy)
    {
        // Check if taxonomy has terms
        if ($taxonomy->terms()->count() > 0) {
            return back()->withErrors([
                'taxonomy' => 'Không thể xóa taxonomy có chứa terms. Vui lòng xóa tất cả terms trước.',
            ]);
        }

        $taxonomy->delete();

        return redirect()->route('taxonomies.index')
            ->with('success', 'Taxonomy đã được xóa thành công!');
    }

    // Taxonomy Terms Management
    public function storeTerm(Request $request, Taxonomy $taxonomy)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validatedData['taxonomy_id'] = $taxonomy->id;
        $validatedData['slug'] = \Str::slug($validatedData['name']);

        // Check if term already exists for this taxonomy
        $existingTerm = TaxonomyTerm::where('taxonomy_id', $taxonomy->id)
            ->where('slug', $validatedData['slug'])
            ->first();

        if ($existingTerm) {
            return back()->withErrors([
                'name' => 'Term với tên này đã tồn tại trong taxonomy này.',
            ]);
        }

        $term = TaxonomyTerm::create($validatedData);

        return redirect()->route('taxonomies.show', $taxonomy)
            ->with('success', 'Term đã được tạo thành công!');
    }

    public function updateTerm(Request $request, Taxonomy $taxonomy, TaxonomyTerm $term)
    {
        // Ensure term belongs to taxonomy
        if ($term->taxonomy_id !== $taxonomy->id) {
            abort(404);
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validatedData['slug'] = \Str::slug($validatedData['name']);

        // Check if term already exists for this taxonomy (excluding current term)
        $existingTerm = TaxonomyTerm::where('taxonomy_id', $taxonomy->id)
            ->where('slug', $validatedData['slug'])
            ->where('id', '!=', $term->id)
            ->first();

        if ($existingTerm) {
            return back()->withErrors([
                'name' => 'Term với tên này đã tồn tại trong taxonomy này.',
            ]);
        }

        $term->update($validatedData);

        return redirect()->route('taxonomies.show', $taxonomy)
            ->with('success', 'Term đã được cập nhật thành công!');
    }

    public function destroyTerm(Taxonomy $taxonomy, TaxonomyTerm $term)
    {
        // Ensure term belongs to taxonomy
        if ($term->taxonomy_id !== $taxonomy->id) {
            abort(404);
        }

        // Check if term is used by any manga
        if ($term->mangas()->count() > 0) {
            return back()->withErrors([
                'term' => 'Không thể xóa term đang được sử dụng bởi manga. Vui lòng gỡ liên kết trước.',
            ]);
        }

        $term->delete();

        return redirect()->route('taxonomies.show', $taxonomy)
            ->with('success', 'Term đã được xóa thành công!');
    }

    // API-like methods for AJAX calls (still using Inertia pattern)
    public function getTermsByType(Request $request)
    {
        $type = $request->get('type');

        try {
            $terms = $this->taxonomyService->getTermsByType($type);
            return response()->json($terms);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
