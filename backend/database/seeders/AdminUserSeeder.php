<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminUserSeeder extends Seeder
{
    /**
     * Ensures canonical admin + optional ADMIN_EMAIL / DEFAULT_ADMIN_EMAIL get super_admin.
     *
     * Password rules:
     * - If DEFAULT_ADMIN_PASSWORD is set (non-empty), every listed admin user's password is
     *   reset to that value (use for production recovery; keep .env off git).
     * - Otherwise, new users get ADMIN_PASSWORD; existing users keep their current hash.
     *
     * After seeding, log out of the admin SPA once and sign in again so the client reloads permissions.
     */
    public function run(): void
    {
        // Ensure new permission names exist even when super_admin role was created earlier.
        (new RolePermissionSeeder)->registerAllPermissions();

        if (! Role::query()->where('name', 'super_admin')->where('guard_name', 'sanctum')->exists()) {
            $this->call(RolePermissionSeeder::class);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $name = env('ADMIN_NAME', env('DEFAULT_ADMIN_NAME', 'KOON Admin'));
        $emails = array_values(array_unique(array_filter([
            'admin@koon.edu.sa',
            env('DEFAULT_ADMIN_EMAIL'),
            env('ADMIN_EMAIL'),
        ])));

        // Plain .env values: $ is interpreted as variable refs — use DEFAULT_ADMIN_PASSWORD_BASE64
        // (UTF-8 password, base64-encoded, single line) for complex passwords on production.
        $b64 = trim((string) env('DEFAULT_ADMIN_PASSWORD_BASE64', ''));
        if ($b64 !== '') {
            $decoded = base64_decode($b64, true);
            $passwordWhenDefault = $decoded !== false ? $decoded : '';
        } else {
            $passwordWhenDefault = (string) env('DEFAULT_ADMIN_PASSWORD', '');
        }
        $forceDefaultPassword = $passwordWhenDefault !== '';
        $passwordForNew = (string) env('ADMIN_PASSWORD', '123');

        foreach ($emails as $email) {
            $user = User::query()->firstOrNew(['email' => $email]);
            $user->name = $name;
            if (! $user->exists) {
                $user->password = Hash::make($forceDefaultPassword ? $passwordWhenDefault : $passwordForNew);
            } elseif ($forceDefaultPassword) {
                $user->password = Hash::make($passwordWhenDefault);
            }
            $user->save();

            $user->syncRoles(['super_admin']);

            // Direct sync so the user always has every permission even if role pivot was stale.
            $user->syncPermissions(Permission::query()->where('guard_name', 'sanctum')->get());
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
