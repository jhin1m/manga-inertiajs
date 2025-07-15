<?php

namespace App\Models;

use App\Services\SeoService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'manga_id',
        'title',
        'slug',
        'chapter_number',
        'volume_number',
        'published_at',
        'views',
    ];

    /**
     * Default pagination size for chapters
     */
    protected $perPage;

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->perPage = config('manga.pagination.chapters_per_page', 150);
    }

    protected $casts = [
        'chapter_number' => 'decimal:2',
        'volume_number' => 'integer',
        'published_at' => 'datetime',
        'views' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($chapter) {
            if (empty($chapter->slug)) {
                $chapter->slug = self::generateSlug($chapter->chapter_number, $chapter->manga_id);
            }
        });

        static::updating(function ($chapter) {
            if ($chapter->isDirty('chapter_number') && empty($chapter->slug)) {
                $chapter->slug = self::generateSlug($chapter->chapter_number, $chapter->manga_id);
            }
        });
    }

    public static function generateSlug($chapterNumber, $mangaId = null)
    {
        $baseSlug = 'chapter-'.$chapterNumber;

        if (! $mangaId) {
            return $baseSlug;
        }

        $slug = $baseSlug;
        $counter = 1;

        while (static::where('manga_id', $mangaId)->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function manga(): BelongsTo
    {
        return $this->belongsTo(Manga::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class)->orderBy('page_number');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeByVolume(Builder $query, int $volume): Builder
    {
        return $query->where('volume_number', $volume);
    }

    public function getNextChapterAttribute()
    {
        return $this->manga->chapters()
            ->where('chapter_number', '>', $this->chapter_number)
            ->orderBy('chapter_number')
            ->first();
    }

    public function getPreviousChapterAttribute()
    {
        return $this->manga->chapters()
            ->where('chapter_number', '<', $this->chapter_number)
            ->orderBy('chapter_number', 'desc')
            ->first();
    }

    /**
     * Get SEO data for this chapter
     */
    public function getSeoData(): array
    {
        $seoService = app(SeoService::class);

        return $seoService->forChapter($this);
    }

    /**
     * Increment view count
     */
    public function incrementViews(): void
    {
        // Use raw SQL to avoid updating updated_at timestamp
        \DB::table('chapters')
            ->where('id', $this->id)
            ->increment('views');
    }
}
