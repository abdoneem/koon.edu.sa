<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookTourRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'preferred_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'الاسم',
            'phone' => 'الجوال',
            'email' => 'البريد',
            'preferred_date' => 'التاريخ المفضل',
            'notes' => 'ملاحظات',
        ];
    }
}
