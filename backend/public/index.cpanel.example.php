<?php

/**
 * cPanel web root: only `public/` files go in public_html; Laravel lives beside it
 * (e.g. /home/USER/koon-hosting). The publish/koon-hosting bundle copies this file
 * to public/index.php for you. If your app folder name differs, change $laravelFolder.
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// '' = Laravel root is the parent of public_html (e.g. app extracted in /home/USER).
// 'koon-hosting' = Laravel lives in /home/USER/koon-hosting (recommended layout from publish bundle).
$laravelFolder = 'koon-hosting';
$laravelRoot = $laravelFolder !== ''
    ? dirname(__DIR__).'/'.$laravelFolder
    : dirname(__DIR__);

if (file_exists($maintenance = $laravelRoot.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $laravelRoot.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $laravelRoot.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
