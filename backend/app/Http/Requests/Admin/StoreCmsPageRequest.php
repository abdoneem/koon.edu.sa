<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCmsPageRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:500'],
            'slug' => [
                'required',
                'string',
                'max:128',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('cms_pages')->where(fn ($q) => $q->where('locale', $this->input('locale'))),
            ],
            'locale' => ['required', 'string', Rule::in(['en', 'ar'])],
            'meta_title' => ['nullable', 'string', 'max:500'],
            'meta_description' => ['nullable', 'string', 'max:20000'],
            'is_active' => ['sometimes', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
