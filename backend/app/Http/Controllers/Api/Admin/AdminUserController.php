<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminUserRequest;
use App\Http\Requests\Admin\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => $this->formatUser($u));

        return response()->json(['data' => $users]);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($this->formatUser($user));
    }

    public function store(StoreAdminUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $user->refresh();

        return response()->json($this->formatUser($user), 201);
    }

    public function update(UpdateAdminUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $data = [];
        if (array_key_exists('name', $validated)) {
            $data['name'] = $validated['name'];
        }
        if (array_key_exists('email', $validated)) {
            $data['email'] = $validated['email'];
        }
        if (! empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }

        if ($data !== []) {
            $user->update($data);
        }

        if (array_key_exists('roles', $validated)) {
            $previousRoles = $user->roles->pluck('name')->all();
            $user->syncRoles($validated['roles']);
            app()[PermissionRegistrar::class]->forgetCachedPermissions();
            $user->refresh();

            if ($user->id === $request->user()->id && ! $user->hasPermissionTo('users_manage')) {
                $user->syncRoles($previousRoles);
                app()[PermissionRegistrar::class]->forgetCachedPermissions();

                return response()->json([
                    'message' => 'You cannot remove your own access to user management.',
                    'code' => 'cannot_remove_own_users_manage',
                ], 422);
            }

            if (User::query()->permission('users_manage')->count() === 0) {
                $user->syncRoles($previousRoles);
                app()[PermissionRegistrar::class]->forgetCachedPermissions();

                return response()->json([
                    'message' => 'At least one user must retain user management access.',
                    'code' => 'users_manage_required',
                ], 422);
            }
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $user->refresh();

        return response()->json($this->formatUser($user));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
                'code' => 'cannot_delete_own_account',
            ], 422);
        }

        $user->delete();

        return response()->json(null, 204);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $u): array
    {
        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'roles' => $u->getRoleNames()->values()->all(),
            'permissions' => $u->getAllPermissions()->pluck('name')->values()->all(),
        ];
    }
}
