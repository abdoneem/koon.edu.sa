<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreContentPageRequest;
use App\Http\Requests\Admin\UpdateContentPageRequest;
use App\Models\ContentPage;
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

        return response()->json($content_page->fresh());
    }

    public function destroy(ContentPage $content_page): JsonResponse
    {
        $content_page->delete();

        return response()->json(null, 204);
    }
}
