<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Manga;
use App\Models\Chapter;

class ChapterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $manga = Manga::all();

        foreach ($manga as $mangaItem) {
            $chapterCount = $this->getChapterCount($mangaItem->status);
            
            for ($i = 1; $i <= $chapterCount; $i++) {
                Chapter::create([
                    'manga_id' => $mangaItem->id,
                    'title' => $this->generateChapterTitle($mangaItem->name, $i),
                    'chapter_number' => $i,
                    'volume_number' => ceil($i / 10), // Assume 10 chapters per volume
                    'pages_count' => rand(15, 25),
                    'published_at' => now()->subDays(rand(1, 365))
                ]);
            }
        }

        $this->command->info('Created chapters for all manga.');
    }

    private function getChapterCount(string $status): int
    {
        return match ($status) {
            'completed' => rand(50, 200),
            'ongoing' => rand(20, 100),
            'hiatus' => rand(10, 50),
            'cancelled' => rand(5, 30),
            default => rand(10, 50)
        };
    }

    private function generateChapterTitle(string $mangaName, int $chapterNumber): string
    {
        $titles = [
            'One Piece' => [
                'Romance Dawn',
                'Buggy the Clown',
                'Captain Kuro',
                'Baratie',
                'Arlong Park',
                'Loguetown',
                'Reverse Mountain',
                'Whiskey Peak',
                'Little Garden',
                'Drum Island'
            ],
            'Naruto' => [
                'Enter: Naruto Uzumaki!',
                'My Name is Konohamaru!',
                'Sasuke and Sakura: Friends or Foes?',
                'Pass or Fail: Survival Test',
                'You Failed! Kakashi\'s Final Decision',
                'A Dangerous Mission! Journey to the Land of Waves!',
                'The Assassin of the Mist!',
                'The Oath of Pain',
                'Kakashi: Sharingan Warrior!',
                'The Forest of Death'
            ],
            'Attack on Titan' => [
                'To You, in 2000 Years',
                'That Day',
                'A Dim Light Amid Despair',
                'The Night of the Closing Ceremony',
                'First Battle',
                'The World the Girl Saw',
                'Small Blade',
                'I Can Hear His Heartbeat',
                'The Beating of a Heart Can Be Heard',
                'Where\'s the Left Arm?'
            ]
        ];

        if (isset($titles[$mangaName]) && isset($titles[$mangaName][$chapterNumber - 1])) {
            return "Chapter {$chapterNumber}: " . $titles[$mangaName][$chapterNumber - 1];
        }

        $genericTitles = [
            'The Beginning',
            'New Challenges',
            'The Battle Begins',
            'Unexpected Encounter',
            'Power Awakens',
            'The Truth Revealed',
            'Final Confrontation',
            'Victory and Loss',
            'New Horizons',
            'The Journey Continues',
            'Hidden Secrets',
            'Allies and Enemies',
            'The Test of Strength',
            'Memories of the Past',
            'Hope and Despair',
            'The Price of Power',
            'Bonds of Friendship',
            'The Ultimate Challenge',
            'Turning Point',
            'New Beginnings'
        ];

        $titleIndex = ($chapterNumber - 1) % count($genericTitles);
        return "Chapter {$chapterNumber}: " . $genericTitles[$titleIndex];
    }


}
