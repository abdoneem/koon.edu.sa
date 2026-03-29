<?php

namespace App\Http\Requests\Admin;

use App\Models\ContentPage;
use Illuminate\Validation\Rule;

class StoreContentPageRequest extends ContentPageFormRequest
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
            'slug' => [
                'required',
                'string',
                Rule::in(ContentPage::allowedSlugs()),
                Rule::unique('content_pages', 'slug')->where(fn ($q) => $q->where('locale', (string) $this->input('locale'))),
            ],
            'locale' => ['required', 'string', Rule::in(['en', 'ar'])],
            'published_at' => ['nullable', 'date'],
            'payload' => ['required', 'array'],
            'hero_image' => ['nullable', 'file', 'image', 'max:5120'],
            'hero_image_alt' => ['nullable', 'string', 'max:500'],
        ];
    }
}
