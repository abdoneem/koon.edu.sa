<?php

namespace Tests\Feature;

use App\Models\ContentPage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentApiTest extends TestCase
{
    use RefreshDatabase;

    private static function sampleLandingPayload(): array
    {
        return [
            'hero' => [
                'title' => 'T',
                'subtitle' => 'S',
                'primaryCta' => 'A',
                'secondaryCta' => 'B',
                'location' => 'L',
            ],
            'programs' => [
                ['id' => '1', 'name' => 'P', 'description' => 'D', 'annualFee' => '0'],
            ],
            'highlights' => [
                ['id' => 'h1', 'title' => 'H', 'description' => 'HD'],
            ],
        ];
    }

    public function test_returns_landing_json_for_en_and_ar_when_published(): void
    {
        foreach (['en', 'ar'] as $locale) {
            ContentPage::query()->create([
                'slug' => 'landing-page',
                'locale' => $locale,
                'payload' => self::sampleLandingPayload(),
                'published_at' => now()->subMinute(),
            ]);
        }

        $en = $this->getJson('/api/content/landing-page?locale=en');
        $en->assertOk()->assertJsonPath('hero.title', 'T');

        $ar = $this->getJson('/api/content/landing-page?locale=ar');
        $ar->assertOk()->assertJsonPath('hero.title', 'T');
    }

    public function test_returns_404_for_unknown_slug(): void
    {
        $this->getJson('/api/content/other-page?locale=en')->assertNotFound();
    }

    public function test_returns_400_for_invalid_locale(): void
    {
        ContentPage::query()->create([
            'slug' => 'landing-page',
            'locale' => 'en',
            'payload' => self::sampleLandingPayload(),
            'published_at' => now(),
        ]);

        $this->getJson('/api/content/landing-page?locale=fr')
            ->assertStatus(400)
            ->assertJsonPath('message', 'Invalid locale. Use en or ar.');
    }

    public function test_returns_404_when_unpublished_or_missing(): void
    {
        ContentPage::query()->create([
            'slug' => 'about-page',
            'locale' => 'en',
            'payload' => [
                'title' => 'About',
                'description' => 'D',
                'pillars' => [
                    ['id' => 'p1', 'title' => 'T', 'description' => 'X'],
                ],
            ],
            'published_at' => null,
        ]);

        $this->getJson('/api/content/about-page?locale=en')->assertNotFound();

        $this->getJson('/api/content/about-page?locale=ar')->assertNotFound();
    }

    public function test_contact_page_shape(): void
    {
        ContentPage::query()->create([
            'slug' => 'contact-page',
            'locale' => 'en',
            'payload' => [
                'title' => 'C',
                'description' => 'D',
                'phone' => '1',
                'email' => 'a@b.co',
                'address' => 'Addr',
            ],
            'published_at' => now(),
        ]);

        $this->getJson('/api/content/contact-page?locale=en')
            ->assertOk()
            ->assertJsonPath('email', 'a@b.co');
    }

    public function test_throttle_allows_reasonable_burst(): void
    {
        ContentPage::query()->create([
            'slug' => 'admissions-page',
            'locale' => 'en',
            'payload' => [
                'title' => 'A',
                'description' => 'B',
                'steps' => [
                    ['id' => 's1', 'title' => 'T', 'description' => 'D'],
                ],
            ],
            'published_at' => now(),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->getJson('/api/content/admissions-page?locale=en')->assertOk();
        }
    }
}
