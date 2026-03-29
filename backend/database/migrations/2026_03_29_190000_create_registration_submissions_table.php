<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('father_full_name');
            $table->string('father_national_id', 32);
            $table->string('student_full_name');
            $table->string('student_national_id', 32);
            $table->string('parent_mobile', 32);
            $table->string('gender', 32);
            $table->string('grade_level', 128);
            $table->string('nationality', 128);
            $table->text('notes')->nullable();
            $table->string('status', 32)->default('pending');
            $table->text('staff_reply')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_submissions');
    }
};
