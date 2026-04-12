<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdminPermissionRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:64',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('permissions', 'name')->where(fn ($q) => $q->where('guard_name', 'sanctum')),
            ],
        ];
    }
}
