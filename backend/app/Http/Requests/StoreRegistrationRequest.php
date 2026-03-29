<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRegistrationRequest extends FormRequest
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
            'father_full_name' => ['required', 'string', 'max:255'],
            'father_national_id' => ['required', 'string', 'max:32'],
            'student_full_name' => ['required', 'string', 'max:255'],
            'student_national_id' => ['required', 'string', 'max:32'],
            'parent_mobile' => ['required', 'string', 'max:32'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'grade_level' => [
                'required',
                'string',
                'max:64',
                Rule::exists('registration_grades', 'code')->where('is_active', true),
            ],
            'nationality' => [
                'required',
                'string',
                'max:64',
                Rule::exists('registration_nationalities', 'code')->where('is_active', true),
            ],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'father_full_name' => 'اسم الاب الرباعي',
            'father_national_id' => 'رقم الهوية الاب',
            'student_full_name' => 'اسم الطالب الرباعي',
            'student_national_id' => 'رقم هوية الطالب',
            'parent_mobile' => 'رقم جوال الاب/ الام',
            'gender' => 'الجنس',
            'grade_level' => 'الصف الدراسي',
            'nationality' => 'الجنسية',
            'notes' => 'ملاحظات',
        ];
    }
}
