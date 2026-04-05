<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsPage extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'locale',
        'meta_title',
        'meta_description',
        'is_active',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(CmsSection::class, 'cms_page_id')->orderBy('sort_order');
    }

    public function activeSections(): HasMany
    {
        return $this->sections()->where('is_active', true);
    }

    public function scopePublished($query)
    {
        return $query
            ->where('is_active', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }
}
