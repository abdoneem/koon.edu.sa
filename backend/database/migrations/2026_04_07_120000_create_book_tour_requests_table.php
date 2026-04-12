<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_tour_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 32);
            $table->string('email')->nullable();
            $table->date('preferred_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 32)->default('pending');
            $table->text('staff_reply')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_tour_requests');
    }
};
