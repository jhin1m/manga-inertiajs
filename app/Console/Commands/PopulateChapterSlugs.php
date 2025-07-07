<?php

namespace App\Console\Commands;

use App\Models\Chapter;
use Illuminate\Console\Command;

class PopulateChapterSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chapters:populate-slugs {--force : Force update existing slugs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate slug field for existing chapters';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');
        
        $query = Chapter::query();
        
        if (!$force) {
            $query->whereNull('slug');
        }
        
        $chapters = $query->get();
        
        if ($chapters->isEmpty()) {
            $this->info('No chapters need slug population.');
            return;
        }
        
        $this->info("Found {$chapters->count()} chapters to update.");
        
        $bar = $this->output->createProgressBar($chapters->count());
        $bar->start();
        
        foreach ($chapters as $chapter) {
            $slug = Chapter::generateSlug(floatval($chapter->chapter_number), $chapter->manga_id);
            
            // Update without triggering model events to avoid infinite loop
            Chapter::withoutEvents(function () use ($chapter, $slug) {
                $chapter->update(['slug' => $slug]);
            });
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info('Chapter slugs populated successfully!');
    }
}
