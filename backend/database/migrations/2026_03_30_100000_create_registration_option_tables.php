<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('registration_grades')) {
            Schema::create('registration_grades', function (Blueprint $table) {
                $table->id();
                $table->string('code', 64)->unique();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('registration_grade_translations')) {
            Schema::create('registration_grade_translations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('registration_grade_id');
                $table->string('locale', 8);
                $table->string('name', 255);
                $table->timestamps();

                $table->unique(['registration_grade_id', 'locale'], 'reg_grade_trans_grade_id_locale_uni');
                $table->foreign('registration_grade_id', 'reg_grade_trans_gr_fk')
                    ->references('id')->on('registration_grades')->cascadeOnDelete();
            });
        } elseif (! $this->translationColumnHasForeignKey('registration_grade_translations', 'registration_grade_id')) {
            Schema::table('registration_grade_translations', function (Blueprint $table) {
                $table->foreign('registration_grade_id', 'reg_grade_trans_gr_fk')
                    ->references('id')->on('registration_grades')->cascadeOnDelete();
            });
        }

        if (! Schema::hasTable('registration_nationalities')) {
            Schema::create('registration_nationalities', function (Blueprint $table) {
                $table->id();
                $table->string('code', 64)->unique();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('registration_nationality_translations')) {
            Schema::create('registration_nationality_translations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('registration_nationality_id');
                $table->string('locale', 8);
                $table->string('name', 255);
                $table->timestamps();

                $table->unique(['registration_nationality_id', 'locale'], 'reg_nat_trans_nat_id_locale_uni');
                $table->foreign('registration_nationality_id', 'reg_nat_trans_nat_fk')
                    ->references('id')->on('registration_nationalities')->cascadeOnDelete();
            });
        } elseif (! $this->translationColumnHasForeignKey('registration_nationality_translations', 'registration_nationality_id')) {
            Schema::table('registration_nationality_translations', function (Blueprint $table) {
                $table->foreign('registration_nationality_id', 'reg_nat_trans_nat_fk')
                    ->references('id')->on('registration_nationalities')->cascadeOnDelete();
            });
        }
    }

    private function translationColumnHasForeignKey(string $table, string $column): bool
    {
        $db = Schema::getConnection()->getDatabaseName();

        $row = DB::selectOne(
            'select 1 as ok from information_schema.key_column_usage
             where table_schema = ? and table_name = ? and column_name = ?
             and referenced_table_name is not null
             limit 1',
            [$db, $table, $column]
        );

        return $row !== null;
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_nationality_translations');
        Schema::dropIfExists('registration_nationalities');
        Schema::dropIfExists('registration_grade_translations');
        Schema::dropIfExists('registration_grades');
    }
};
