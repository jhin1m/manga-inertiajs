<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileUploadService
{
    private string $disk;
    private array $allowedMimeTypes;
    private int $maxFileSize;

    public function __construct()
    {
        $this->disk = config('filesystems.default', 'public');
        $this->allowedMimeTypes = [
            'image/jpeg',
            'image/png', 
            'image/jpg',
            'image/gif',
            'image/webp'
        ];
        $this->maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    public function uploadMangaCover(UploadedFile $file, string $mangaSlug): string
    {
        $this->validateFile($file);
        
        $filename = $this->generateFilename($file, 'cover');
        $path = "manga/{$mangaSlug}/covers/{$filename}";
        
        Storage::disk($this->disk)->putFileAs(
            "manga/{$mangaSlug}/covers",
            $file,
            $filename
        );
        
        return Storage::disk($this->disk)->url($path);
    }

    public function uploadChapterPages(array $files, string $mangaSlug, int $chapterId): array
    {
        $uploadedPages = [];
        
        foreach ($files as $index => $file) {
            $this->validateFile($file);
            
            $filename = $this->generateFilename($file, "page-" . ($index + 1));
            $path = "manga/{$mangaSlug}/chapters/{$chapterId}/pages/{$filename}";
            
            Storage::disk($this->disk)->putFileAs(
                "manga/{$mangaSlug}/chapters/{$chapterId}/pages",
                $file,
                $filename
            );
            
            $dimensions = $this->getImageDimensions($file);
            
            $uploadedPages[] = [
                'image_url' => Storage::disk($this->disk)->url($path),
                'page_number' => $index + 1,
                'width' => $dimensions['width'],
                'height' => $dimensions['height']
            ];
        }
        
        return $uploadedPages;
    }

    public function uploadSinglePage(UploadedFile $file, string $mangaSlug, int $chapterId, int $pageNumber): array
    {
        $this->validateFile($file);
        
        $filename = $this->generateFilename($file, "page-{$pageNumber}");
        $path = "manga/{$mangaSlug}/chapters/{$chapterId}/pages/{$filename}";
        
        Storage::disk($this->disk)->putFileAs(
            "manga/{$mangaSlug}/chapters/{$chapterId}/pages",
            $file,
            $filename
        );
        
        $dimensions = $this->getImageDimensions($file);
        
        return [
            'image_url' => Storage::disk($this->disk)->url($path),
            'width' => $dimensions['width'],
            'height' => $dimensions['height']
        ];
    }

    public function deleteFile(string $url): bool
    {
        // Extract path from URL
        $path = str_replace(Storage::disk($this->disk)->url(''), '', $url);
        
        if (Storage::disk($this->disk)->exists($path)) {
            return Storage::disk($this->disk)->delete($path);
        }
        
        return false;
    }

    public function deleteMangaFolder(string $mangaSlug): bool
    {
        $path = "manga/{$mangaSlug}";
        
        if (Storage::disk($this->disk)->exists($path)) {
            return Storage::disk($this->disk)->deleteDirectory($path);
        }
        
        return false;
    }

    public function deleteChapterFolder(string $mangaSlug, int $chapterId): bool
    {
        $path = "manga/{$mangaSlug}/chapters/{$chapterId}";
        
        if (Storage::disk($this->disk)->exists($path)) {
            return Storage::disk($this->disk)->deleteDirectory($path);
        }
        
        return false;
    }

    public function validateFile(UploadedFile $file): void
    {
        // Check file size
        if ($file->getSize() > $this->maxFileSize) {
            throw new \InvalidArgumentException('File quá lớn. Kích thước tối đa là 10MB.');
        }
        
        // Check mime type
        if (!in_array($file->getMimeType(), $this->allowedMimeTypes)) {
            throw new \InvalidArgumentException('Định dạng file không được hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP.');
        }
        
        // Check if file is actually an image
        if (!getimagesize($file->getPathname())) {
            throw new \InvalidArgumentException('File tải lên không phải là hình ảnh hợp lệ.');
        }
    }

    public function getImageDimensions(UploadedFile $file): array
    {
        $imageInfo = getimagesize($file->getPathname());
        
        return [
            'width' => $imageInfo[0] ?? null,
            'height' => $imageInfo[1] ?? null,
            'mime' => $imageInfo['mime'] ?? null
        ];
    }

    private function generateFilename(UploadedFile $file, string $prefix = ''): string
    {
        $extension = $file->getClientOriginalExtension();
        $timestamp = now()->format('YmdHis');
        $random = \Str::random(8);
        
        $filename = $prefix ? "{$prefix}_{$timestamp}_{$random}" : "{$timestamp}_{$random}";
        
        return "{$filename}.{$extension}";
    }

    public function getStorageInfo(): array
    {
        return [
            'disk' => $this->disk,
            'driver' => config("filesystems.disks.{$this->disk}.driver"),
            'allowed_types' => $this->allowedMimeTypes,
            'max_file_size' => $this->maxFileSize
        ];
    }
} 