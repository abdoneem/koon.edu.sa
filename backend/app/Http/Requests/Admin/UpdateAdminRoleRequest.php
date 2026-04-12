<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UpdateAdminRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Role $role */
        $role = $this->route('role');

        return [
            'name' => [
                'sometimes',
                'string',
                'max:64',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('roles', 'name')
                    ->where(fn ($q) => $q->where('guard_name', 'sanctum'))
                    ->ignore($role->id),
            ],
        ];
    }
}
