<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRegistrationRequest;
use App\Models\RegistrationSubmission;
use Illuminate\Http\JsonResponse;

class RegistrationController extends Controller
{
    public function store(StoreRegistrationRequest $request): JsonResponse
    {
        $row = RegistrationSubmission::query()->create($request->validated());

        return response()->json([
            'id' => $row->id,
            'message' => 'تم استلام الطلب بنجاح.',
        ], 201);
    }
}
