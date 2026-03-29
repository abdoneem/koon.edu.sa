<?php

use Illuminate\Support\Facades\Route;

/*
| API routes load before web routes. This catch-all serves the React SPA for
| browser URLs when public/index.html exists (production). Otherwise "/" shows
| the default Laravel welcome (local API-only dev).
*/
Route::get('/{any?}', function (?string $any = null) {
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
})->where('any', '.*');
