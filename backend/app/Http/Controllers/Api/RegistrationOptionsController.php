<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RegistrationGrade;
use App\Models\RegistrationNationality;
use Illuminate\Http\JsonResponse;

class RegistrationOptionsController extends Controller
{
    public function index(): JsonResponse
    {
        $locales = ['ar', 'en'];

        $grades = RegistrationGrade::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->with(['translations' => fn ($q) => $q->whereIn('locale', $locales)])
            ->get()
            ->map(fn (RegistrationGrade $g) => [
                'code' => $g->code,
                'sort_order' => $g->sort_order,
                'labels' => [
                    'ar' => $g->translations->firstWhere('locale', 'ar')?->name ?? $g->code,
                    'en' => $g->translations->firstWhere('locale', 'en')?->name ?? $g->code,
                ],
            ]);

        $nationalities = RegistrationNationality::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->with(['translations' => fn ($q) => $q->whereIn('locale', $locales)])
            ->get()
            ->map(fn (RegistrationNationality $n) => [
                'code' => $n->code,
                'sort_order' => $n->sort_order,
                'labels' => [
                    'ar' => $n->translations->firstWhere('locale', 'ar')?->name ?? $n->code,
                    'en' => $n->translations->firstWhere('locale', 'en')?->name ?? $n->code,
                ],
            ]);

        return response()->json([
            'grades' => $grades,
            'nationalities' => $nationalities,
        ]);
    }
}
