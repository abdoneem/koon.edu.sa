<?php

namespace Database\Seeders;

use App\Models\ContentPage;
use App\Services\ContentPageDefaultPayloads;
use Illuminate\Database\Seeder;

class ContentPageSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        foreach (ContentPage::allowedSlugs() as $slug) {
            foreach (['en', 'ar'] as $locale) {
                // firstOrCreate only: never overwrite CMS payloads on re-seed (production-safe).
                ContentPage::query()->firstOrCreate(
                    ['slug' => $slug, 'locale' => $locale],
                    [
                        'payload' => ContentPageDefaultPayloads::for($slug, $locale),
                        'published_at' => $now,
                    ],
                );
            }
        }
    }
}
