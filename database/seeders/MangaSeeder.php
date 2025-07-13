<?php

namespace Database\Seeders;

use App\Models\Manga;
use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Database\Seeder;

class MangaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sampleManga = [
            [
                'name' => 'One Piece',
                'alternative_names' => json_encode(['ワンピース', 'Wan Pīsu']),
                'description' => 'Monkey D. Luffy, một cậu bé có thể kéo dài cơ thể như cao su sau khi vô tình ăn phải Trái Ác Quỷ. Luffy khám phá Grand Line cùng với băng hải tặc Mũ Rơm của mình để tìm kiếm kho báu huyền thoại được gọi là "One Piece" và trở thành Vua Hải Tặc tiếp theo.',
                'status' => 'ongoing',
                'views' => 150000,
                'rating' => 9.5,
                'total_rating' => 12500,
                'cover' => '/images/covers/one-piece.jpg',
                'slug' => 'one-piece',
                'genres' => ['Shounen', 'Adventure', 'Comedy', 'Drama'],
                'author' => 'Eiichiro Oda',
            ],
            [
                'name' => 'Naruto',
                'alternative_names' => json_encode(['ナルト', 'Naruto']),
                'description' => 'Naruto Uzumaki, một ninja trẻ tuổi từ làng Lá, tìm kiếm sự công nhận từ những người đồng nghiệp và ước mơ trở thành Hokage, thủ lĩnh của làng.',
                'status' => 'completed',
                'views' => 120000,
                'rating' => 9.2,
                'total_rating' => 10800,
                'cover' => '/images/covers/naruto.jpg',
                'slug' => 'naruto',
                'genres' => ['Shounen', 'Action', 'Martial Arts', 'Super Power'],
                'author' => 'Masashi Kishimoto',
            ],
            [
                'name' => 'Attack on Titan',
                'alternative_names' => json_encode(['進撃の巨人', 'Shingeki no Kyojin']),
                'description' => 'Nhân loại sống trong những thành phố được bao quanh bởi những bức tường khổng lồ để bảo vệ họ khỏi những Titan khổng lồ ăn thịt người.',
                'status' => 'completed',
                'views' => 200000,
                'rating' => 9.8,
                'total_rating' => 15200,
                'cover' => '/images/covers/attack-on-titan.jpg',
                'slug' => 'attack-on-titan',
                'genres' => ['Shounen', 'Action', 'Drama', 'Horror'],
                'author' => 'Hajime Isayama',
            ],
            [
                'name' => 'Death Note',
                'alternative_names' => json_encode(['デスノート', 'Desu Nōto']),
                'description' => 'Light Yagami, một học sinh trung học thông minh, tìm thấy một cuốn sổ tử thần có thể giết chết bất kỳ ai chỉ bằng cách viết tên của họ vào đó.',
                'status' => 'completed',
                'views' => 180000,
                'rating' => 9.4,
                'total_rating' => 11700,
                'cover' => '/images/covers/death-note.jpg',
                'slug' => 'death-note',
                'genres' => ['Shounen', 'Supernatural', 'Thriller', 'Psychological'],
                'author' => 'Tsugumi Ohba',
            ],
            [
                'name' => 'Dragon Ball',
                'alternative_names' => json_encode(['ドラゴンボール', 'Doragon Bōru']),
                'description' => 'Goku, một chiến binh Saiyan, bảo vệ Trái Đất khỏi những kẻ thù mạnh mẽ cùng với bạn bè của mình.',
                'status' => 'completed',
                'views' => 140000,
                'rating' => 9.0,
                'total_rating' => 9800,
                'cover' => '/images/covers/dragon-ball.jpg',
                'slug' => 'dragon-ball',
                'genres' => ['Shounen', 'Action', 'Adventure', 'Martial Arts'],
                'author' => 'Akira Toriyama',
            ],
            [
                'name' => 'My Hero Academia',
                'alternative_names' => json_encode(['僕のヒーローアカデミア', 'Boku no Hīrō Akademia']),
                'description' => 'Trong thế giới nơi 80% dân số có siêu năng lực, Izuku Midoriya sinh ra không có năng lực nhưng vẫn ước mơ trở thành một siêu anh hùng.',
                'status' => 'ongoing',
                'views' => 95000,
                'rating' => 8.7,
                'total_rating' => 7200,
                'cover' => '/images/covers/my-hero-academia.jpg',
                'slug' => 'my-hero-academia',
                'genres' => ['Shounen', 'Action', 'School', 'Super Power'],
                'author' => 'Kohei Horikoshi',
            ],
            [
                'name' => 'Demon Slayer',
                'alternative_names' => json_encode(['鬼滅の刃', 'Kimetsu no Yaiba']),
                'description' => 'Tanjiro Kamado trở thành thợ săn quỷ để cứu em gái bị biến thành quỷ và trả thù cho gia đình bị thảm sát.',
                'status' => 'completed',
                'views' => 175000,
                'rating' => 9.1,
                'total_rating' => 13400,
                'cover' => '/images/covers/demon-slayer.jpg',
                'slug' => 'demon-slayer',
                'genres' => ['Shounen', 'Action', 'Historical', 'Supernatural'],
                'author' => 'Koyoharu Gotouge',
            ],
            [
                'name' => 'Jujutsu Kaisen',
                'alternative_names' => json_encode(['呪術廻戦', 'Jujutsu Kaisen']),
                'description' => 'Yuji Itadori, một học sinh trung học với sức mạnh thể chất phi thường, gia nhập thế giới của Jujutsu Sorcerers để chiến đấu chống lại những lời nguyền.',
                'status' => 'ongoing',
                'views' => 110000,
                'rating' => 8.9,
                'total_rating' => 8500,
                'cover' => '/images/covers/jujutsu-kaisen.jpg',
                'slug' => 'jujutsu-kaisen',
                'genres' => ['Shounen', 'Action', 'School', 'Supernatural'],
                'author' => 'Gege Akutami',
            ],
            [
                'name' => 'Chainsaw Man',
                'alternative_names' => json_encode(['チェンソーマン', 'Chensō Man']),
                'description' => 'Denji, một thanh niên nghèo khổ, trở thành Devil Hunter để trả nợ và có cuộc sống tốt hơn.',
                'status' => 'ongoing',
                'views' => 85000,
                'rating' => 8.5,
                'total_rating' => 6100,
                'cover' => '/images/covers/chainsaw-man.jpg',
                'slug' => 'chainsaw-man',
                'genres' => ['Shounen', 'Action', 'Horror', 'Supernatural'],
                'author' => 'Tatsuki Fujimoto',
            ],
            [
                'name' => 'Tokyo Ghoul',
                'alternative_names' => json_encode(['東京喰種', 'Tōkyō Gūru']),
                'description' => 'Ken Kaneki, một sinh viên đại học, trở thành một ghoul nửa người nửa quỷ sau một cuộc gặp gỡ định mệnh.',
                'status' => 'completed',
                'views' => 130000,
                'rating' => 8.8,
                'total_rating' => 9200,
                'cover' => '/images/covers/tokyo-ghoul.jpg',
                'slug' => 'tokyo-ghoul',
                'genres' => ['Seinen', 'Action', 'Horror', 'Supernatural'],
                'author' => 'Sui Ishida',
            ],
        ];

        foreach ($sampleManga as $mangaData) {
            $genres = $mangaData['genres'];
            $author = $mangaData['author'];
            unset($mangaData['genres'], $mangaData['author']);

            $manga = Manga::create($mangaData);

            // Attach genres
            $genreTaxonomy = Taxonomy::where('slug', 'genres')->first();
            if ($genreTaxonomy) {
                foreach ($genres as $genreName) {
                    $genre = TaxonomyTerm::where('taxonomy_id', $genreTaxonomy->id)
                        ->where('name', $genreName)
                        ->first();

                    if ($genre) {
                        $manga->taxonomyTerms()->attach($genre->id);
                    }
                }
            }

            // Attach author
            $authorTaxonomy = Taxonomy::where('slug', 'authors')->first();
            if ($authorTaxonomy) {
                $authorTerm = TaxonomyTerm::where('taxonomy_id', $authorTaxonomy->id)
                    ->where('name', $author)
                    ->first();

                if (! $authorTerm) {
                    $authorTerm = TaxonomyTerm::create([
                        'taxonomy_id' => $authorTaxonomy->id,
                        'name' => $author,
                        'slug' => \Str::slug($author),
                    ]);
                }

                if ($authorTerm) {
                    $manga->taxonomyTerms()->attach($authorTerm->id);
                }
            }
        }

        $this->command->info('Created '.count($sampleManga).' sample manga with genres and authors.');
    }
}
