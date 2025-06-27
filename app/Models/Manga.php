<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

class Manga extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'alternative_names',
        'description',
        'status',
        'views',
        'cover',
        'slug',
    ];

    protected $casts = [
        'alternative_names' => 'array',
        'views' => 'integer',
    ];

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class)->orderBy('chapter_number');
    }

    public function taxonomyTerms(): BelongsToMany
    {
        return $this->belongsToMany(TaxonomyTerm::class, 'manga_taxonomy_terms');
    }

    public function genres(): BelongsToMany
    {
        return $this->taxonomyTerms()->whereHas('taxonomy', function ($query) {
            $query->where('slug', 'genre');
        });
    }

    public function tags(): BelongsToMany
    {
        return $this->taxonomyTerms()->whereHas('taxonomy', function ($query) {
            $query->where('slug', 'tag');
        });
    }

    public function authors(): BelongsToMany
    {
        return $this->taxonomyTerms()->whereHas('taxonomy', function ($query) {
            $query->where('slug', 'author');
        });
    }

    public function artists(): BelongsToMany
    {
        return $this->taxonomyTerms()->whereHas('taxonomy', function ($query) {
            $query->where('slug', 'artist');
        });
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePopular(Builder $query): Builder
    {
        return $query->orderBy('views', 'desc');
    }

    public function scopeRecent(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function incrementViews(): void
    {
        $this->increment('views');
    }

    public function getLatestChapterAttribute()
    {
        return $this->chapters()->latest('chapter_number')->first();
    }

    public function getTotalChaptersAttribute(): int
    {
        return $this->chapters()->count();
    }
}
