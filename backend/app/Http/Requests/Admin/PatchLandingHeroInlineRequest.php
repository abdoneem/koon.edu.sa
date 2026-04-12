<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PatchLandingHeroInlineRequest extends FormRequest
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
            'locale' => ['required', 'string', 'in:en,ar'],
            'hero' => ['required', 'array'],
            'hero.title' => ['sometimes', 'nullable', 'string', 'max:500'],
            'hero.subtitle' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'hero.primaryCta' => ['sometimes', 'nullable', 'string', 'max:200'],
            'hero.secondaryCta' => ['sometimes', 'nullable', 'string', 'max:200'],
            'hero.location' => ['sometimes', 'nullable', 'string', 'max:500'],
            'hero.trustLine' => ['sometimes', 'nullable', 'string', 'max:500'],
            'hero.backgroundImage' => ['sometimes', 'nullable', 'array'],
            'hero.backgroundImage.url' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'hero.backgroundImage.alt' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}
