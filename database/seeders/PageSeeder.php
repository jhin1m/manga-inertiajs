<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Chapter;
use App\Models\Page;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chapters = Chapter::all();
        $totalChapters = $chapters->count();
        $processedChapters = 0;

        foreach ($chapters as $chapter) {
            $pageCount = rand(15, 25); // Manga chapters typically have 15-25 pages
            
            for ($i = 1; $i <= $pageCount; $i++) {
                Page::create([
                    'chapter_id' => $chapter->id,
                    'image_url' => $this->generatePageImageUrl($chapter->manga->name, $chapter->chapter_number, $i),
                    'page_number' => $i
                ]);
            }

            $processedChapters++;
            
            // Show progress every 10 chapters
            if ($processedChapters % 10 === 0) {
                $this->command->info("Processed {$processedChapters}/{$totalChapters} chapters...");
            }
        }

        $this->command->info("Created pages for all {$totalChapters} chapters.");
    }

    private function generatePageImageUrl(string $mangaName, float $chapterNumber, int $pageNumber): string
    {
        // Generate placeholder image URLs
        // In a real application, these would be actual manga page images
        $mangaSlug = \Str::slug($mangaName);
        
        // Using placeholder service for demo
        $width = rand(800, 1200);
        $height = rand(1100, 1600);
        
        // You can use different placeholder services:
        // return "https://picsum.photos/{$width}/{$height}?random=" . rand(1, 1000);
        // return "https://via.placeholder.com/{$width}x{$height}/ffffff/000000?text=Page+{$pageNumber}";
        
        // For development, use local placeholder paths
        return "/images/manga/{$mangaSlug}/chapter-{$chapterNumber}/page-{$pageNumber}.jpg";
    }
}
