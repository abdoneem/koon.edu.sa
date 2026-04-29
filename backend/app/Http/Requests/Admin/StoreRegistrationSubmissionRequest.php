<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRegistrationSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Admin-created registrations: only parent name + mobile are required.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'father_full_name' => ['required', 'string', 'max:255'],
            'parent_mobile' => ['required', 'string', 'max:32'],

            'father_national_id' => ['sometimes', 'nullable', 'string', 'max:32'],
            'student_full_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'student_national_id' => ['sometimes', 'nullable', 'string', 'max:32'],
            'gender' => ['sometimes', 'nullable', 'string', Rule::in(['male', 'female'])],
            'grade_level' => [
                'sometimes',
                'nullable',
                'string',
                'max:64',
                Rule::exists('registration_grades', 'code')->where('is_active', true),
            ],
            'nationality' => [
                'sometimes',
                'nullable',
                'string',
                'max:64',
                Rule::exists('registration_nationalities', 'code')->where('is_active', true),
            ],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'internal_notes' => ['sometimes', 'nullable', 'string', 'max:20000'],
        ];
    }
}

