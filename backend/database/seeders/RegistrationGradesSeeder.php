<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/** Upserts registration grade options (safe to re-run). */
class RegistrationGradesSeeder extends Seeder
{
    public function run(): void
    {
        (new RegistrationOptionsSeeder)->seedGrades();
    }
}
