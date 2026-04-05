<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRegistrationSubmissionRequest extends FormRequest
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
            'status' => [
                'sometimes',
                'string',
                Rule::in(['pending', 'reviewed', 'replied', 'new', 'contacted', 'closed']),
            ],
            'staff_reply' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'internal_notes' => ['sometimes', 'nullable', 'string', 'max:20000'],
        ];
    }
}
