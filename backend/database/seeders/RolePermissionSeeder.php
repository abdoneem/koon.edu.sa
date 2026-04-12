<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /** Permission names (guard `sanctum` — matches API tokens and `User::$guard_name`). */
    public const PERMISSIONS = [
        'dashboard_view',
        'registrations_view',
        'registrations_update',
        'registrations_export',
        'book_tour_view',
        'book_tour_update',
        'contact_messages_view',
        'contact_messages_update',
        'content_pages_manage',
        'cms_manage',
        'cms_settings_manage',
        'media_manage',
        'inline_edit',
        'posts_manage',
        'users_manage',
    ];

    /**
     * Insert any permission names from PERMISSIONS that are not yet in the database.
     * Safe to run on production when new keys are added to PERMISSIONS.
     */
    public function registerAllPermissions(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $name) {
            Permission::query()->firstOrCreate(
                ['name' => $name, 'guard_name' => 'sanctum'],
            );
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    /** Assign canonical permission sets to built-in roles. */
    public function syncRoles(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $make = static function (string $roleName, array $permissionNames): void {
            $role = Role::query()->firstOrCreate(
                ['name' => $roleName, 'guard_name' => 'sanctum'],
            );
            $perms = Permission::query()
                ->where('guard_name', 'sanctum')
                ->whereIn('name', $permissionNames)
                ->get();
            $role->syncPermissions($perms);
        };

        $make('super_admin', self::PERMISSIONS);

        $make('admin', self::PERMISSIONS);

        $make('editor', [
            'dashboard_view',
            'content_pages_manage',
            'cms_manage',
            'cms_settings_manage',
            'media_manage',
            'inline_edit',
            'posts_manage',
        ]);

        $make('content_manager', [
            'dashboard_view',
            'content_pages_manage',
            'cms_manage',
            'cms_settings_manage',
            'media_manage',
            'inline_edit',
            'posts_manage',
        ]);

        $make('admissions_staff', [
            'dashboard_view',
            'registrations_view',
            'registrations_update',
            'registrations_export',
            'book_tour_view',
            'book_tour_update',
            'contact_messages_view',
            'contact_messages_update',
        ]);

        $make('viewer', [
            'dashboard_view',
            'registrations_view',
            'book_tour_view',
            'contact_messages_view',
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function run(): void
    {
        $this->registerAllPermissions();
        $this->syncRoles();
    }
}
