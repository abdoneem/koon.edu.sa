<?php

namespace App\Http\Requests\Admin;

use App\Models\CmsPage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCmsPageRequest extends FormRequest
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
        /** @var CmsPage|null $page */
        $page = $this->route('cms_page');

        return [
            'title' => ['sometimes', 'string', 'max:500'],
            'slug' => [
                'sometimes',
                'string',
                'max:128',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('cms_pages')
                    ->where(fn ($q) => $q->where('locale', $this->input('locale', $page?->locale ?? '')))
                    ->ignore($page?->id ?? 0),
            ],
            'locale' => ['sometimes', 'string', Rule::in(['en', 'ar'])],
            'meta_title' => ['sometimes', 'nullable', 'string', 'max:500'],
            'meta_description' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'is_active' => ['sometimes', 'boolean'],
            'published_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
