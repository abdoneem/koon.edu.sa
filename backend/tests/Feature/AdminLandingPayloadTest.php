<?php

namespace Tests\Feature;

use App\Models\ContentPage;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminLandingPayloadTest extends FeatureTestCase
{
    public function test_guest_cannot_access_landing_collections(): void
    {
        $this->getJson('/api/admin/content-pages/landing/en/collections/programs')->assertUnauthorized();
    }

    public function test_super_admin_can_list_replace_and_crud_program_item(): void
    {
        ContentPage::query()->create([
            'slug' => 'landing-page',
            'locale' => 'en',
            'published_at' => now(),
            'payload' => [
                'hero' => ['title' => 'H'],
                'programs' => [
                    ['id' => 'p1', 'name' => 'Old', 'description' => 'D', 'annualFee' => '0'],
                ],
            ],
        ]);
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/content-pages/landing/en/collections/programs')
            ->assertOk()
            ->assertJsonPath('data.0.id', 'p1');

        $this->withToken($token)->patchJson('/api/admin/content-pages/landing/en/collections/programs/items/p1', [
            'name' => 'Updated',
        ])->assertOk()->assertJsonPath('data.name', 'Updated');

        $this->withToken($token)->postJson('/api/admin/content-pages/landing/en/collections/programs/items', [
            'name' => 'New prog',
            'description' => 'Desc',
            'annualFee' => '100',
        ])->assertCreated()->assertJsonPath('data.name', 'New prog');

        $newId = $this->withToken($token)->postJson('/api/admin/content-pages/landing/en/collections/programs/items', [
            'name' => 'Tmp',
            'description' => 'X',
            'annualFee' => '1',
        ])->json('data.id');
        $this->assertIsString($newId);

        $this->withToken($token)->deleteJson("/api/admin/content-pages/landing/en/collections/programs/items/{$newId}")
            ->assertNoContent();

        $this->withToken($token)->putJson('/api/admin/content-pages/landing/en/collections/mediaTicker', [
            'data' => ['Line A', 'Line B'],
        ])->assertOk()->assertJsonPath('data.1', 'Line B');

        $this->withToken($token)->patchJson('/api/admin/content-pages/landing/en/inline/excellence', [
            'title' => 'Ex title',
            'bullets' => ['One', 'Two'],
        ])->assertOk()->assertJsonPath('excellence.title', 'Ex title');

        $this->withToken($token)->patchJson('/api/admin/content-pages/landing/en/inline/virtual-tour', [
            'note' => 'Tour note',
        ])->assertOk()->assertJsonPath('virtualTour.note', 'Tour note');

        $this->withToken($token)->patchJson('/api/admin/content-pages/landing/en/inline/articles-lead', [
            'articlesSectionLead' => 'Intro text',
            'articlesSectionTitle' => 'From the blog',
        ])->assertOk()
            ->assertJsonPath('articlesSectionLead', 'Intro text')
            ->assertJsonPath('articlesSectionTitle', 'From the blog');

        $this->withToken($token)->patchJson('/api/admin/content-pages/landing/en/inline/programs-section', [
            'eyebrow' => 'Our programmes',
            'title' => 'Academic pathways',
            'lead' => 'Choose a stage to explore.',
        ])->assertOk()
            ->assertJsonPath('programsSection.eyebrow', 'Our programmes')
            ->assertJsonPath('programsSection.title', 'Academic pathways');

        $this->withToken($token)->patchJson('/api/admin/content-pages/landing/en/inline/why-koon', [
            'title' => 'Why us',
            'visionText' => 'Our vision line',
        ])->assertOk()
            ->assertJsonPath('whyKoon.title', 'Why us')
            ->assertJsonPath('whyKoon.visionText', 'Our vision line');
    }

    public function test_unknown_collection_returns_404(): void
    {
        ContentPage::query()->create([
            'slug' => 'landing-page',
            'locale' => 'en',
            'published_at' => now(),
            'payload' => ['hero' => ['title' => 'H']],
        ]);
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/content-pages/landing/en/collections/unknown_x')
            ->assertStatus(404)
            ->assertJsonPath('code', 'unknown_collection');
    }
}
