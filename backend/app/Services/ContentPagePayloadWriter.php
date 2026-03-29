<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ContentPagePayloadWriter
{
    /**
     * Merge optional hero upload, then validate payload shape for slug.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function finalize(string $slug, array $payload, ?UploadedFile $heroImage, string $heroImageAlt): array
    {
        if ($slug === 'landing-page' && $heroImage !== null && $heroImage->isValid()) {
            $path = $heroImage->store('content/hero', 'public');
            $url = Storage::disk('public')->url($path);
            $payload['hero'] ??= [];
            $existingAlt = $payload['hero']['backgroundImage']['alt'] ?? '';
            $payload['hero']['backgroundImage'] = [
                'url' => $url,
                'alt' => $heroImageAlt !== '' ? $heroImageAlt : $existingAlt,
            ];
        }

        try {
            app(ContentPayloadValidator::class)->validate($slug, $payload);
        } catch (ValidationException $e) {
            throw $e;
        }

        return $payload;
    }
}
