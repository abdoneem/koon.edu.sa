<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCmsSettingsRequest;
use App\Models\CmsSetting;
use Illuminate\Http\JsonResponse;

class AdminCmsSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $map = CmsSetting::query()
            ->orderBy('key')
            ->pluck('value', 'key')
            ->all();

        return response()->json(['settings' => $map]);
    }

    public function update(UpdateCmsSettingsRequest $request): JsonResponse
    {
        foreach ($request->validated() as $key => $value) {
            CmsSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }

        return $this->show();
    }
}
