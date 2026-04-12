<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncRolePermissionsRequest extends FormRequest
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
        return [
            'permissions' => ['required', 'array'],
            'permissions.*' => [
                'string',
                Rule::exists('permissions', 'name')->where(fn ($q) => $q->where('guard_name', 'sanctum')),
            ],
        ];
    }
}
