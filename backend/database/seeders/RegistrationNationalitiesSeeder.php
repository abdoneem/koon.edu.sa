<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/** Upserts registration nationality options (safe to re-run). */
class RegistrationNationalitiesSeeder extends Seeder
{
    public function run(): void
    {
        (new RegistrationOptionsSeeder)->seedNationalities();
    }
}
