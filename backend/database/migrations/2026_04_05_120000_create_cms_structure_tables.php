<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug', 128);
            $table->string('locale', 8);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['slug', 'locale']);
        });

        Schema::create('cms_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_page_id')->constrained('cms_pages')->cascadeOnDelete();
            $table->string('type', 64);
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('cms_section_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_section_id')->constrained('cms_sections')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('icon')->nullable();
            $table->string('link')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('cms_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 128)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_section_items');
        Schema::dropIfExists('cms_sections');
        Schema::dropIfExists('cms_pages');
        Schema::dropIfExists('cms_settings');
    }
};
