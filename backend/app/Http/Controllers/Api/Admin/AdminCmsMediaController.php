<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\CmsImageOptimizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class AdminCmsMediaController extends Controller
{
    /**
     * Store an image in the public disk for CMS sections (returns URL path for item.image).
     * Large uploads are scaled down and re-encoded (WebP or JPEG) to reduce page weight.
     */
    public function store(Request $request, CmsImageOptimizer $optimizer): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $upload = $request->file('file');
        if (! $upload) {
            return response()->json(['message' => 'No file uploaded.'], 422);
        }

        try {
            if (CmsImageOptimizer::isSupported()) {
                $out = $optimizer->storeOptimized($upload, 'public', 'cms');

                return response()->json(['url' => $out['url']], 201);
            }
        } catch (Throwable $e) {
            Log::warning('cms_media_optimize_failed', [
                'message' => $e->getMessage(),
            ]);
        }

        $path = $upload->store('cms', 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json(['url' => $url], 201);
    }
}
