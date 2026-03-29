<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64);
            $table->string('locale', 8);
            $table->json('payload');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['slug', 'locale']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_pages');
    }
};
