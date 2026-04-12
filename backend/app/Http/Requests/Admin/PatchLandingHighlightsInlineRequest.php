<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PatchLandingHighlightsInlineRequest extends FormRequest
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
            'highlights' => ['required', 'array', 'min:1', 'max:12'],
            'highlights.*.id' => ['nullable', 'string', 'max:64'],
            'highlights.*.title' => ['required', 'string', 'max:500'],
            'highlights.*.description' => ['required', 'string', 'max:2000'],
        ];
    }
}
