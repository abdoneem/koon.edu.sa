<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookTourRequest extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'preferred_date',
        'notes',
        'internal_notes',
        'status',
        'staff_reply',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'replied_at' => 'datetime',
        ];
    }
}
