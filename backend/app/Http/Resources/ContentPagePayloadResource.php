<?php

namespace App\Http\Resources;

use App\Models\ContentPage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ContentPage */
class ContentPagePayloadResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return is_array($this->payload) ? $this->payload : [];
    }
}
