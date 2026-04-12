<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookTourRequest;
use App\Models\BookTourRequest;
use Illuminate\Http\JsonResponse;

class BookTourController extends Controller
{
    public function store(StoreBookTourRequest $request): JsonResponse
    {
        $data = $request->validated();
        $row = BookTourRequest::query()->create($data);

        return response()->json([
            'id' => $row->id,
            'message' => 'تم استلام طلب الجولة بنجاح.',
        ], 201);
    }
}
