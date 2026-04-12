<?php

namespace Tests\Feature;

use App\Models\ContentPage;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminApiTest extends FeatureTestCase
{
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

        $res->assertOk()->assertJsonStructure([
            'token',
            'user' => ['id', 'email', 'name', 'roles', 'permissions'],
        ]);
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
        $user->assignRole('super_admin');
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

    public function test_content_page_reset_to_seeded_defaults(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;

        $page = ContentPage::query()->create([
            'slug' => 'about-page',
            'locale' => 'en',
            'payload' => [
                'title' => 'Custom Title',
                'description' => 'Custom desc',
                'pillars' => [
                    ['id' => 'x', 'title' => 'One', 'description' => 'D'],
                ],
            ],
            'published_at' => now(),
        ]);

        $this->withToken($token)
            ->postJson("/api/admin/content-pages/{$page->id}/reset-to-seeded")
            ->assertOk()
            ->assertJsonPath('payload.title', 'A School Community Built Around Purpose')
            ->assertJsonPath('payload.pillars.0.id', 'p1');

        $page->refresh();
        $this->assertSame('A School Community Built Around Purpose', $page->payload['title']);
    }

    public function test_dashboard_summary_requires_dashboard_permission(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);

        Sanctum::actingAs($user, ['*']);
        $this->getJson('/api/admin/dashboard/summary')->assertForbidden();

        $user->assignRole('viewer');
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        Sanctum::actingAs($user->fresh(), ['*']);
        $this->getJson('/api/admin/dashboard/summary')->assertOk();
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

    public function test_admin_users_routes_require_auth(): void
    {
        $this->getJson('/api/admin/users')->assertUnauthorized();
        $this->patchJson('/api/admin/users/1', ['roles' => ['viewer']])->assertUnauthorized();
    }

    public function test_admin_users_requires_users_manage_permission(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $user->assignRole('viewer');
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        Sanctum::actingAs($user->fresh(), ['*']);

        $this->getJson('/api/admin/users')->assertForbidden();
        $this->patchJson("/api/admin/users/{$user->id}", ['roles' => ['editor']])->assertForbidden();
    }

    public function test_super_admin_can_list_users_and_patch_roles(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin-users@test.com',
            'password' => Hash::make('secret'),
        ]);
        $admin->assignRole('super_admin');

        $target = User::factory()->create([
            'email' => 'target-users@test.com',
            'password' => Hash::make('secret'),
        ]);
        $target->assignRole('viewer');

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $token = $admin->createToken('t')->plainTextToken;

        $list = $this->withToken($token)->getJson('/api/admin/users');
        $list->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'email', 'roles', 'permissions']]]);

        $patch = $this->withToken($token)->patchJson("/api/admin/users/{$target->id}", [
            'roles' => ['editor'],
        ]);
        $patch->assertOk()
            ->assertJsonPath('id', $target->id)
            ->assertJsonPath('roles', ['editor']);

        $this->assertTrue($target->fresh()->hasRole('editor'));
        $this->assertFalse($target->fresh()->hasRole('viewer'));
    }

    public function test_super_admin_cannot_delete_self(): void
    {
        $admin = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $admin->assignRole('super_admin');
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $admin->createToken('t')->plainTextToken;

        $this->withToken($token)->deleteJson("/api/admin/users/{$admin->id}")
            ->assertStatus(422)
            ->assertJsonPath('code', 'cannot_delete_own_account')
            ->assertJsonPath('message', 'You cannot delete your own account.');
    }

    public function test_super_admin_cannot_strip_own_users_manage_via_roles(): void
    {
        $admin = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $admin->assignRole('super_admin');
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $admin->createToken('t')->plainTextToken;

        $this->withToken($token)->patchJson("/api/admin/users/{$admin->id}", [
            'roles' => ['viewer'],
        ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'cannot_remove_own_users_manage');

        $this->assertTrue($admin->fresh()->hasRole('super_admin'));
    }

    public function test_super_admin_can_manage_roles_permissions_and_users(): void
    {
        $admin = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $admin->assignRole('super_admin');
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $admin->createToken('t')->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/permissions')->assertOk()->assertJsonStructure(['data']);

        $createdPerm = $this->withToken($token)->postJson('/api/admin/permissions', [
            'name' => 'api_test_perm',
        ]);
        $createdPerm->assertCreated()->assertJsonPath('name', 'api_test_perm');

        $newRole = $this->withToken($token)->postJson('/api/admin/roles', [
            'name' => 'api_test_role',
        ]);
        $newRole->assertCreated()->assertJsonPath('name', 'api_test_role');
        $roleId = $newRole->json('id');

        $this->withToken($token)->putJson("/api/admin/roles/{$roleId}/permissions", [
            'permissions' => ['dashboard_view', 'api_test_perm'],
        ])->assertOk()->assertJsonPath('permissions', ['api_test_perm', 'dashboard_view']);

        $newUser = $this->withToken($token)->postJson('/api/admin/users', [
            'name' => 'API Test User',
            'email' => 'api-test-user@example.com',
            'password' => 'password1x',
            'roles' => ['api_test_role'],
        ]);
        $newUser->assertCreated()->assertJsonPath('email', 'api-test-user@example.com');
        $userId = $newUser->json('id');

        $this->withToken($token)->deleteJson("/api/admin/users/{$userId}")->assertNoContent();

        $this->withToken($token)->deleteJson("/api/admin/roles/{$roleId}")->assertNoContent();

        $permId = $createdPerm->json('id');
        $this->withToken($token)->deleteJson("/api/admin/permissions/{$permId}")->assertNoContent();
    }

    public function test_cannot_sync_role_permissions_to_remove_all_users_manage_access(): void
    {
        $admin = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $admin->assignRole('super_admin');
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $admin->createToken('t')->plainTextToken;

        $superAdminRole = Role::findByName('super_admin', 'sanctum');
        $this->assertNotNull($superAdminRole);

        $this->withToken($token)->putJson("/api/admin/roles/{$superAdminRole->id}/permissions", [
            'permissions' => ['dashboard_view'],
        ])
            ->assertStatus(422)
            ->assertJsonPath('code', 'users_manage_required');

        $superAdminRole->refresh();
        $this->assertTrue($superAdminRole->hasPermissionTo('users_manage'));
    }

    public function test_landing_hero_inline_requires_auth(): void
    {
        $this->patchJson('/api/admin/content-pages/landing-hero/inline', [
            'locale' => 'en',
            'hero' => ['title' => 'X'],
        ])->assertUnauthorized();
    }

    public function test_landing_hero_inline_requires_inline_edit_permission(): void
    {
        ContentPage::query()->create([
            'slug' => 'landing-page',
            'locale' => 'en',
            'published_at' => now(),
            'payload' => ['hero' => ['title' => 'Old']],
        ]);
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $user->syncPermissions(['content_pages_manage']);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->patchJson('/api/admin/content-pages/landing-hero/inline', [
            'locale' => 'en',
            'hero' => ['title' => 'New'],
        ])->assertForbidden();
    }

    public function test_landing_hero_inline_merges_hero_fields(): void
    {
        ContentPage::query()->create([
            'slug' => 'landing-page',
            'locale' => 'en',
            'published_at' => now(),
            'payload' => [
                'hero' => [
                    'title' => 'Old title',
                    'subtitle' => 'Keep me',
                    'primaryCta' => 'Primary',
                    'backgroundImage' => ['url' => 'https://old.example/x.jpg', 'alt' => 'Old alt'],
                ],
            ],
        ]);
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $user->syncPermissions(['content_pages_manage', 'inline_edit']);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $user->createToken('t')->plainTextToken;

        $res = $this->withToken($token)->patchJson('/api/admin/content-pages/landing-hero/inline', [
            'locale' => 'en',
            'hero' => [
                'title' => 'New title',
                'backgroundImage' => ['url' => 'https://new.example/y.jpg'],
            ],
        ]);
        $res->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('hero.title', 'New title')
            ->assertJsonPath('hero.subtitle', 'Keep me')
            ->assertJsonPath('hero.primaryCta', 'Primary')
            ->assertJsonPath('hero.backgroundImage.url', 'https://new.example/y.jpg')
            ->assertJsonPath('hero.backgroundImage.alt', 'Old alt');

        $page = ContentPage::query()->where('slug', 'landing-page')->where('locale', 'en')->first();
        $this->assertNotNull($page);
        $this->assertSame('New title', $page->payload['hero']['title'] ?? null);
    }

    public function test_landing_hero_inline_returns_404_when_missing_page(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $user->assignRole('super_admin');
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->patchJson('/api/admin/content-pages/landing-hero/inline', [
            'locale' => 'ar',
            'hero' => ['title' => 'X'],
        ])
            ->assertStatus(404)
            ->assertJsonPath('code', 'missing_landing_page');
    }

    public function test_landing_highlights_inline_requires_auth(): void
    {
        $this->patchJson('/api/admin/content-pages/landing-highlights/inline', [
            'locale' => 'en',
            'highlights' => [['title' => 'A', 'description' => 'B']],
        ])->assertUnauthorized();
    }

    public function test_landing_highlights_inline_replaces_slice_and_keeps_hero(): void
    {
        ContentPage::query()->create([
            'slug' => 'landing-page',
            'locale' => 'en',
            'published_at' => now(),
            'payload' => [
                'hero' => ['title' => 'H'],
                'highlights' => [
                    ['id' => 'h1', 'title' => 'Old', 'description' => 'D1'],
                    ['id' => 'h2', 'title' => 'T2', 'description' => 'D2'],
                ],
            ],
        ]);
        $user = User::factory()->create([
            'password' => Hash::make('secret'),
        ]);
        $user->syncPermissions(['content_pages_manage', 'inline_edit']);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $token = $user->createToken('t')->plainTextToken;

        $res = $this->withToken($token)->patchJson('/api/admin/content-pages/landing-highlights/inline', [
            'locale' => 'en',
            'highlights' => [
                ['id' => 'h1', 'title' => 'N1', 'description' => 'ND1'],
            ],
        ]);
        $res->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('highlights.0.title', 'N1')
            ->assertJsonPath('highlights.0.id', 'h1');

        $page = ContentPage::query()->where('slug', 'landing-page')->where('locale', 'en')->first();
        $this->assertNotNull($page);
        $this->assertCount(1, $page->payload['highlights']);
        $this->assertSame('N1', $page->payload['highlights'][0]['title']);
        $this->assertSame('H', $page->payload['hero']['title']);
    }
}
