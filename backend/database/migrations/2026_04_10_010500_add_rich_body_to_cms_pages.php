<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            $table->string('page_subtitle', 500)->nullable()->after('title');
            $table->longText('body_html')->nullable()->after('page_subtitle');
            $table->string('header_background', 2000)->nullable()->after('meta_description');
        });
    }

    public function down(): void
    {
        Schema::table('cms_pages', function (Blueprint $table) {
            $table->dropColumn(['page_subtitle', 'body_html', 'header_background']);
        });
    }
};
