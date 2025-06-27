<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'manga_id',
        'title',
        'chapter_number',
        'volume_number',
        'pages_count',
        'published_at',
    ];

    protected $casts = [
        'chapter_number' => 'decimal:2',
        'volume_number' => 'integer',
        'pages_count' => 'integer',
        'published_at' => 'datetime',
    ];

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

    public function updatePagesCount(): void
    {
        $this->update(['pages_count' => $this->pages()->count()]);
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
}
