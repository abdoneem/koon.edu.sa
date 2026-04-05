<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsSetting;
use Illuminate\Http\JsonResponse;

class CmsSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $map = CmsSetting::query()
            ->orderBy('key')
            ->pluck('value', 'key')
            ->all();

        return response()->json([
            'settings' => $map,
        ]);
    }
}
