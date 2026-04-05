<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registration_submissions', function (Blueprint $table) {
            if (! Schema::hasColumn('registration_submissions', 'internal_notes')) {
                $table->text('internal_notes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('registration_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('registration_submissions', 'internal_notes')) {
                $table->dropColumn('internal_notes');
            }
        });
    }
};
