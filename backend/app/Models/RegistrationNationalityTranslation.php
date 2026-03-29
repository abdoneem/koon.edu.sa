<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationNationalityTranslation extends Model
{
    protected $fillable = [
        'registration_nationality_id',
        'locale',
        'name',
    ];

    public function nationality(): BelongsTo
    {
        return $this->belongsTo(RegistrationNationality::class, 'registration_nationality_id');
    }
}
