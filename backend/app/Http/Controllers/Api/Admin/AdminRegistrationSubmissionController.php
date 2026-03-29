<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRegistrationSubmissionRequest;
use App\Models\RegistrationGrade;
use App\Models\RegistrationNationality;
use App\Models\RegistrationSubmission;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminRegistrationSubmissionController extends Controller
{
    private const EXPORT_ROW_CAP = 15_000;

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => RegistrationSubmission::query()->count(),
            'pending' => RegistrationSubmission::query()->where('status', 'pending')->count(),
            'reviewed' => RegistrationSubmission::query()->where('status', 'reviewed')->count(),
            'replied' => RegistrationSubmission::query()->where('status', 'replied')->count(),
            'last_7_days' => RegistrationSubmission::query()
                ->where('created_at', '>=', now()->subDays(7))
                ->count(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->query('per_page', 25), 5), 100);
        $query = $this->registrationListQuery($request);

        return response()->json($query->paginate($perPage));
    }

    public function export(Request $request): JsonResponse|StreamedResponse
    {
        $query = $this->registrationListQuery($request);
        $limited = (clone $query)->limit(self::EXPORT_ROW_CAP + 1)->get();

        if ($limited->count() > self::EXPORT_ROW_CAP) {
            return response()->json([
                'message' => 'تجاوز التصدير الحد الأقصى ('.self::EXPORT_ROW_CAP.' صفاً). استخدم التصفية أو البحث لتقليل النتائج.',
            ], 422);
        }

        $gradesAr = $this->arabicLabelsByCode(
            RegistrationGrade::query()->with('translations')->get(),
            'translations',
            'locale',
            'name',
        );
        $nationalitiesAr = $this->arabicLabelsByCode(
            RegistrationNationality::query()->with('translations')->get(),
            'translations',
            'locale',
            'name',
        );

        $filename = 'registration-submissions-'.Carbon::now()->format('Y-m-d-His').'.xlsx';

        return response()->streamDownload(function () use ($limited, $gradesAr, $nationalitiesAr) {
            $spreadsheet = new Spreadsheet;
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setRightToLeft(true);

            $headers = [
                'رقم الطلب',
                'اسم الأب',
                'هوية الأب',
                'اسم الطالب',
                'هوية الطالب',
                'جوال ولي الأمر',
                'الجنس',
                'الصف (رمز)',
                'الصف (عربي)',
                'الجنسية (رمز)',
                'الجنسية (عربي)',
                'ملاحظات',
                'الحالة',
                'رد الإدارة',
                'تاريخ الرد',
                'تاريخ الإرسال',
                'تاريخ التحديث',
            ];
            $sheet->fromArray($headers, null, 'A1');

            $rowIndex = 2;
            foreach ($limited as $row) {
                $sheet->fromArray([
                    $row->id,
                    $row->father_full_name,
                    $row->father_national_id,
                    $row->student_full_name,
                    $row->student_national_id,
                    $row->parent_mobile,
                    $this->genderLabelAr($row->gender),
                    $row->grade_level,
                    $gradesAr[$row->grade_level] ?? $row->grade_level,
                    $row->nationality,
                    $nationalitiesAr[$row->nationality] ?? $row->nationality,
                    $row->notes ?? '',
                    $this->statusLabelAr($row->status),
                    $row->staff_reply ?? '',
                    $row->replied_at?->timezone(config('app.timezone'))->format('Y-m-d H:i:s') ?? '',
                    $row->created_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
                    $row->updated_at->timezone(config('app.timezone'))->format('Y-m-d H:i:s'),
                ], null, 'A'.$rowIndex);
                $rowIndex++;
            }

            foreach (range('A', 'Q') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $row = RegistrationSubmission::query()->findOrFail($id);

        return response()->json($row);
    }

    public function update(UpdateRegistrationSubmissionRequest $request, int $id): JsonResponse
    {
        $registration = RegistrationSubmission::query()->findOrFail($id);
        $data = $request->validated();

        if (array_key_exists('staff_reply', $data) && filled($data['staff_reply'])) {
            $registration->replied_at = now();
        }

        $registration->fill($data);
        $registration->save();

        return response()->json($registration->fresh());
    }

    private function registrationListQuery(Request $request): Builder
    {
        /** @var 'asc'|'desc' $direction */
        $direction = strtolower((string) $request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $sort = (string) $request->query('sort', 'created_at');
        $allowedSort = ['created_at', 'id', 'student_full_name', 'father_full_name', 'grade_level', 'status', 'parent_mobile'];
        if (! in_array($sort, $allowedSort, true)) {
            $sort = 'created_at';
        }

        $query = RegistrationSubmission::query();

        $status = $request->query('status');
        if (filled($status) && in_array($status, ['pending', 'reviewed', 'replied'], true)) {
            $query->where('status', $status);
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function ($q) use ($like) {
                $q->where('student_full_name', 'like', $like)
                    ->orWhere('father_full_name', 'like', $like)
                    ->orWhere('parent_mobile', 'like', $like)
                    ->orWhere('student_national_id', 'like', $like)
                    ->orWhere('father_national_id', 'like', $like);
            });
        }

        $query->orderBy($sort, $direction);

        return $query;
    }

    /**
     * @param  iterable<int, RegistrationGrade|RegistrationNationality>  $models
     * @return array<string, string>
     */
    private function arabicLabelsByCode(iterable $models, string $relation, string $localeKey, string $nameKey): array
    {
        $map = [];
        foreach ($models as $model) {
            $ar = null;
            foreach ($model->{$relation} as $t) {
                if (($t->{$localeKey} ?? '') === 'ar') {
                    $ar = $t->{$nameKey};
                    break;
                }
            }
            $map[$model->code] = $ar ?? $model->code;
        }

        return $map;
    }

    private function genderLabelAr(string $code): string
    {
        return match ($code) {
            'male' => 'ذكر',
            'female' => 'أنثى',
            default => $code,
        };
    }

    private function statusLabelAr(string $status): string
    {
        return match ($status) {
            'pending' => 'معلق',
            'reviewed' => 'تمت المراجعة',
            'replied' => 'تم الرد',
            default => $status,
        };
    }
}
