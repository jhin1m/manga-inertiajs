<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Manga;
use App\Models\Chapter;
use App\Models\TaxonomyTerm;

class AnalyzeQueryPerformance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:analyze-performance {--detailed : Show detailed analysis}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyze database query performance and suggest optimizations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Analyzing Database Query Performance...');
        $this->newLine();

        // Test common queries
        $this->testCommonQueries();
        
        if ($this->option('detailed')) {
            $this->showDetailedAnalysis();
        }
        
        $this->showIndexRecommendations();
        
        $this->info('✅ Analysis completed!');
    }

    private function testCommonQueries()
    {
        $this->info('📊 Testing Common Queries:');
        $this->newLine();

        $queries = [
            'Popular Manga' => function() {
                return Manga::popular()->limit(10)->get();
            },
            'Recent Manga' => function() {
                return Manga::recent()->limit(10)->get();
            },
            'Ongoing Manga' => function() {
                return Manga::byStatus('ongoing')->limit(10)->get();
            },
            'Manga with Genres' => function() {
                return Manga::with('genres')->limit(5)->get();
            },
            'Chapters by Manga' => function() {
                $manga = Manga::first();
                return $manga ? $manga->chapters()->limit(10)->get() : collect();
            },
            'Search Manga by Name' => function() {
                return Manga::where('name', 'like', '%manga%')->limit(10)->get();
            }
        ];

        foreach ($queries as $name => $query) {
            $start = microtime(true);
            
            try {
                $result = $query();
                $duration = round((microtime(true) - $start) * 1000, 2);
                $count = $result->count();
                
                $status = $duration < 50 ? '🟢' : ($duration < 200 ? '🟡' : '🔴');
                $this->line("$status $name: {$duration}ms ({$count} records)");
                
            } catch (\Exception $e) {
                $this->error("❌ $name: Error - " . $e->getMessage());
            }
        }
        
        $this->newLine();
    }

    private function showDetailedAnalysis()
    {
        $this->info('🔬 Detailed Analysis:');
        $this->newLine();

        // Show table sizes
        $tables = ['mangas', 'chapters', 'pages', 'taxonomies', 'taxonomy_terms', 'manga_taxonomy_terms'];
        
        $this->line('📈 Table Sizes:');
        foreach ($tables as $table) {
            try {
                $count = DB::table($table)->count();
                $this->line("  • $table: " . number_format($count) . ' records');
            } catch (\Exception $e) {
                $this->line("  • $table: Error getting count");
            }
        }
        
        $this->newLine();

        // Show indexes
        if (DB::getDriverName() === 'mysql') {
            $this->showMySQLIndexes();
        }
    }

    private function showMySQLIndexes()
    {
        $this->line('🗂️  Current Indexes:');
        
        $tables = ['mangas', 'chapters', 'pages', 'taxonomies', 'taxonomy_terms', 'manga_taxonomy_terms'];
        
        foreach ($tables as $table) {
            try {
                $indexes = DB::select("SHOW INDEX FROM $table");
                $this->line("  📋 $table:");
                
                $indexGroups = [];
                foreach ($indexes as $index) {
                    $indexGroups[$index->Key_name][] = $index->Column_name;
                }
                
                foreach ($indexGroups as $indexName => $columns) {
                    $columnList = implode(', ', $columns);
                    $this->line("    • $indexName: ($columnList)");
                }
                
            } catch (\Exception $e) {
                $this->line("    Error: " . $e->getMessage());
            }
        }
        
        $this->newLine();
    }

    private function showIndexRecommendations()
    {
        $this->info('💡 Index Recommendations:');
        $this->newLine();

        $recommendations = [
            '🔍 Search Optimization' => [
                'FULLTEXT index on mangas(name, description) for better search',
                'Consider using Laravel Scout for advanced search features'
            ],
            '📊 Query Optimization' => [
                'Monitor slow queries using Laravel Telescope',
                'Use EXPLAIN to analyze query execution plans',
                'Consider query caching for frequently accessed data'
            ],
            '⚡ Performance Tips' => [
                'Use eager loading to prevent N+1 queries',
                'Implement pagination for large result sets',
                'Consider Redis caching for popular manga data',
                'Use database connection pooling in production'
            ],
            '🔧 Maintenance' => [
                'Regularly run ANALYZE TABLE to update statistics',
                'Monitor index usage and remove unused indexes',
                'Consider partitioning for very large tables'
            ]
        ];

        foreach ($recommendations as $category => $tips) {
            $this->line($category);
            foreach ($tips as $tip) {
                $this->line("  • $tip");
            }
            $this->newLine();
        }
    }
}
