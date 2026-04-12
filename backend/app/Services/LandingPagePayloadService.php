<?php

namespace App\Services;

use App\Models\ContentPage;

class LandingPagePayloadService
{
    public function pageForLocale(string $locale): ?ContentPage
    {
        return ContentPage::query()
            ->where('slug', 'landing-page')
            ->where('locale', $locale)
            ->first();
    }

    /**
     * @return array{message: string, code: string}
     */
    public function missingResponse(): array
    {
        return [
            'message' => 'No landing page row exists for this language. Create one in Admin → Content pages.',
            'code' => 'missing_landing_page',
        ];
    }

    /** @return array<string, mixed> */
    public function payloadArray(ContentPage $page): array
    {
        $p = $page->payload;

        return is_array($p) ? $p : [];
    }

    /** @param array<string, mixed> $payload */
    public function savePayload(ContentPage $page, array $payload): void
    {
        $page->payload = $payload;
        $page->save();
        $page->refresh();
    }
}
