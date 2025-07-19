<?php

namespace App\Models;

use App\Services\ImageEncryptionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'page_number',
        'image_url',
        'image_url_2',
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

    public function getAvailableImageUrls(): array
    {
        $urls = [];

        if ($this->image_url) {
            $urls[] = $this->image_url;
        }

        if ($this->image_url_2) {
            $urls[] = $this->image_url_2;
        }

        return $urls;
    }

    public function getPrimaryImageUrl(): ?string
    {
        return $this->image_url ?: $this->image_url_2;
    }

    /**
     * Get encrypted image URLs for frontend consumption
     */
    public function getEncryptedImageUrls(): array
    {
        $encryptionService = app(ImageEncryptionService::class);
        $urls = [];

        if ($this->image_url) {
            $urls[] = $encryptionService->encrypt($this->image_url);
        }

        if ($this->image_url_2) {
            $urls[] = $encryptionService->encrypt($this->image_url_2);
        }

        return $urls;
    }

    /**
     * Get primary encrypted image URL for frontend
     */
    public function getEncryptedPrimaryImageUrl(): ?string
    {
        $encryptionService = app(ImageEncryptionService::class);
        $primaryUrl = $this->getPrimaryImageUrl();
        
        return $primaryUrl ? $encryptionService->encrypt($primaryUrl) : null;
    }

    /**
     * Get encrypted image_url attribute
     */
    public function getEncryptedImageUrlAttribute(): ?string
    {
        if (!$this->image_url) {
            return null;
        }
        
        $encryptionService = app(ImageEncryptionService::class);
        return $encryptionService->encrypt($this->image_url);
    }

    /**
     * Get encrypted image_url_2 attribute
     */
    public function getEncryptedImageUrl2Attribute(): ?string
    {
        if (!$this->image_url_2) {
            return null;
        }
        
        $encryptionService = app(ImageEncryptionService::class);
        return $encryptionService->encrypt($this->image_url_2);
    }
}
