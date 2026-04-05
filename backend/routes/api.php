<?php

use App\Http\Controllers\Api\Admin\AdminCmsPageController;
use App\Http\Controllers\Api\Admin\AdminCmsSectionController;
use App\Http\Controllers\Api\Admin\AdminCmsSectionItemController;
use App\Http\Controllers\Api\Admin\AdminCmsSettingController;
use App\Http\Controllers\Api\Admin\AdminContentPageController;
use App\Http\Controllers\Api\Admin\AdminRegistrationSubmissionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CmsPageController;
use App\Http\Controllers\Api\CmsSettingsController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\RegistrationOptionsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:120,1')->group(function () {
    Route::get('/content/{slug}', [ContentController::class, 'show'])
        ->where('slug', '[a-z0-9-]+');
    Route::get('/pages/{slug}', [CmsPageController::class, 'show'])
        ->where('slug', '[a-z0-9-]+');
    Route::get('/settings', [CmsSettingsController::class, 'index']);
    Route::get('/registration-options', [RegistrationOptionsController::class, 'index']);
});

Route::post('/registrations', [RegistrationController::class, 'store'])
    ->middleware('throttle:30,1');

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::middleware('throttle:120,1')->group(function () {
        Route::apiResource('admin/content-pages', AdminContentPageController::class);
        Route::apiResource('admin/cms-pages', AdminCmsPageController::class);
        Route::post('admin/cms-pages/{cms_page}/sections', [AdminCmsSectionController::class, 'store']);
        Route::patch('admin/cms-sections/{cms_section}', [AdminCmsSectionController::class, 'update']);
        Route::delete('admin/cms-sections/{cms_section}', [AdminCmsSectionController::class, 'destroy']);
        Route::post('admin/cms-sections/{cms_section}/items', [AdminCmsSectionItemController::class, 'store']);
        Route::patch('admin/cms-section-items/{cms_section_item}', [AdminCmsSectionItemController::class, 'update']);
        Route::delete('admin/cms-section-items/{cms_section_item}', [AdminCmsSectionItemController::class, 'destroy']);
        Route::get('admin/cms-settings', [AdminCmsSettingController::class, 'show']);
        Route::put('admin/cms-settings', [AdminCmsSettingController::class, 'update']);
        Route::get('admin/registrations/stats', [AdminRegistrationSubmissionController::class, 'stats']);
        Route::get('admin/registrations/export', [AdminRegistrationSubmissionController::class, 'export']);
        Route::get('admin/registrations', [AdminRegistrationSubmissionController::class, 'index']);
        Route::get('admin/registrations/{id}', [AdminRegistrationSubmissionController::class, 'show'])
            ->whereNumber('id');
        Route::patch('admin/registrations/{id}', [AdminRegistrationSubmissionController::class, 'update'])
            ->whereNumber('id');
    });
});
