<?php

namespace App\Http\Controllers;

use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxonomyController extends Controller
{
    public function index()
    {
        $taxonomies = Taxonomy::withCount('terms')
            ->get();

        return Inertia::render('Taxonomy/Index', [
            'taxonomies' => $taxonomies
        ]);
    }

    public function show(Taxonomy $taxonomy)
    {
        $terms = $taxonomy->terms()
            ->withCount('mangas')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('Taxonomy/Show', [
            'taxonomy' => $taxonomy,
            'terms' => $terms
        ]);
    }

    public function terms(TaxonomyTerm $term)
    {
        $term->load('taxonomy');
        
        $manga = $term->mangas()
            ->with(['taxonomyTerms', 'chapters'])
            ->withCount('chapters')
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        return Inertia::render('Taxonomy/Terms', [
            'term' => $term,
            'manga' => $manga
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:genre,author,tag,status',
            'description' => 'nullable|string'
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
            'type' => 'required|in:genre,author,tag,status',
            'description' => 'nullable|string'
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
                'taxonomy' => 'Không thể xóa taxonomy có chứa terms. Vui lòng xóa tất cả terms trước.'
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
            'description' => 'nullable|string'
        ]);

        $validatedData['taxonomy_id'] = $taxonomy->id;
        $validatedData['slug'] = \Str::slug($validatedData['name']);

        // Check if term already exists for this taxonomy
        $existingTerm = TaxonomyTerm::where('taxonomy_id', $taxonomy->id)
            ->where('slug', $validatedData['slug'])
            ->first();

        if ($existingTerm) {
            return back()->withErrors([
                'name' => 'Term với tên này đã tồn tại trong taxonomy này.'
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
            'description' => 'nullable|string'
        ]);

        $validatedData['slug'] = \Str::slug($validatedData['name']);

        // Check if term already exists for this taxonomy (excluding current term)
        $existingTerm = TaxonomyTerm::where('taxonomy_id', $taxonomy->id)
            ->where('slug', $validatedData['slug'])
            ->where('id', '!=', $term->id)
            ->first();

        if ($existingTerm) {
            return back()->withErrors([
                'name' => 'Term với tên này đã tồn tại trong taxonomy này.'
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
                'term' => 'Không thể xóa term đang được sử dụng bởi manga. Vui lòng gỡ liên kết trước.'
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
        
        if (!in_array($type, ['genre', 'author', 'tag', 'status'])) {
            return response()->json(['error' => 'Invalid type'], 400);
        }

        $terms = TaxonomyTerm::whereHas('taxonomy', function ($query) use ($type) {
            $query->where('type', $type);
        })
        ->select('id', 'name', 'slug')
        ->orderBy('name')
        ->get();

        return response()->json($terms);
    }
}
