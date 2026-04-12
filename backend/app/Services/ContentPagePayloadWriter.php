<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class ContentPagePayloadWriter
{
    public function __construct(
        private readonly CmsImageOptimizer $imageOptimizer,
    ) {}

    /**
     * Merge optional hero upload, then validate payload shape for slug.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function finalize(string $slug, array $payload, ?UploadedFile $heroImage, string $heroImageAlt): array
    {
        if ($slug === 'landing-page' && $heroImage !== null && $heroImage->isValid()) {
            $url = null;
            try {
                if (CmsImageOptimizer::isSupported()) {
                    $out = $this->imageOptimizer->storeOptimized($heroImage, 'public', 'content/hero');
                    $url = $out['url'];
                }
            } catch (Throwable $e) {
                Log::warning('landing_hero_optimize_failed', [
                    'message' => $e->getMessage(),
                ]);
            }
            if ($url === null) {
                $path = $heroImage->store('content/hero', 'public');
                $url = Storage::disk('public')->url($path);
            }
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
