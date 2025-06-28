<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;

class TaxonomySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create main taxonomies
        $taxonomies = [
            [
                'name' => 'Genres',
                'slug' => 'genres',
                'description' => 'Manga genres and categories'
            ],
            [
                'name' => 'Authors',
                'slug' => 'authors', 
                'description' => 'Manga authors and creators'
            ],
            [
                'name' => 'Tags',
                'slug' => 'tags',
                'description' => 'Additional tags for manga'
            ],
            [
                'name' => 'Status',
                'slug' => 'status',
                'description' => 'Publication status'
            ]
        ];

        foreach ($taxonomies as $taxonomyData) {
            $taxonomy = Taxonomy::create($taxonomyData);

            // Create terms for each taxonomy
            if ($taxonomy->slug === 'genres') {
                $this->createGenreTerms($taxonomy);
            } elseif ($taxonomy->slug === 'authors') {
                $this->createAuthorTerms($taxonomy);
            } elseif ($taxonomy->slug === 'tags') {
                $this->createTagTerms($taxonomy);
            } elseif ($taxonomy->slug === 'status') {
                $this->createStatusTerms($taxonomy);
            }
        }

        $this->command->info('Created taxonomies and terms successfully.');
    }

    private function createGenreTerms(Taxonomy $taxonomy): void
    {
        $genres = [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance',
            'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Supernatural', 'Fantasy',
            'Sci-Fi', 'Mystery', 'Thriller', 'Slice of Life', 'Sports',
            'Martial Arts', 'Mecha', 'Historical', 'School', 'Psychological',
            'Super Power', 'Magic', 'Isekai', 'Harem', 'Ecchi', 'Yaoi', 'Yuri'
        ];

        foreach ($genres as $genre) {
            TaxonomyTerm::create([
                'taxonomy_id' => $taxonomy->id,
                'name' => $genre,
                'slug' => \Str::slug($genre)
            ]);
        }
    }

    private function createAuthorTerms(Taxonomy $taxonomy): void
    {
        $authors = [
            'Eiichiro Oda', 'Masashi Kishimoto', 'Hajime Isayama', 'Tsugumi Ohba',
            'Akira Toriyama', 'Kohei Horikoshi', 'Koyoharu Gotouge', 'Gege Akutami',
            'Tatsuki Fujimoto', 'Sui Ishida', 'Naoki Urasawa', 'Kentaro Miura',
            'Yoshihiro Togashi', 'Takeshi Obata', 'Hirohiko Araki'
        ];

        foreach ($authors as $author) {
            TaxonomyTerm::create([
                'taxonomy_id' => $taxonomy->id,
                'name' => $author,
                'slug' => \Str::slug($author)
            ]);
        }
    }

    private function createTagTerms(Taxonomy $taxonomy): void
    {
        $tags = [
            'Popular', 'Trending', 'New Release', 'Classic', 'Award Winner',
            'Anime Adaptation', 'Complete Series', 'Long Running', 'One Shot',
            'Webcomic', 'Full Color', 'Black and White', 'Weekly', 'Monthly'
        ];

        foreach ($tags as $tag) {
            TaxonomyTerm::create([
                'taxonomy_id' => $taxonomy->id,
                'name' => $tag,
                'slug' => \Str::slug($tag)
            ]);
        }
    }

    private function createStatusTerms(Taxonomy $taxonomy): void
    {
        $statuses = [
            'Ongoing', 'Completed', 'Hiatus', 'Cancelled'
        ];

        foreach ($statuses as $status) {
            TaxonomyTerm::create([
                'taxonomy_id' => $taxonomy->id,
                'name' => $status,
                'slug' => \Str::slug($status)
            ]);
        }
    }
}
