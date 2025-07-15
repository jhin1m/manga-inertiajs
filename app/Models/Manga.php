<?php

namespace App\Models;

use App\Services\SeoService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Manga extends Model
{
    use HasFactory;

    const STATUS_KEYS = ['ongoing', 'completed', 'hiatus', 'cancelled'];

    public static function getStatuses(): array
    {
        $statuses = [];
        foreach (self::STATUS_KEYS as $key) {
            $statuses[$key] = __('manga.statuses.'.$key);
        }

        return $statuses;
    }

    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => __('manga.statuses.'.$this->status, [], app()->getLocale()),
        );
    }

    protected $fillable = [
        'name',
        'alternative_names',
        'description',
        'status',
        'views',
        'cover',
        'slug',
        'rating',
        'total_rating',
    ];

    /**
     * Default pagination size for manga
     */
    protected $perPage;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->perPage = config('manga.pagination.per_page', 24);
    }

    protected $casts = [
        'alternative_names' => 'array',
        'views' => 'integer',
        'rating' => 'decimal:2',
        'total_rating' => 'integer',
    ];

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class);
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

    public function scopeTopRated(Builder $query): Builder
    {
        return $query->orderBy('rating', 'desc')
            ->orderBy('total_rating', 'desc');
    }

    public function scopeRecent(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function incrementViews(): void
    {
        // Use raw SQL to avoid updating updated_at timestamp
        \DB::table('mangas')
            ->where('id', $this->id)
            ->increment('views');
    }

    public function updateRating(float $newRating): void
    {
        $currentTotal = $this->total_rating;
        $currentRating = $this->rating;

        $newTotal = $currentTotal + 1;
        $newAverageRating = (($currentRating * $currentTotal) + $newRating) / $newTotal;

        $this->update([
            'rating' => round($newAverageRating, 2),
            'total_rating' => $newTotal,
        ]);
    }

    public function getAverageRatingAttribute(): float
    {
        return $this->rating;
    }

    public function getTotalRatingsAttribute(): int
    {
        return $this->total_rating;
    }

    public function getLatestChapterAttribute()
    {
        return $this->chapters()->latest('chapter_number')->first();
    }

    public function getTotalChaptersAttribute(): int
    {
        return $this->chapters()->count();
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get SEO data for this manga
     */
    public function getSeoData(): array
    {
        $seoService = app(SeoService::class);

        return $seoService->forManga($this);
    }

    /**
     * Get cover image URL
     */
    public function getCoverImageAttribute(): ?string
    {
        return $this->cover ? url('/storage/'.$this->cover) : null;
    }

    /**
     * Get rating count for SEO
     */
    public function getRatingCountAttribute(): int
    {
        return $this->total_rating;
    }
}
