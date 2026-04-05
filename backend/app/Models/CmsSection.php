<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsSection extends Model
{
    protected $fillable = [
        'cms_page_id',
        'type',
        'title',
        'subtitle',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(CmsPage::class, 'cms_page_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CmsSectionItem::class, 'cms_section_id')->orderBy('sort_order');
    }
}
