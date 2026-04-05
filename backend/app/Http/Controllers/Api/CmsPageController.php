<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsPageController extends Controller
{
    public function show(Request $request, string $slug): JsonResponse
    {
        $locale = (string) $request->query('locale', 'en');
        if (! in_array($locale, ['en', 'ar'], true)) {
            return response()->json(['message' => 'Invalid locale. Use en or ar.'], 400);
        }

        $page = CmsPage::query()
            ->where('slug', $slug)
            ->where('locale', $locale)
            ->published()
            ->with(['sections' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }, 'sections.items' => function ($q) {
                $q->orderBy('sort_order');
            }])
            ->first();

        if (! $page) {
            return response()->json([
                'fallback' => true,
                'page' => null,
                'sections' => [],
            ]);
        }

        return response()->json([
            'fallback' => false,
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'locale' => $page->locale,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
            ],
            'sections' => $page->sections->map(fn ($s) => [
                'id' => $s->id,
                'type' => $s->type,
                'title' => $s->title,
                'subtitle' => $s->subtitle,
                'order' => $s->sort_order,
                'is_active' => $s->is_active,
                'items' => $s->items->map(fn ($i) => [
                    'id' => $i->id,
                    'title' => $i->title,
                    'description' => $i->description,
                    'image' => $i->image,
                    'icon' => $i->icon,
                    'link' => $i->link,
                    'order' => $i->sort_order,
                ]),
            ]),
        ]);
    }
}
