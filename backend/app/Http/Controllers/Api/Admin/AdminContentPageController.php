<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PatchLandingHeroInlineRequest;
use App\Http\Requests\Admin\PatchLandingHighlightsInlineRequest;
use App\Http\Requests\Admin\StoreContentPageRequest;
use App\Http\Requests\Admin\UpdateContentPageRequest;
use App\Models\ContentPage;
use App\Services\ContentPageDefaultPayloads;
use App\Services\ContentPagePayloadWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContentPageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $pages = ContentPage::query()
            ->orderBy('slug')
            ->orderBy('locale')
            ->get(['id', 'slug', 'locale', 'published_at', 'updated_at']);

        return response()->json(['data' => $pages]);
    }

    public function store(
        StoreContentPageRequest $request,
        ContentPagePayloadWriter $writer,
    ): JsonResponse {
        $slug = $request->validated('slug');
        $locale = $request->validated('locale');

        $payload = $request->validatedPayload();
        $payload = $writer->finalize(
            $slug,
            $payload,
            $request->file('hero_image'),
            (string) $request->input('hero_image_alt', ''),
        );

        $page = ContentPage::query()->create([
            'slug' => $slug,
            'locale' => $locale,
            'payload' => $payload,
            'published_at' => $request->validated('published_at'),
        ]);

        return response()->json($page, 201);
    }

    public function show(ContentPage $content_page): JsonResponse
    {
        return response()->json($content_page);
    }

    public function update(
        UpdateContentPageRequest $request,
        ContentPage $content_page,
        ContentPagePayloadWriter $writer,
    ): JsonResponse {
        $payload = $request->validatedPayload();
        $payload = $writer->finalize(
            $content_page->slug,
            $payload,
            $request->file('hero_image'),
            (string) $request->input('hero_image_alt', ''),
        );

        $attributes = ['payload' => $payload];
        if ($request->has('published_at')) {
            $attributes['published_at'] = $request->validated('published_at');
        }
        $content_page->update($attributes);
        $content_page->refresh();

        return response()->json($content_page);
    }

    public function destroy(ContentPage $content_page): JsonResponse
    {
        $content_page->delete();

        return response()->json(null, 204);
    }

    /**
     * Merge whitelisted hero keys into the landing-page payload (inline editor; layout unchanged on site).
     */
    public function patchLandingHeroInline(PatchLandingHeroInlineRequest $request): JsonResponse
    {
        $locale = $request->validated('locale');
        $page = ContentPage::query()
            ->where('slug', 'landing-page')
            ->where('locale', $locale)
            ->first();

        if ($page === null) {
            return response()->json([
                'message' => 'No landing page row exists for this language. Create one in Admin → Content pages.',
                'code' => 'missing_landing_page',
            ], 404);
        }

        /** @var array<string, mixed> $payload */
        $payload = is_array($page->payload) ? $page->payload : [];
        $hero = is_array($payload['hero'] ?? null) ? $payload['hero'] : [];
        /** @var array<string, mixed> $patch */
        $patch = $request->validated('hero');

        foreach (['title', 'subtitle', 'primaryCta', 'secondaryCta', 'location', 'trustLine'] as $key) {
            if (array_key_exists($key, $patch)) {
                $hero[$key] = $patch[$key] ?? '';
            }
        }

        if (isset($patch['backgroundImage']) && is_array($patch['backgroundImage'])) {
            /** @var array<string, mixed> $currentBg */
            $currentBg = is_array($hero['backgroundImage'] ?? null) ? $hero['backgroundImage'] : [];
            /** @var array<string, mixed> $bg */
            $bg = $patch['backgroundImage'];
            if (array_key_exists('url', $bg)) {
                $currentBg['url'] = (string) ($bg['url'] ?? '');
            }
            if (array_key_exists('alt', $bg)) {
                $currentBg['alt'] = (string) ($bg['alt'] ?? '');
            }
            $hero['backgroundImage'] = $currentBg;
        }

        $payload['hero'] = $hero;
        $page->payload = $payload;
        $page->save();
        $page->refresh();

        return response()->json(['ok' => true, 'hero' => $hero]);
    }

    /**
     * Replace homepage value-card highlights on the landing-page payload (inline editor).
     *
     * @return list<array{id?: string, title: string, description: string}>
     */
    public function patchLandingHighlightsInline(PatchLandingHighlightsInlineRequest $request): JsonResponse
    {
        $locale = $request->validated('locale');
        $page = ContentPage::query()
            ->where('slug', 'landing-page')
            ->where('locale', $locale)
            ->first();

        if ($page === null) {
            return response()->json([
                'message' => 'No landing page row exists for this language. Create one in Admin → Content pages.',
                'code' => 'missing_landing_page',
            ], 404);
        }

        /** @var array<string, mixed> $payload */
        $payload = is_array($page->payload) ? $page->payload : [];
        /** @var list<array{id?: string, title: string, description: string}> $incoming */
        $incoming = $request->validated('highlights');

        $normalized = [];
        foreach ($incoming as $row) {
            $item = [
                'title' => (string) $row['title'],
                'description' => (string) $row['description'],
            ];
            if (! empty($row['id'])) {
                $item['id'] = (string) $row['id'];
            }
            $normalized[] = $item;
        }

        $payload['highlights'] = $normalized;
        $page->payload = $payload;
        $page->save();
        $page->refresh();

        return response()->json(['ok' => true, 'highlights' => $normalized]);
    }

    /**
     * Replace payload with the canonical seeded defaults for this slug/locale (db seeder source).
     */
    public function resetToSeededDefaults(
        ContentPage $content_page,
        ContentPagePayloadWriter $writer,
    ): JsonResponse {
        if (! in_array($content_page->slug, ContentPage::allowedSlugs(), true)) {
            return response()->json(['message' => 'Unsupported content slug.'], 422);
        }

        if (! in_array($content_page->locale, ['en', 'ar'], true)) {
            return response()->json(['message' => 'Unsupported locale.'], 422);
        }

        $payload = ContentPageDefaultPayloads::for($content_page->slug, $content_page->locale);
        if ($payload === []) {
            return response()->json(['message' => 'No default payload for this row.'], 422);
        }

        $payload = $writer->finalize($content_page->slug, $payload, null, '');
        $content_page->payload = $payload;
        $content_page->save();
        $content_page->refresh();

        return response()->json($content_page);
    }
}
