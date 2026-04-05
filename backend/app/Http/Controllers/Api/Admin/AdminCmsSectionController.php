<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCmsSectionRequest;
use App\Http\Requests\Admin\UpdateCmsSectionRequest;
use App\Models\CmsPage;
use App\Models\CmsSection;
use Illuminate\Http\JsonResponse;

class AdminCmsSectionController extends Controller
{
    public function store(StoreCmsSectionRequest $request, CmsPage $cms_page): JsonResponse
    {
        $section = $cms_page->sections()->create($request->validated());

        return response()->json($section->load('items'), 201);
    }

    public function update(UpdateCmsSectionRequest $request, CmsSection $cms_section): JsonResponse
    {
        $cms_section->update($request->validated());

        return response()->json($cms_section->fresh()->load('items'));
    }

    public function destroy(CmsSection $cms_section): JsonResponse
    {
        $cms_section->delete();

        return response()->json(null, 204);
    }
}
