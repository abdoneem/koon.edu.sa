<?php

namespace App\Http\Requests\Admin;

class UpdateContentPageRequest extends ContentPageFormRequest
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
            'published_at' => ['sometimes', 'nullable', 'date'],
            'payload' => ['required', 'array'],
            'hero_image' => ['nullable', 'file', 'image', 'max:5120'],
            'hero_image_alt' => ['nullable', 'string', 'max:500'],
        ];
    }
}
