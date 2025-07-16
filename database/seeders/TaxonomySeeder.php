<?php

namespace Database\Seeders;

use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Database\Seeder;

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
                'name' => 'Genre',
                'slug' => 'genre',
                'type' => 'genre',
                'description' => 'Manga genres and categories',
            ],
            [
                'name' => 'Author',
                'slug' => 'author',
                'type' => 'author',
                'description' => 'Manga authors and creators',
            ],
            [
                'name' => 'Tag',
                'slug' => 'tag',
                'type' => 'tag',
                'description' => 'Additional tags for manga',
            ],
            [
                'name' => 'Status',
                'slug' => 'status',
                'type' => 'status',
                'description' => 'Publication status',
            ],
            [
                'name' => 'Year',
                'slug' => 'year',
                'type' => 'year',
                'description' => 'Publication year',
            ],
            [
                'name' => 'Artist',
                'slug' => 'artist',
                'type' => 'artist',
                'description' => 'Manga artists and illustrators',
            ],
        ];

        foreach ($taxonomies as $taxonomyData) {
            $taxonomy = Taxonomy::create($taxonomyData);

            // Create terms for each taxonomy
            if ($taxonomy->slug === 'genres') {
                $this->createGenreTerms($taxonomy);
            } elseif ($taxonomy->slug === 'status') {
                $this->createStatusTerms($taxonomy);
            }
        }

        $this->command->info('Created taxonomies and terms successfully.');
    }

    private function createGenreTerms(Taxonomy $taxonomy): void
    {
        $genres = [
            ['genre' => 'アクション', 'slug' => 'akushon'],
            ['genre' => 'アダルト', 'slug' => 'adaruto'],
            ['genre' => '冒険', 'slug' => 'bouken'],
            ['genre' => '前衛系', 'slug' => 'zen-ei-kei'],
            ['genre' => '受賞作', 'slug' => 'jushou-saku'],
            ['genre' => 'ボーイズラブ', 'slug' => 'booizu-rabu'],
            ['genre' => 'コメディ', 'slug' => 'komedi'],
            ['genre' => '同人誌', 'slug' => 'doujinshi'],
            ['genre' => 'ドラマ', 'slug' => 'dorama'],
            ['genre' => 'エッチ', 'slug' => 'ecchi'],
            ['genre' => 'エロ', 'slug' => 'ero'],
            ['genre' => 'ファンタジー', 'slug' => 'fantaji'],
            ['genre' => '性転換', 'slug' => 'seitenkan'],
            ['genre' => 'ガールズラブ', 'slug' => 'garuzu-rabu'],
            ['genre' => 'グルメ', 'slug' => 'gurume'],
            ['genre' => 'ハーレム', 'slug' => 'haaremu'],
            ['genre' => '変態', 'slug' => 'hentai'],
            ['genre' => '歴史', 'slug' => 'rekishi'],
            ['genre' => 'ホラー', 'slug' => 'horaa'],
            ['genre' => '女性向け', 'slug' => 'josei-muke'],
            ['genre' => 'ロリコン', 'slug' => 'rorikon'],
            ['genre' => '魔法少女', 'slug' => 'mahou-shoujo'],
            ['genre' => '格闘技', 'slug' => 'kakutougi'],
            ['genre' => '成人向け', 'slug' => 'seijin-muke'],
            ['genre' => 'メカ', 'slug' => 'meka'],
            ['genre' => '音楽系', 'slug' => 'ongaku-kei'],
            ['genre' => 'ミステリー', 'slug' => 'misuterii'],
            ['genre' => '心理', 'slug' => 'shinri'],
            ['genre' => '恋愛', 'slug' => 'renai'],
            ['genre' => '学園物', 'slug' => 'gakuen-mono'],
            ['genre' => 'ＳＦ', 'slug' => 'esuefu'],
            ['genre' => '青年向け', 'slug' => 'seinen-muke'],
            ['genre' => 'ショタコン', 'slug' => 'shotakon'],
            ['genre' => '少女向け', 'slug' => 'shoujo-muke'],
            ['genre' => '少女愛', 'slug' => 'shoujo-ai'],
            ['genre' => '少年向け', 'slug' => 'shounen-muke'],
            ['genre' => '少年愛', 'slug' => 'shounen-ai'],
            ['genre' => '日常系', 'slug' => 'nichijou-kei'],
            ['genre' => 'スマット', 'slug' => 'sumatto'],
            ['genre' => 'スポーツ', 'slug' => 'supootsu'],
            ['genre' => '超能力', 'slug' => 'chounouryoku'],
            ['genre' => 'サスペンス', 'slug' => 'sasupensu'],
            ['genre' => 'スリラー', 'slug' => 'suriraa'],
            ['genre' => '悲劇', 'slug' => 'higeki'],
            ['genre' => 'やおい', 'slug' => 'yaoi'],
            ['genre' => '百合', 'slug' => 'yuri'],
        ];

        foreach ($genres as $genreData) {
            TaxonomyTerm::create([
                'taxonomy_id' => $taxonomy->id,
                'name' => $genreData['genre'],
                'slug' => $genreData['slug'],
            ]);
        }
    }


    private function createStatusTerms(Taxonomy $taxonomy): void
    {
        $statuses = [
            'Ongoing', 'Completed', 'Hiatus', 'Cancelled',
        ];

        foreach ($statuses as $status) {
            TaxonomyTerm::create([
                'taxonomy_id' => $taxonomy->id,
                'name' => $status,
                'slug' => \Str::slug($status),
            ]);
        }
    }
}
