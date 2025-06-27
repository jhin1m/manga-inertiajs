<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Manga>
 */
class MangaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(rand(2, 4), true);
        
        return [
            'name' => $name,
            'alternative_names' => [
                fake()->words(rand(2, 3), true),
                fake()->words(rand(2, 3), true),
            ],
            'description' => fake()->paragraphs(rand(3, 5), true),
            'status' => fake()->randomElement(['ongoing', 'completed', 'hiatus', 'cancelled']),
            'views' => fake()->numberBetween(100, 1000000),
            'cover' => fake()->imageUrl(400, 600, 'manga'),
            'slug' => Str::slug($name),
        ];
    }

    public function ongoing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ongoing',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'views' => fake()->numberBetween(500000, 2000000),
        ]);
    }
}
