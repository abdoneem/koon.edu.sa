<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCmsSectionItemRequest;
use App\Http\Requests\Admin\UpdateCmsSectionItemRequest;
use App\Models\CmsSection;
use App\Models\CmsSectionItem;
use Illuminate\Http\JsonResponse;

class AdminCmsSectionItemController extends Controller
{
    public function store(StoreCmsSectionItemRequest $request, CmsSection $cms_section): JsonResponse
    {
        $item = $cms_section->items()->create($request->validated());

        return response()->json($item, 201);
    }

    public function update(UpdateCmsSectionItemRequest $request, CmsSectionItem $cms_section_item): JsonResponse
    {
        $cms_section_item->update($request->validated());
        $cms_section_item->refresh();

        return response()->json($cms_section_item);
    }

    public function destroy(CmsSectionItem $cms_section_item): JsonResponse
    {
        $cms_section_item->delete();

        return response()->json(null, 204);
    }
}
