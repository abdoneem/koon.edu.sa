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

// API documentation (OpenAPI + UI). Only when dedoc/scramble is installed (e.g. composer install).
// Without this guard, missing vendor causes: Class "Dedoc\Scramble\Scramble" not found at boot.
if (class_exists(\Dedoc\Scramble\Scramble::class)) {
    $docsPath = 'docs/api';
    $docsJsonPath = 'docs/api.json';

    \Dedoc\Scramble\Scramble::registerUiRoute(path: $docsPath)->name('scramble.docs.ui');
    \Dedoc\Scramble\Scramble::registerJsonSpecificationRoute(path: $docsJsonPath)->name('scramble.docs.document');

    Route::redirect('/docs', '/'.$docsPath);
}

$serveSpa = static function () {
    $path = request()->path();

    // Uploaded CMS images should be served as static files via public/storage → storage/app/public
    // (`php artisan storage:link`). If the request still reaches Laravel (missing symlink, or
    // everything forwarded to index.php), stream the file when it exists on the public disk.
    if ($path !== '' && str_starts_with($path, 'storage/')) {
        $relative = substr($path, strlen('storage/'));
        $candidate = storage_path('app/public/'.$relative);
        $publicDir = realpath(storage_path('app/public'));
        $resolved = is_file($candidate) ? realpath($candidate) : false;
        if ($publicDir && $resolved && str_starts_with($resolved, $publicDir.DIRECTORY_SEPARATOR)) {
            return response()->file($resolved);
        }

        return response(
            "Not found.\n".
            "CMS/media files are stored under storage/app/public and exposed via the public/storage symlink.\n".
            "On the server: run `php artisan storage:link`, ensure storage/app/public/cms is writable, then re-upload if needed.\n",
            404,
            ['Content-Type' => 'text/plain; charset=UTF-8'],
        );
    }

    // If the web server forwarded here, there is no matching file under public/.
    // Do not serve index.html for hashed Vite assets — that yields text/html for a .js URL and
    // browsers report: "Expected a JavaScript module script but the server responded with MIME text/html".
    $looksLikePublicStatic =
        str_starts_with($path, 'assets/')
        || str_starts_with($path, 'brand/')
        || str_starts_with($path, 'documents/')
        || preg_match('/\.(?:js|mjs|cjs|css|map|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico|pdf)$/i', $path);

    if ($path !== '' && $looksLikePublicStatic) {
        return response(
            "Missing static file under public/: {$path}\n".
            'Redeploy: copy dist/* into Laravel public/ (must include the assets/ folder).',
            404,
            ['Content-Type' => 'text/plain; charset=UTF-8'],
        );
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
};

Route::get('/', $serveSpa);

Route::get('/{any}', $serveSpa)->where(
    'any',
    '^(?!(?:api|sanctum|docs)(?:/|$)).+$'
);
