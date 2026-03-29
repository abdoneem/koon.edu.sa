<?php

use Illuminate\Support\Facades\Route;

/*
| When the Vite build is deployed as public/index.html, serve it for browser
| navigation (React Router). API and Sanctum routes stay on /api and /sanctum.
| Local dev without index.html in public keeps the Laravel welcome page on /.
*/
Route::get('/{any?}', function (?string $any = null) {
    $path = request()->path();

    if ($path === 'up' || str_starts_with($path, 'api/') || str_starts_with($path, 'sanctum/')) {
        abort(404);
    }

    $index = public_path('index.html');
    if (is_file($index)) {
        return response()->file($index, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    return $path === '' || $path === '/'
        ? view('welcome')
        : abort(404);
})->where('any', '.*');
