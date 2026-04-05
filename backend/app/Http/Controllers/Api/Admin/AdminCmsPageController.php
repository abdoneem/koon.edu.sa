<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCmsPageRequest;
use App\Http\Requests\Admin\UpdateCmsPageRequest;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCmsPageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $pages = CmsPage::query()
            ->orderBy('slug')
            ->orderBy('locale')
            ->get(['id', 'title', 'slug', 'locale', 'is_active', 'published_at', 'updated_at']);

        return response()->json(['data' => $pages]);
    }

    public function store(StoreCmsPageRequest $request): JsonResponse
    {
        $page = CmsPage::query()->create($request->validated());

        return response()->json($page->load(['sections.items']), 201);
    }

    public function show(CmsPage $cms_page): JsonResponse
    {
        return response()->json($cms_page->load(['sections.items']));
    }

    public function update(UpdateCmsPageRequest $request, CmsPage $cms_page): JsonResponse
    {
        $cms_page->update($request->validated());

        return response()->json($cms_page->fresh()->load(['sections.items']));
    }

    public function destroy(CmsPage $cms_page): JsonResponse
    {
        $cms_page->delete();

        return response()->json(null, 204);
    }
}
