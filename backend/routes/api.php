<?php

use App\Http\Controllers\Api\Admin\AdminCmsMediaController;
use App\Http\Controllers\Api\Admin\AdminCmsPageController;
use App\Http\Controllers\Api\Admin\AdminCmsSectionController;
use App\Http\Controllers\Api\Admin\AdminCmsSectionItemController;
use App\Http\Controllers\Api\Admin\AdminCmsSettingController;
use App\Http\Controllers\Api\Admin\AdminContentPageController;
use App\Http\Controllers\Api\Admin\AdminLandingPayloadController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminBookTourRequestController;
use App\Http\Controllers\Api\Admin\AdminContactMessageController;
use App\Http\Controllers\Api\Admin\AdminRegistrationSubmissionController;
use App\Http\Controllers\Api\Admin\AdminPermissionController;
use App\Http\Controllers\Api\Admin\AdminRoleController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CmsPageController;
use App\Http\Controllers\Api\CmsSettingsController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\BookTourController;
use App\Http\Controllers\Api\ContactMessageController;
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

Route::post('/book-tour', [BookTourController::class, 'store'])
    ->middleware('throttle:30,1');

Route::post('/contact-messages', [ContactMessageController::class, 'store'])
    ->middleware('throttle:20,1');

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->values()->all(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
        ]);
    });
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Spatie Permission: use `permission:name,sanctum` so checks use the same guard as User::$guard_name and DB rows.
    Route::middleware(['throttle:120,1', 'permission:dashboard_view,sanctum'])->get(
        'admin/dashboard/summary',
        [AdminDashboardController::class, 'summary']
    );

    Route::middleware(['throttle:120,1', 'permission:content_pages_manage,sanctum'])->group(function () {
        Route::post('admin/content-pages/{content_page}/reset-to-seeded', [AdminContentPageController::class, 'resetToSeededDefaults']);
        Route::apiResource('admin/content-pages', AdminContentPageController::class);

        Route::prefix('admin/content-pages/landing/{locale}')
            ->where(['locale' => 'en|ar'])
            ->group(function () {
                Route::get('collections/{collection}', [AdminLandingPayloadController::class, 'indexCollection']);
                Route::put('collections/{collection}', [AdminLandingPayloadController::class, 'replaceCollection']);
                Route::get('collections/{collection}/items/{itemId}', [AdminLandingPayloadController::class, 'showItem'])
                    ->where('itemId', '[a-zA-Z0-9_.-]+');
                Route::patch('collections/{collection}/items/{itemId}', [AdminLandingPayloadController::class, 'patchItem'])
                    ->where('itemId', '[a-zA-Z0-9_.-]+');
                Route::post('collections/{collection}/items', [AdminLandingPayloadController::class, 'storeItem']);
                Route::delete('collections/{collection}/items/{itemId}', [AdminLandingPayloadController::class, 'destroyItem'])
                    ->where('itemId', '[a-zA-Z0-9_.-]+');
                Route::patch('inline/excellence', [AdminLandingPayloadController::class, 'patchExcellence']);
                Route::patch('inline/virtual-tour', [AdminLandingPayloadController::class, 'patchVirtualTour']);
                Route::patch('inline/articles-lead', [AdminLandingPayloadController::class, 'patchArticlesLead']);
                Route::patch('inline/programs-section', [AdminLandingPayloadController::class, 'patchProgramsSection']);
                Route::patch('inline/why-koon', [AdminLandingPayloadController::class, 'patchWhyKoon']);
            });
    });

    Route::middleware(['throttle:120,1', 'permission:inline_edit,sanctum', 'permission:content_pages_manage,sanctum'])->patch(
        'admin/content-pages/landing-hero/inline',
        [AdminContentPageController::class, 'patchLandingHeroInline']
    );

    Route::middleware(['throttle:120,1', 'permission:inline_edit,sanctum', 'permission:content_pages_manage,sanctum'])->patch(
        'admin/content-pages/landing-highlights/inline',
        [AdminContentPageController::class, 'patchLandingHighlightsInline']
    );

    Route::middleware(['throttle:120,1', 'permission:media_manage,sanctum'])->post(
        'admin/cms-media',
        [AdminCmsMediaController::class, 'store']
    );

    Route::middleware(['throttle:120,1', 'permission:cms_manage,sanctum'])->group(function () {
        Route::apiResource('admin/cms-pages', AdminCmsPageController::class);
        Route::post('admin/cms-pages/{cms_page}/sections', [AdminCmsSectionController::class, 'store']);
        Route::patch('admin/cms-sections/{cms_section}', [AdminCmsSectionController::class, 'update']);
        Route::delete('admin/cms-sections/{cms_section}', [AdminCmsSectionController::class, 'destroy']);
        Route::post('admin/cms-sections/{cms_section}/items', [AdminCmsSectionItemController::class, 'store']);
        Route::patch('admin/cms-section-items/{cms_section_item}', [AdminCmsSectionItemController::class, 'update']);
        Route::delete('admin/cms-section-items/{cms_section_item}', [AdminCmsSectionItemController::class, 'destroy']);
    });

    Route::middleware(['throttle:120,1', 'permission:cms_settings_manage,sanctum'])->group(function () {
        Route::get('admin/cms-settings', [AdminCmsSettingController::class, 'show']);
        Route::put('admin/cms-settings', [AdminCmsSettingController::class, 'update']);
    });

    Route::middleware(['throttle:120,1', 'permission:registrations_view,sanctum'])->group(function () {
        Route::get('admin/registrations/stats', [AdminRegistrationSubmissionController::class, 'stats']);
        Route::get('admin/registrations', [AdminRegistrationSubmissionController::class, 'index']);
        Route::get('admin/registrations/{id}', [AdminRegistrationSubmissionController::class, 'show'])
            ->whereNumber('id');
    });

    Route::middleware(['throttle:120,1', 'permission:registrations_export,sanctum'])->get(
        'admin/registrations/export',
        [AdminRegistrationSubmissionController::class, 'export']
    );

    Route::middleware(['throttle:120,1', 'permission:registrations_update,sanctum'])->post(
        'admin/registrations',
        [AdminRegistrationSubmissionController::class, 'store']
    );

    Route::middleware(['throttle:120,1', 'permission:registrations_update,sanctum'])->patch(
        'admin/registrations/{id}',
        [AdminRegistrationSubmissionController::class, 'update']
    )->whereNumber('id');

    Route::middleware(['throttle:120,1', 'permission:book_tour_view,sanctum'])->group(function () {
        Route::get('admin/book-tour-requests/stats', [AdminBookTourRequestController::class, 'stats']);
        Route::get('admin/book-tour-requests', [AdminBookTourRequestController::class, 'index']);
        Route::get('admin/book-tour-requests/{id}', [AdminBookTourRequestController::class, 'show'])
            ->whereNumber('id');
    });

    Route::middleware(['throttle:120,1', 'permission:book_tour_update,sanctum'])->patch(
        'admin/book-tour-requests/{id}',
        [AdminBookTourRequestController::class, 'update']
    )->whereNumber('id');

    Route::middleware(['throttle:120,1', 'permission:contact_messages_view,sanctum'])->group(function () {
        Route::get('admin/contact-messages/stats', [AdminContactMessageController::class, 'stats']);
        Route::get('admin/contact-messages', [AdminContactMessageController::class, 'index']);
        Route::get('admin/contact-messages/{id}', [AdminContactMessageController::class, 'show'])
            ->whereNumber('id');
    });

    Route::middleware(['throttle:120,1', 'permission:contact_messages_update,sanctum'])->patch(
        'admin/contact-messages/{id}',
        [AdminContactMessageController::class, 'update']
    )->whereNumber('id');

    Route::middleware(['throttle:120,1', 'permission:users_manage,sanctum'])->group(function () {
        Route::get('admin/permissions', [AdminPermissionController::class, 'index']);
        Route::post('admin/permissions', [AdminPermissionController::class, 'store']);
        Route::delete('admin/permissions/{permission}', [AdminPermissionController::class, 'destroy']);

        Route::put('admin/roles/{role}/permissions', [AdminRoleController::class, 'syncPermissions']);
        Route::get('admin/roles', [AdminRoleController::class, 'index']);
        Route::post('admin/roles', [AdminRoleController::class, 'store']);
        Route::get('admin/roles/{role}', [AdminRoleController::class, 'show']);
        Route::patch('admin/roles/{role}', [AdminRoleController::class, 'update']);
        Route::delete('admin/roles/{role}', [AdminRoleController::class, 'destroy']);

        Route::get('admin/users', [AdminUserController::class, 'index']);
        Route::post('admin/users', [AdminUserController::class, 'store']);
        Route::get('admin/users/{user}', [AdminUserController::class, 'show']);
        Route::patch('admin/users/{user}', [AdminUserController::class, 'update']);
        Route::delete('admin/users/{user}', [AdminUserController::class, 'destroy']);
    });
});
