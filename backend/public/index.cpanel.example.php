<?php

/**
 * cPanel: copy this file to public_html/index.php. Laravel lives next to public_html.
 *
 * $laravelFolder = ''   → Laravel root is dirname(__DIR__) (e.g. /home/USER when the
 *                         web root is /home/USER/public_html). Use this when the app
 *                         is deployed in the account home (artisan next to public_html).
 * $laravelFolder = 'koon-hosting' → Laravel in /home/USER/koon-hosting (zip bundle layout).
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$laravelFolder = '';
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
