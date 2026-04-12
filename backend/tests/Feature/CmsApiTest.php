<?php

namespace Tests\Feature;

use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\CmsSectionItem;
use App\Models\CmsSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

class CmsApiTest extends FeatureTestCase
{
    public function test_public_pages_returns_fallback_when_missing(): void
    {
        $this->getJson('/api/pages/about?locale=en')
            ->assertOk()
            ->assertJsonPath('fallback', true)
            ->assertJsonPath('page', null)
            ->assertJsonPath('sections', []);
    }

    public function test_public_pages_returns_structured_payload_when_published(): void
    {
        $page = CmsPage::query()->create([
            'title' => 'About',
            'slug' => 'about',
            'locale' => 'en',
            'meta_title' => 'MT',
            'meta_description' => 'MD',
            'is_active' => true,
            'published_at' => now()->subHour(),
        ]);
        $section = CmsSection::query()->create([
            'cms_page_id' => $page->id,
            'type' => 'hero',
            'title' => 'H',
            'subtitle' => 'S',
            'sort_order' => 0,
            'is_active' => true,
        ]);
        CmsSectionItem::query()->create([
            'cms_section_id' => $section->id,
            'title' => 'Item',
            'description' => 'Desc',
            'image' => null,
            'icon' => null,
            'link' => 'https://example.com',
            'sort_order' => 0,
        ]);

        $this->getJson('/api/pages/about?locale=en')
            ->assertOk()
            ->assertJsonPath('fallback', false)
            ->assertJsonPath('page.title', 'About')
            ->assertJsonPath('sections.0.type', 'hero')
            ->assertJsonPath('sections.0.items.0.title', 'Item');
    }

    public function test_public_settings_returns_map(): void
    {
        CmsSetting::query()->create(['key' => 'phone', 'value' => '050']);
        $this->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('settings.phone', '050');
    }

    public function test_admin_can_manage_cms_page_tree(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;

        $create = $this->withToken($token)->postJson('/api/admin/cms-pages', [
            'title' => 'T',
            'slug' => 'landing',
            'locale' => 'en',
            'meta_title' => null,
            'meta_description' => null,
            'is_active' => true,
            'published_at' => now()->toIso8601String(),
        ]);
        $create->assertCreated();
        $id = $create->json('id');

        $sec = $this->withToken($token)->postJson("/api/admin/cms-pages/{$id}/sections", [
            'type' => 'text',
            'title' => 'Block',
            'sort_order' => 0,
            'is_active' => true,
        ]);
        $sec->assertCreated();
        $sid = $sec->json('id');

        $item = $this->withToken($token)->postJson("/api/admin/cms-sections/{$sid}/items", [
            'title' => 'Line',
            'sort_order' => 0,
        ]);
        $item->assertCreated();
        $iid = $item->json('id');

        $this->withToken($token)->patchJson("/api/admin/cms-section-items/{$iid}", [
            'title' => 'Line2',
        ])->assertOk()->assertJsonPath('title', 'Line2');

        $this->withToken($token)->deleteJson("/api/admin/cms-section-items/{$iid}")
            ->assertNoContent();

        $this->withToken($token)->deleteJson("/api/admin/cms-sections/{$sid}")
            ->assertNoContent();

        $this->withToken($token)->deleteJson("/api/admin/cms-pages/{$id}")
            ->assertNoContent();
    }

    public function test_admin_can_update_cms_settings(): void
    {
        CmsSetting::query()->create(['key' => 'email', 'value' => '']);
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->putJson('/api/admin/cms-settings', [
            'email' => 'a@b.co',
            'phone' => '050',
        ])->assertOk()->assertJsonPath('settings.email', 'a@b.co');
    }

    public function test_admin_nav_tree_must_be_valid_structure(): void
    {
        CmsSetting::query()->create(['key' => 'email', 'value' => '']);
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->putJson('/api/admin/cms-settings', [
            'nav_tree_en' => [
                ['id' => 'x', 'label' => 'Bad', 'href' => '/ok', 'children' => [['oops' => true]]],
            ],
        ])->assertStatus(422);

        $this->withToken($token)->putJson('/api/admin/cms-settings', [
            'nav_tree_en' => [
                [
                    'id' => 'parent',
                    'label' => 'Parent',
                    'href' => '/parent',
                    'children' => [
                        ['id' => 'child', 'label' => 'Child', 'href' => '/child'],
                    ],
                ],
            ],
        ])->assertOk();

        $raw = CmsSetting::query()->where('key', 'nav_tree_en')->value('value');
        $this->assertIsString($raw);
        $decoded = json_decode($raw, true);
        $this->assertIsArray($decoded);
        $this->assertSame('Child', $decoded[0]['children'][0]['label']);
    }

    public function test_guest_cannot_upload_cms_media(): void
    {
        $file = UploadedFile::fake()->image('x.png', 10, 10);
        $this->withHeaders(['Accept' => 'application/json'])
            ->post('/api/admin/cms-media', ['file' => $file])
            ->assertUnauthorized();
    }

    public function test_user_without_cms_manage_cannot_upload_cms_media(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('admissions_staff');
        $token = $user->createToken('t')->plainTextToken;
        $file = UploadedFile::fake()->image('x.png', 10, 10);

        $this->withToken($token)->post('/api/admin/cms-media', ['file' => $file])
            ->assertForbidden();
    }

    public function test_admin_can_upload_cms_image(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;
        $file = UploadedFile::fake()->image('banner.jpg', 100, 50);

        $response = $this->withToken($token)->post('/api/admin/cms-media', [
            'file' => $file,
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['url']);

        $url = $response->json('url');
        $this->assertIsString($url);
        $this->assertNotSame('', $url);

        $files = Storage::disk('public')->allFiles('cms');
        $this->assertNotEmpty($files);
        $this->assertMatchesRegularExpression('/\.(webp|jpg|jpeg|png)$/i', $files[0]);
    }

    public function test_cms_media_requires_media_manage_even_with_cms_manage(): void
    {
        Storage::fake('public');
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->syncPermissions(['cms_manage']);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $user->createToken('t')->plainTextToken;
        $file = UploadedFile::fake()->image('x.png', 10, 10);

        $this->withToken($token)->post('/api/admin/cms-media', ['file' => $file])
            ->assertForbidden();
    }

    public function test_cms_settings_requires_cms_settings_manage_permission(): void
    {
        CmsSetting::query()->create(['key' => 'email', 'value' => '']);
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->syncPermissions(['cms_manage']);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/cms-settings')->assertForbidden();
        $this->withToken($token)->putJson('/api/admin/cms-settings', [
            'email' => 'a@b.co',
        ])->assertForbidden();
    }
}
