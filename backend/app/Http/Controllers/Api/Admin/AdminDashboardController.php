<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BookTourRequest;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\CmsSectionItem;
use App\Models\ContactMessage;
use App\Models\ContentPage;
use App\Models\RegistrationSubmission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $statusCounts = RegistrationSubmission::query()
            ->selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status')
            ->all();

        $totalRegs = (int) array_sum($statusCounts);
        $pending = (int) ($statusCounts['pending'] ?? 0);

        $payload = [
            'registrations' => [
                'total' => $totalRegs,
                'pending' => $pending,
                'by_status' => $statusCounts,
            ],
            'cms' => [
                'pages' => CmsPage::query()->count(),
                'sections' => CmsSection::query()->count(),
                'items' => CmsSectionItem::query()->count(),
            ],
            'content_pages' => ContentPage::query()->count(),
            'users' => User::query()->count(),
        ];

        if ($user !== null && $user->can('contact_messages_view')) {
            $payload['contact_messages'] = [
                'total' => ContactMessage::query()->count(),
                'pending' => ContactMessage::query()->where('status', 'pending')->count(),
                'replied' => ContactMessage::query()->where('status', 'replied')->count(),
            ];
        }

        if ($user !== null && $user->can('book_tour_view')) {
            $payload['book_tour_requests'] = [
                'total' => BookTourRequest::query()->count(),
                'pending' => BookTourRequest::query()->where('status', 'pending')->count(),
                'replied' => BookTourRequest::query()->where('status', 'replied')->count(),
            ];
        }

        return response()->json($payload);
    }
}
