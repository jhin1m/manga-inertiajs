<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TaxonomyTerm extends Model
{
    use HasFactory;

    protected $fillable = [
        'taxonomy_id',
        'name',
        'slug',
        'description',
    ];

    public function taxonomy(): BelongsTo
    {
        return $this->belongsTo(Taxonomy::class);
    }

    public function mangas(): BelongsToMany
    {
        return $this->belongsToMany(Manga::class, 'manga_taxonomy_terms');
    }

    // Alias for consistency with Manga model
    public function manga(): BelongsToMany
    {
        return $this->mangas();
    }
}
