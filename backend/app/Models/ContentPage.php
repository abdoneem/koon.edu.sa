<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentPage extends Model
{
    protected $fillable = [
        'slug',
        'locale',
        'payload',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function scopePublished($query)
    {
        return $query
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public static function allowedSlugs(): array
    {
        return [
            'landing-page',
            'about-page',
            'admissions-page',
            'contact-page',
        ];
    }
}
