<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentPage;
use App\Services\LandingPagePayloadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminLandingPayloadController extends Controller
{
    /** Object-array keys (items addressed by `id`). */
    public const OBJECT_COLLECTIONS = [
        'highlights',
        'programs',
        'stats',
        'news',
        'gallery',
        'partners',
        'admissionSteps',
        'articleCards',
    ];

    /** String list keys (replace via PUT only). */
    public const STRING_LIST_COLLECTIONS = [
        'mediaTicker',
        'policyBullets',
    ];

    public function __construct(
        private readonly LandingPagePayloadService $landing,
    ) {}

    public function indexCollection(Request $request, string $locale, string $collection): JsonResponse
    {
        $page = $this->landing->pageForLocale($locale);
        if ($page === null) {
            return response()->json($this->landing->missingResponse(), 404);
        }
        if (! $this->isCollection($collection)) {
            return response()->json(['code' => 'unknown_collection', 'message' => 'Unknown collection key.'], 404);
        }

        $payload = $this->landing->payloadArray($page);
        $data = $payload[$collection] ?? [];

        return response()->json(['data' => $data]);
    }

    public function replaceCollection(Request $request, string $locale, string $collection): JsonResponse
    {
        $page = $this->landing->pageForLocale($locale);
        if ($page === null) {
            return response()->json($this->landing->missingResponse(), 404);
        }
        if (! $this->isCollection($collection)) {
            return response()->json(['code' => 'unknown_collection', 'message' => 'Unknown collection key.'], 404);
        }

        $rules = $this->rulesForReplaceCollection($collection);
        $validated = $request->validate($rules);
        /** @var list<mixed>|array<int, string> $rows */
        $rows = $validated['data'];

        $payload = $this->landing->payloadArray($page);
        $payload[$collection] = $rows;
        $this->landing->savePayload($page, $payload);

        return response()->json(['ok' => true, 'data' => $rows]);
    }

    public function showItem(Request $request, string $locale, string $collection, string $itemId): JsonResponse
    {
        $page = $this->requireObjectCollectionPage($locale, $collection);
        if ($page instanceof JsonResponse) {
            return $page;
        }

        $payload = $this->landing->payloadArray($page);
        $items = $this->getObjectList($payload, $collection);
        $idx = $this->findIndexById($items, $itemId);
        if ($idx === null) {
            return response()->json(['code' => 'not_found', 'message' => 'Item not found.'], 404);
        }

        return response()->json(['data' => $items[$idx]]);
    }

    public function patchItem(Request $request, string $locale, string $collection, string $itemId): JsonResponse
    {
        $page = $this->requireObjectCollectionPage($locale, $collection);
        if ($page instanceof JsonResponse) {
            return $page;
        }

        $payload = $this->landing->payloadArray($page);
        $items = $this->getObjectList($payload, $collection);
        $idx = $this->findIndexById($items, $itemId);
        if ($idx === null) {
            return response()->json(['code' => 'not_found', 'message' => 'Item not found.'], 404);
        }

        $patch = $request->validate($this->rulesForItemPatch($collection));
        /** @var array<string, mixed> $current */
        $current = is_array($items[$idx]) ? $items[$idx] : [];
        $merged = array_merge($current, $patch);
        if (! isset($merged['id']) || $merged['id'] === '') {
            $merged['id'] = $itemId;
        }

        if (in_array($collection, ['news', 'articleCards'], true)) {
            $base = (string) ($merged['slug'] ?? '');
            if ($base === '') {
                $title = (string) ($merged['title'] ?? '');
                $base = $title !== '' ? Str::slug($title) : '';
            }
            if ($base !== '') {
                $merged['slug'] = $this->uniqueSlugForCollection($items, $base, $itemId);
            }
        }

        $items[$idx] = $merged;
        $payload[$collection] = $items;
        $this->landing->savePayload($page, $payload);

        return response()->json(['ok' => true, 'data' => $merged]);
    }

    public function storeItem(Request $request, string $locale, string $collection): JsonResponse
    {
        $page = $this->requireObjectCollectionPage($locale, $collection);
        if ($page instanceof JsonResponse) {
            return $page;
        }

        $body = $request->validate($this->rulesForItemCreate($collection));
        $payload = $this->landing->payloadArray($page);
        $items = $this->getObjectList($payload, $collection);

        if (empty($body['id'])) {
            // Keep ids short enough for ContentPayloadValidator (`programs.*.id` max 32, etc.).
            $body['id'] = 'g_'.bin2hex(random_bytes(8));
        }

        if (in_array($collection, ['news', 'articleCards'], true)) {
            $slug = (string) ($body['slug'] ?? '');
            if ($slug === '') {
                $title = (string) ($body['title'] ?? '');
                $slug = $title !== '' ? Str::slug($title) : '';
            }
            if ($slug !== '') {
                $body['slug'] = $this->uniqueSlugForCollection($items, $slug, null);
            }
        }

        $items[] = $body;
        $payload[$collection] = $items;
        $this->landing->savePayload($page, $payload);

        return response()->json(['ok' => true, 'data' => $body], 201);
    }

    public function destroyItem(Request $request, string $locale, string $collection, string $itemId): JsonResponse
    {
        $page = $this->requireObjectCollectionPage($locale, $collection);
        if ($page instanceof JsonResponse) {
            return $page;
        }

        $payload = $this->landing->payloadArray($page);
        $items = $this->getObjectList($payload, $collection);
        $next = array_values(array_filter($items, static function ($row) use ($itemId): bool {
            if (! is_array($row)) {
                return true;
            }

            return (string) ($row['id'] ?? '') !== $itemId;
        }));
        if (count($next) === count($items)) {
            return response()->json(['code' => 'not_found', 'message' => 'Item not found.'], 404);
        }
        $payload[$collection] = $next;
        $this->landing->savePayload($page, $payload);

        return response()->json(null, 204);
    }

    public function patchExcellence(Request $request, string $locale): JsonResponse
    {
        $page = $this->landing->pageForLocale($locale);
        if ($page === null) {
            return response()->json($this->landing->missingResponse(), 404);
        }
        $patch = $request->validate([
            'title' => ['sometimes', 'nullable', 'string', 'max:500'],
            'subtitle' => ['sometimes', 'nullable', 'string', 'max:300'],
            'body' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'bullets' => ['sometimes', 'nullable', 'array', 'max:40'],
            'bullets.*' => ['string', 'max:800'],
        ]);
        $payload = $this->landing->payloadArray($page);
        /** @var array<string, mixed> $ex */
        $ex = is_array($payload['excellence'] ?? null) ? $payload['excellence'] : [];
        foreach (['title', 'subtitle', 'body', 'bullets'] as $k) {
            if (array_key_exists($k, $patch)) {
                $ex[$k] = $patch[$k];
            }
        }
        $payload['excellence'] = $ex;
        $this->landing->savePayload($page, $payload);

        return response()->json(['ok' => true, 'excellence' => $ex]);
    }

    public function patchVirtualTour(Request $request, string $locale): JsonResponse
    {
        $page = $this->landing->pageForLocale($locale);
        if ($page === null) {
            return response()->json($this->landing->missingResponse(), 404);
        }
        $patch = $request->validate([
            'note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);
        $payload = $this->landing->payloadArray($page);
        /** @var array<string, mixed> $vt */
        $vt = is_array($payload['virtualTour'] ?? null) ? $payload['virtualTour'] : [];
        if (array_key_exists('note', $patch)) {
            $vt['note'] = $patch['note'];
        }
        $payload['virtualTour'] = $vt;
        $this->landing->savePayload($page, $payload);

        return response()->json(['ok' => true, 'virtualTour' => $vt]);
    }

    public function patchArticlesLead(Request $request, string $locale): JsonResponse
    {
        $page = $this->landing->pageForLocale($locale);
        if ($page === null) {
            return response()->json($this->landing->missingResponse(), 404);
        }
        $patch = $request->validate([
            'articlesSectionLead' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'articlesSectionTitle' => ['sometimes', 'nullable', 'string', 'max:300'],
        ]);
        $payload = $this->landing->payloadArray($page);
        if (array_key_exists('articlesSectionLead', $patch)) {
            $payload['articlesSectionLead'] = $patch['articlesSectionLead'];
        }
        if (array_key_exists('articlesSectionTitle', $patch)) {
            $payload['articlesSectionTitle'] = $patch['articlesSectionTitle'];
        }
        $this->landing->savePayload($page, $payload);

        return response()->json([
            'ok' => true,
            'articlesSectionLead' => $payload['articlesSectionLead'] ?? null,
            'articlesSectionTitle' => $payload['articlesSectionTitle'] ?? null,
        ]);
    }

    public function patchProgramsSection(Request $request, string $locale): JsonResponse
    {
        $page = $this->landing->pageForLocale($locale);
        if ($page === null) {
            return response()->json($this->landing->missingResponse(), 404);
        }
        $patch = $request->validate([
            'eyebrow' => ['sometimes', 'nullable', 'string', 'max:300'],
            'title' => ['sometimes', 'nullable', 'string', 'max:500'],
            'lead' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);
        $payload = $this->landing->payloadArray($page);
        /** @var array<string, mixed> $ps */
        $ps = is_array($payload['programsSection'] ?? null) ? $payload['programsSection'] : [];
        foreach (['eyebrow', 'title', 'lead'] as $k) {
            if (array_key_exists($k, $patch)) {
                $ps[$k] = $patch[$k];
            }
        }
        $payload['programsSection'] = $ps;
        $this->landing->savePayload($page, $payload);

        return response()->json(['ok' => true, 'programsSection' => $ps]);
    }

    public function patchWhyKoon(Request $request, string $locale): JsonResponse
    {
        $page = $this->landing->pageForLocale($locale);
        if ($page === null) {
            return response()->json($this->landing->missingResponse(), 404);
        }
        $patch = $request->validate([
            'eyebrow' => ['sometimes', 'nullable', 'string', 'max:300'],
            'title' => ['sometimes', 'nullable', 'string', 'max:500'],
            'lead' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'visionLabel' => ['sometimes', 'nullable', 'string', 'max:200'],
            'visionText' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'missionLabel' => ['sometimes', 'nullable', 'string', 'max:200'],
            'missionText' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'philosophyLabel' => ['sometimes', 'nullable', 'string', 'max:200'],
            'philosophyText' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'accordionSummary' => ['sometimes', 'nullable', 'string', 'max:500'],
            'accordionLead' => ['sometimes', 'nullable', 'string', 'max:15000'],
        ]);
        $payload = $this->landing->payloadArray($page);
        /** @var array<string, mixed> $wk */
        $wk = is_array($payload['whyKoon'] ?? null) ? $payload['whyKoon'] : [];
        $keys = [
            'eyebrow', 'title', 'lead', 'visionLabel', 'visionText',
            'missionLabel', 'missionText', 'philosophyLabel', 'philosophyText',
            'accordionSummary', 'accordionLead',
        ];
        foreach ($keys as $k) {
            if (array_key_exists($k, $patch)) {
                $wk[$k] = $patch[$k];
            }
        }
        $payload['whyKoon'] = $wk;
        $this->landing->savePayload($page, $payload);

        return response()->json(['ok' => true, 'whyKoon' => $wk]);
    }

    private function isCollection(string $collection): bool
    {
        return in_array($collection, self::OBJECT_COLLECTIONS, true)
            || in_array($collection, self::STRING_LIST_COLLECTIONS, true);
    }

    private function requireObjectCollectionPage(string $locale, string $collection): ContentPage|JsonResponse
    {
        $page = $this->landing->pageForLocale($locale);
        if ($page === null) {
            return response()->json($this->landing->missingResponse(), 404);
        }
        if (! in_array($collection, self::OBJECT_COLLECTIONS, true)) {
            return response()->json(['code' => 'unknown_collection', 'message' => 'Not an object collection.'], 404);
        }

        return $page;
    }

    /** @return list<array<string, mixed>> */
    private function getObjectList(array $payload, string $collection): array
    {
        $raw = $payload[$collection] ?? [];
        if (! is_array($raw)) {
            return [];
        }
        $out = [];
        foreach ($raw as $row) {
            if (is_array($row)) {
                $out[] = $row;
            }
        }

        return $out;
    }

    /** @param list<array<string, mixed>> $items */
    private function findIndexById(array $items, string $itemId): ?int
    {
        foreach ($items as $i => $row) {
            if ((string) ($row['id'] ?? '') === $itemId) {
                return $i;
            }
        }

        return null;
    }

    /** @return array<string, mixed> */
    private function rulesForReplaceCollection(string $collection): array
    {
        $base = [
            'data' => ['required', 'array'],
        ];

        return match ($collection) {
            'highlights' => $base + [
                'data.*.id' => ['nullable', 'string', 'max:64'],
                'data.*.title' => ['required', 'string', 'max:500'],
                'data.*.description' => ['required', 'string', 'max:2000'],
            ],
            'programs' => $base + [
                'data.*.id' => ['nullable', 'string', 'max:64'],
                'data.*.name' => ['required', 'string', 'max:500'],
                'data.*.description' => ['required', 'string', 'max:2000'],
                'data.*.annualFee' => ['required', 'string', 'max:200'],
            ],
            'stats' => $base + [
                'data.*.id' => ['nullable', 'string', 'max:64'],
                'data.*.value' => ['required', 'string', 'max:120'],
                'data.*.label' => ['required', 'string', 'max:500'],
            ],
            'news' => $base + [
                'data.*.id' => ['nullable', 'string', 'max:64'],
                'data.*.slug' => ['nullable', 'string', 'max:120'],
                'data.*.title' => ['required', 'string', 'max:500'],
                'data.*.excerpt' => ['required', 'string', 'max:2000'],
                'data.*.date' => ['nullable', 'string', 'max:80'],
                'data.*.publishedAt' => ['nullable', 'string', 'max:40'],
                'data.*.image' => ['nullable', 'string', 'max:2000'],
                'data.*.body' => ['nullable', 'string', 'max:20000'],
            ],
            'gallery' => $base + [
                'data.*.id' => ['nullable', 'string', 'max:64'],
                'data.*.src' => ['required', 'string', 'max:2000'],
                'data.*.alt' => ['required', 'string', 'max:500'],
                'data.*.caption' => ['required', 'string', 'max:500'],
                'data.*.mediaKind' => ['nullable', Rule::in(['image', 'video'])],
            ],
            'partners' => $base + [
                'data.*.id' => ['nullable', 'string', 'max:64'],
                'data.*.name' => ['required', 'string', 'max:500'],
                'data.*.abbreviation' => ['required', 'string', 'max:20'],
            ],
            'admissionSteps' => $base + [
                'data.*.id' => ['nullable', 'string', 'max:64'],
                'data.*.title' => ['required', 'string', 'max:500'],
                'data.*.description' => ['required', 'string', 'max:2000'],
            ],
            'articleCards' => $base + [
                'data.*.id' => ['nullable', 'string', 'max:64'],
                'data.*.slug' => ['nullable', 'string', 'max:120'],
                'data.*.title' => ['required', 'string', 'max:500'],
                'data.*.excerpt' => ['required', 'string', 'max:2000'],
                'data.*.meta' => ['required', 'string', 'max:300'],
                'data.*.publishedAt' => ['nullable', 'string', 'max:40'],
                'data.*.body' => ['nullable', 'string', 'max:20000'],
            ],
            'mediaTicker', 'policyBullets' => $base + [
                'data.*' => ['required', 'string', 'max:800'],
            ],
            default => $base,
        };
    }

    /** @return array<string, mixed> */
    private function rulesForItemPatch(string $collection): array
    {
        return match ($collection) {
            'highlights' => [
                'id' => ['sometimes', 'nullable', 'string', 'max:64'],
                'title' => ['sometimes', 'nullable', 'string', 'max:500'],
                'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            ],
            'programs' => [
                'id' => ['sometimes', 'nullable', 'string', 'max:64'],
                'name' => ['sometimes', 'nullable', 'string', 'max:500'],
                'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
                'annualFee' => ['sometimes', 'nullable', 'string', 'max:200'],
            ],
            'stats' => [
                'id' => ['sometimes', 'nullable', 'string', 'max:64'],
                'value' => ['sometimes', 'nullable', 'string', 'max:120'],
                'label' => ['sometimes', 'nullable', 'string', 'max:500'],
            ],
            'news' => [
                'id' => ['sometimes', 'nullable', 'string', 'max:64'],
                'slug' => ['sometimes', 'nullable', 'string', 'max:120'],
                'title' => ['sometimes', 'nullable', 'string', 'max:500'],
                'excerpt' => ['sometimes', 'nullable', 'string', 'max:2000'],
                'date' => ['sometimes', 'nullable', 'string', 'max:80'],
                'publishedAt' => ['sometimes', 'nullable', 'string', 'max:40'],
                'image' => ['sometimes', 'nullable', 'string', 'max:2000'],
                'body' => ['sometimes', 'nullable', 'string', 'max:20000'],
            ],
            'gallery' => [
                'id' => ['sometimes', 'nullable', 'string', 'max:64'],
                'src' => ['sometimes', 'nullable', 'string', 'max:2000'],
                'alt' => ['sometimes', 'nullable', 'string', 'max:500'],
                'caption' => ['sometimes', 'nullable', 'string', 'max:500'],
                'mediaKind' => ['sometimes', 'nullable', Rule::in(['image', 'video'])],
            ],
            'partners' => [
                'id' => ['sometimes', 'nullable', 'string', 'max:64'],
                'name' => ['sometimes', 'nullable', 'string', 'max:500'],
                'abbreviation' => ['sometimes', 'nullable', 'string', 'max:20'],
            ],
            'admissionSteps' => [
                'id' => ['sometimes', 'nullable', 'string', 'max:64'],
                'title' => ['sometimes', 'nullable', 'string', 'max:500'],
                'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            ],
            'articleCards' => [
                'id' => ['sometimes', 'nullable', 'string', 'max:64'],
                'slug' => ['sometimes', 'nullable', 'string', 'max:120'],
                'title' => ['sometimes', 'nullable', 'string', 'max:500'],
                'excerpt' => ['sometimes', 'nullable', 'string', 'max:2000'],
                'meta' => ['sometimes', 'nullable', 'string', 'max:300'],
                'publishedAt' => ['sometimes', 'nullable', 'string', 'max:40'],
                'body' => ['sometimes', 'nullable', 'string', 'max:20000'],
            ],
            default => [],
        };
    }

    /** @return array<string, mixed> */
    private function rulesForItemCreate(string $collection): array
    {
        return match ($collection) {
            'highlights' => [
                'id' => ['nullable', 'string', 'max:64'],
                'title' => ['required', 'string', 'max:500'],
                'description' => ['required', 'string', 'max:2000'],
            ],
            'programs' => [
                'id' => ['nullable', 'string', 'max:64'],
                'name' => ['required', 'string', 'max:500'],
                'description' => ['required', 'string', 'max:2000'],
                'annualFee' => ['required', 'string', 'max:200'],
            ],
            'stats' => [
                'id' => ['nullable', 'string', 'max:64'],
                'value' => ['required', 'string', 'max:120'],
                'label' => ['required', 'string', 'max:500'],
            ],
            'news' => [
                'id' => ['nullable', 'string', 'max:64'],
                'slug' => ['nullable', 'string', 'max:120'],
                'title' => ['required', 'string', 'max:500'],
                'excerpt' => ['required', 'string', 'max:2000'],
                'date' => ['nullable', 'string', 'max:80'],
                'publishedAt' => ['nullable', 'string', 'max:40'],
                'image' => ['nullable', 'string', 'max:2000'],
                'body' => ['nullable', 'string', 'max:20000'],
            ],
            'gallery' => [
                'id' => ['nullable', 'string', 'max:64'],
                'src' => ['required', 'string', 'max:2000'],
                'alt' => ['required', 'string', 'max:500'],
                'caption' => ['required', 'string', 'max:500'],
                'mediaKind' => ['nullable', Rule::in(['image', 'video'])],
            ],
            'partners' => [
                'id' => ['nullable', 'string', 'max:64'],
                'name' => ['required', 'string', 'max:500'],
                'abbreviation' => ['required', 'string', 'max:20'],
            ],
            'admissionSteps' => [
                'id' => ['nullable', 'string', 'max:64'],
                'title' => ['required', 'string', 'max:500'],
                'description' => ['required', 'string', 'max:2000'],
            ],
            'articleCards' => [
                'id' => ['nullable', 'string', 'max:64'],
                'slug' => ['nullable', 'string', 'max:120'],
                'title' => ['required', 'string', 'max:500'],
                'excerpt' => ['required', 'string', 'max:2000'],
                'meta' => ['required', 'string', 'max:300'],
                'publishedAt' => ['nullable', 'string', 'max:40'],
                'body' => ['nullable', 'string', 'max:20000'],
            ],
            default => [],
        };
    }

    /**
     * Ensure slug uniqueness inside the given object collection.
     *
     * @param list<array<string, mixed>> $items
     */
    private function uniqueSlugForCollection(array $items, string $slugBase, ?string $ignoreId): string
    {
        $base = Str::slug($slugBase);
        if ($base === '') {
            $base = 'item';
        }
        $candidate = $base;
        $i = 2;
        while ($this->slugExists($items, $candidate, $ignoreId)) {
            $candidate = $base.'-'.$i;
            $i++;
            if ($i > 200) {
                break;
            }
        }

        return $candidate;
    }

    /**
     * @param list<array<string, mixed>> $items
     */
    private function slugExists(array $items, string $slug, ?string $ignoreId): bool
    {
        foreach ($items as $row) {
            $sid = (string) ($row['id'] ?? '');
            if ($ignoreId !== null && $sid === $ignoreId) {
                continue;
            }
            if ((string) ($row['slug'] ?? '') === $slug) {
                return true;
            }
        }

        return false;
    }
}
