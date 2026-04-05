<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCmsSettingsRequest extends FormRequest
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
            'phone' => ['sometimes', 'nullable', 'string', 'max:500'],
            'email' => ['sometimes', 'nullable', 'string', 'max:500'],
            'whatsapp' => ['sometimes', 'nullable', 'string', 'max:500'],
            'logo' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
