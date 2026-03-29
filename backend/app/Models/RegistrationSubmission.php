<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationSubmission extends Model
{
    protected $fillable = [
        'father_full_name',
        'father_national_id',
        'student_full_name',
        'student_national_id',
        'parent_mobile',
        'gender',
        'grade_level',
        'nationality',
        'notes',
        'status',
        'staff_reply',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'replied_at' => 'datetime',
        ];
    }
}
