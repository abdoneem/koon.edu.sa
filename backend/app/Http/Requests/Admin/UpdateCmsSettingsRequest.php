<?php

namespace App\Http\Requests\Admin;

use App\Rules\ValidSiteNavTree;
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
            'nav_tree_en' => ['sometimes', 'nullable', new ValidSiteNavTree],
            'nav_tree_ar' => ['sometimes', 'nullable', new ValidSiteNavTree],
        ];
    }
}
