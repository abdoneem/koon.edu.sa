<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateContactMessageSubmissionRequest;
use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactMessageController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => ContactMessage::query()->count(),
            'pending' => ContactMessage::query()->where('status', 'pending')->count(),
            'replied' => ContactMessage::query()->where('status', 'replied')->count(),
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
        $row = ContactMessage::query()->findOrFail($id);

        return response()->json($row);
    }

    public function update(UpdateContactMessageSubmissionRequest $request, int $id): JsonResponse
    {
        $row = ContactMessage::query()->findOrFail($id);
        $data = $request->validated();

        if (array_key_exists('staff_reply', $data) && filled($data['staff_reply'])) {
            $row->replied_at = now();
        }

        $row->fill($data);
        $row->save();
        $row->refresh();

        return response()->json($row);
    }

    private function listQuery(Request $request): Builder
    {
        /** @var 'asc'|'desc' $direction */
        $direction = strtolower((string) $request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $sort = (string) $request->query('sort', 'created_at');
        $allowedSort = ['created_at', 'id', 'name', 'email', 'status', 'subject'];
        if (! in_array($sort, $allowedSort, true)) {
            $sort = 'created_at';
        }

        $q = ContactMessage::query();

        if ($request->filled('status')) {
            $q->where('status', (string) $request->query('status'));
        }

        if ($request->filled('search')) {
            $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $request->query('search')).'%';
            $q->where(function (Builder $b) use ($term) {
                $b->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('subject', 'like', $term)
                    ->orWhere('message', 'like', $term);
            });
        }

        return $q->orderBy($sort, $direction);
    }
}
