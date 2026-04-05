<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsSectionItem extends Model
{
    protected $fillable = [
        'cms_section_id',
        'title',
        'description',
        'image',
        'icon',
        'link',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(CmsSection::class, 'cms_section_id');
    }
}
