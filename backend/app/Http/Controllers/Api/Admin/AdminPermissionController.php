<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminPermissionRequest;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class AdminPermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = Permission::query()
            ->where('guard_name', 'sanctum')
            ->orderBy('name')
            ->get()
            ->map(fn (Permission $p) => [
                'id' => $p->id,
                'name' => $p->name,
            ]);

        return response()->json(['data' => $rows]);
    }

    public function store(StoreAdminPermissionRequest $request): JsonResponse
    {
        $permission = Permission::query()->create([
            'name' => $request->validated()['name'],
            'guard_name' => 'sanctum',
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return response()->json([
            'id' => $permission->id,
            'name' => $permission->name,
        ], 201);
    }

    public function destroy(Permission $permission): JsonResponse
    {
        if ($permission->guard_name !== 'sanctum') {
            abort(404);
        }

        if ($permission->roles()->exists()) {
            return response()->json([
                'message' => 'This permission is assigned to one or more roles. Remove it from all roles first.',
            ], 422);
        }

        $permission->delete();
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return response()->json(null, 204);
    }
}
