<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookTourSubmissionRequest;
use App\Models\BookTourRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookTourRequestController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => BookTourRequest::query()->count(),
            'pending' => BookTourRequest::query()->where('status', 'pending')->count(),
            'replied' => BookTourRequest::query()->where('status', 'replied')->count(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 25), 5), 100);
        $query = $this->listQuery($request);

        return response()->json($query->paginate($perPage));
    }

    public function show(int $id): JsonResponse
    {
        $row = BookTourRequest::query()->findOrFail($id);

        return response()->json($row);
    }

    public function update(UpdateBookTourSubmissionRequest $request, int $id): JsonResponse
    {
        $booking = BookTourRequest::query()->findOrFail($id);
        $data = $request->validated();

        if (array_key_exists('staff_reply', $data) && filled($data['staff_reply'])) {
            $booking->replied_at = now();
        }

        $booking->fill($data);
        $booking->save();
        $booking->refresh();

        return response()->json($booking);
    }

    private function listQuery(Request $request): Builder
    {
        /** @var 'asc'|'desc' $direction */
        $direction = strtolower((string) $request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $sort = (string) $request->query('sort', 'created_at');
        $allowedSort = ['created_at', 'id', 'name', 'status', 'phone'];
        if (! in_array($sort, $allowedSort, true)) {
            $sort = 'created_at';
        }

        $q = BookTourRequest::query();

        if ($request->filled('status')) {
            $q->where('status', (string) $request->query('status'));
        }

        if ($request->filled('search')) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $request->query('search')).'%';
            $q->where(function (Builder $b) use ($term) {
                $b->where('name', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        return $q->orderBy($sort, $direction);
    }
}
