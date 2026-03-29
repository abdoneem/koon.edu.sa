<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('registration_submissions') && ! Schema::hasColumn('registration_submissions', 'notes')) {
            Schema::table('registration_submissions', function (Blueprint $table) {
                $table->text('notes')->nullable()->after('nationality');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('registration_submissions') && Schema::hasColumn('registration_submissions', 'notes')) {
            Schema::table('registration_submissions', function (Blueprint $table) {
                $table->dropColumn('notes');
            });
        }
    }
};
