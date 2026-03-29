<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContentPagePayloadResource;
use App\Models\ContentPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function show(Request $request, string $slug): JsonResponse
    {
        if (! in_array($slug, ContentPage::allowedSlugs(), true)) {
            abort(404);
        }

        $locale = (string) $request->query('locale', 'en');
        if (! in_array($locale, ['en', 'ar'], true)) {
            return response()->json(['message' => 'Invalid locale. Use en or ar.'], 400);
        }

        $page = ContentPage::query()
            ->where('slug', $slug)
            ->where('locale', $locale)
            ->published()
            ->first();

        if (! $page) {
            abort(404);
        }

        return ContentPagePayloadResource::make($page)->response();
    }
}
