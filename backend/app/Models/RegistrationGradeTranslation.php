<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationGradeTranslation extends Model
{
    protected $fillable = [
        'registration_grade_id',
        'locale',
        'name',
    ];

    public function grade(): BelongsTo
    {
        return $this->belongsTo(RegistrationGrade::class, 'registration_grade_id');
    }
}
