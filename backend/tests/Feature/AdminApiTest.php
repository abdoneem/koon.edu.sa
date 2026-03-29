<?php

namespace Tests\Feature;

use App\Models\ContentPage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_token(): void
    {
        User::factory()->create([
            'email' => 'editor@test.com',
            'password' => Hash::make('secret'),
        ]);

        $res = $this->postJson('/api/auth/login', [
            'email' => 'editor@test.com',
            'password' => 'secret',
        ]);

        $res->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email']]);
    }

    public function test_admin_routes_require_auth(): void
    {
        $this->getJson('/api/admin/content-pages')->assertUnauthorized();
    }

    public function test_authenticated_editor_can_crud_content_page(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $token = $user->createToken('t')->plainTextToken;

        $payload = [
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
                ['id' => 'h1', 'title' => 'H', 'description' => 'X'],
            ],
        ];

        $create = $this->withToken($token)->postJson('/api/admin/content-pages', [
            'slug' => 'landing-page',
            'locale' => 'en',
            'published_at' => now()->toIso8601String(),
            'payload' => $payload,
        ]);

        $create->assertCreated();
        $id = $create->json('id');

        $this->withToken($token)->getJson("/api/admin/content-pages/{$id}")
            ->assertOk()
            ->assertJsonPath('slug', 'landing-page');

        $payload['hero']['title'] = 'Updated';
        $this->withToken($token)->putJson("/api/admin/content-pages/{$id}", [
            'payload' => $payload,
        ])->assertOk()->assertJsonPath('payload.hero.title', 'Updated');

        $this->withToken($token)->deleteJson("/api/admin/content-pages/{$id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('content_pages', ['id' => $id]);
    }

    public function test_public_content_endpoint_still_works(): void
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
}
