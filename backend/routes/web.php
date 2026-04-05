<?php

use Illuminate\Support\Facades\Route;

/*
| API routes load before web routes. This catch-all serves the React SPA for
| browser URLs when public/index.html exists (production). Otherwise "/" shows
| the default Laravel welcome (local API-only dev).
|
| Use a multi-segment {any} — a single-segment route does not match /admin/login
| or other nested paths, so hard refresh on those URLs returned 404.
|
| Do not match Laravel API or Sanctum — otherwise /api/pages/… is served as
| index.html and the React CMS client never sees JSON.
 */
$serveSpa = static function () {
    $index = public_path('index.html');
    if (is_file($index)) {
        return response()->file($index, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    $path = request()->path();

    return $path === '' || $path === '/'
        ? view('welcome')
        : abort(404);
};

Route::get('/', $serveSpa);

Route::get('/{any}', $serveSpa)->where(
    'any',
    '^(?!(?:api|sanctum)(?:/|$)).+$'
);
