<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'internal_notes',
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
