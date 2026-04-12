<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Creates permission rows missing from the database (from RolePermissionSeeder::PERMISSIONS)
 * and syncs super_admin + admin to the full list.
 *
 * Use after adding new permission names: php artisan db:seed --class=EnsureMissingPermissionsSeeder
 *
 * To realign editor, content_manager, admissions_staff, and viewer as well, run:
 * php artisan db:seed --class=RolePermissionSeeder
 */
class EnsureMissingPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        (new RolePermissionSeeder)->registerAllPermissions();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permModels = Permission::query()
            ->where('guard_name', 'sanctum')
            ->whereIn('name', RolePermissionSeeder::PERMISSIONS)
            ->get();

        foreach (['super_admin', 'admin'] as $roleName) {
            $role = Role::query()
                ->where('name', $roleName)
                ->where('guard_name', 'sanctum')
                ->first();
            if ($role !== null) {
                $role->syncPermissions($permModels);
            }
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
