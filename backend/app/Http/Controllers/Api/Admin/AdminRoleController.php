<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Admin\StoreAdminRoleRequest;
use App\Http\Requests\Admin\SyncRolePermissionsRequest;
use App\Http\Requests\Admin\UpdateAdminRoleRequest;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminRoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->where('guard_name', 'sanctum')
            ->orderBy('name')
            ->with('permissions')
            ->withCount('users')
            ->get()
            ->map(fn (Role $r) => $this->formatRole($r));

        return response()->json(['data' => $roles]);
    }

    public function show(Role $role): JsonResponse
    {
        $this->assertSanctumRole($role);
        $role->load('permissions')->loadCount('users');

        return response()->json($this->formatRole($role));
    }

    public function store(StoreAdminRoleRequest $request): JsonResponse
    {
        $role = Role::query()->create([
            'name' => $request->validated()['name'],
            'guard_name' => 'sanctum',
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $role->load('permissions')->loadCount('users');

        return response()->json($this->formatRole($role), 201);
    }

    public function update(UpdateAdminRoleRequest $request, Role $role): JsonResponse
    {
        $this->assertSanctumRole($role);

        $validated = $request->validated();
        if (isset($validated['name'])) {
            $role->name = $validated['name'];
            $role->save();
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $role->refresh();
        $role->load('permissions')->loadCount('users');

        return response()->json($this->formatRole($role));
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->assertSanctumRole($role);

        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a role that is still assigned to users.',
            ], 422);
        }

        $role->delete();
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return response()->json(null, 204);
    }

    public function syncPermissions(SyncRolePermissionsRequest $request, Role $role): JsonResponse
    {
        $this->assertSanctumRole($role);

        $role->load('permissions');
        $previousNames = $role->permissions->pluck('name')->values()->all();

        $names = $request->validated()['permissions'];
        $permissions = Permission::query()
            ->where('guard_name', 'sanctum')
            ->whereIn('name', $names)
            ->get();

        $role->syncPermissions($permissions);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        if (User::query()->permission('users_manage')->count() === 0) {
            $rollback = Permission::query()
                ->where('guard_name', 'sanctum')
                ->whereIn('name', $previousNames)
                ->get();
            $role->syncPermissions($rollback);
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'message' => 'At least one user must retain user management access.',
                'code' => 'users_manage_required',
            ], 422);
        }

        $role->refresh();
        $role->load('permissions')->loadCount('users');

        return response()->json($this->formatRole($role));
    }

    /**
     * @return array<string, mixed>
     */
    private function formatRole(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name')->values()->all(),
            'users_count' => (int) ($role->users_count ?? $role->users()->count()),
        ];
    }

    private function assertSanctumRole(Role $role): void
    {
        if ($role->guard_name !== 'sanctum') {
            abort(404);
        }
    }
}
