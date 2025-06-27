<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'page_number',
        'image_url',
    ];

    protected $casts = [
        'page_number' => 'integer',
    ];

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function scopeByPageNumber(Builder $query, int $pageNumber): Builder
    {
        return $query->where('page_number', $pageNumber);
    }

    public function getNextPageAttribute()
    {
        return $this->chapter->pages()
                    ->where('page_number', '>', $this->page_number)
                    ->orderBy('page_number')
                    ->first();
    }

    public function getPreviousPageAttribute()
    {
        return $this->chapter->pages()
                    ->where('page_number', '<', $this->page_number)
                    ->orderBy('page_number', 'desc')
                    ->first();
    }
}
