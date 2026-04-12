<?php

namespace Tests\Feature;

use Database\Seeders\RegistrationOptionsSeeder;

class RegistrationOptionsApiTest extends FeatureTestCase
{
    public function test_registration_options_returns_grades_and_nationalities(): void
    {
        $this->seed(RegistrationOptionsSeeder::class);

        $res = $this->getJson('/api/registration-options');

        $res->assertOk()
            ->assertJsonStructure([
                'grades' => [
                    ['code', 'sort_order', 'labels' => ['ar', 'en']],
                ],
                'nationalities' => [
                    ['code', 'sort_order', 'labels' => ['ar', 'en']],
                ],
            ]);

        $res->assertJsonPath('grades.0.code', 'kg1');
        $res->assertJsonPath('nationalities.0.code', 'saudi');
    }
}
