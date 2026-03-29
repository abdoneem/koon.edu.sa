<?php

namespace Tests\Feature;

use App\Models\RegistrationSubmission;
use App\Models\User;
use Database\Seeders\RegistrationOptionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RegistrationOptionsSeeder::class);
    }

    public function test_public_can_submit_registration(): void
    {
        $payload = [
            'father_full_name' => 'أب تجريبي',
            'father_national_id' => '1234567890',
            'student_full_name' => 'طالب تجريبي',
            'student_national_id' => '1098765432',
            'parent_mobile' => '0500000000',
            'gender' => 'male',
            'grade_level' => 'primary1',
            'nationality' => 'saudi',
            'notes' => 'نرغب بجدولة زيارة للحرم المدرسي',
        ];

        $res = $this->postJson('/api/registrations', $payload);

        $res->assertCreated()->assertJsonStructure(['id', 'message']);
        $this->assertDatabaseHas('registration_submissions', [
            'father_national_id' => '1234567890',
            'status' => 'pending',
            'gender' => 'male',
            'grade_level' => 'primary1',
            'nationality' => 'saudi',
            'notes' => 'نرغب بجدولة زيارة للحرم المدرسي',
        ]);
    }

    public function test_admin_can_list_and_update_registration(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $token = $user->createToken('t')->plainTextToken;

        $row = RegistrationSubmission::query()->create([
            'father_full_name' => 'A',
            'father_national_id' => '1',
            'student_full_name' => 'S',
            'student_national_id' => '2',
            'parent_mobile' => '050',
            'gender' => 'female',
            'grade_level' => 'kg1',
            'nationality' => 'egyptian',
            'status' => 'pending',
        ]);

        $this->withToken($token)->getJson('/api/admin/registrations/stats')->assertOk();

        $this->withToken($token)->getJson('/api/admin/registrations')->assertOk();

        $this->withToken($token)->patchJson("/api/admin/registrations/{$row->id}", [
            'status' => 'replied',
            'staff_reply' => 'تم التواصل',
        ])->assertOk()->assertJsonPath('status', 'replied');
    }

    public function test_admin_registrations_list_supports_filter_sort_and_search(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $token = $user->createToken('t')->plainTextToken;

        RegistrationSubmission::query()->create([
            'father_full_name' => 'FA',
            'father_national_id' => 'f1',
            'student_full_name' => 'Student Alpha',
            'student_national_id' => 's1',
            'parent_mobile' => '0501111111',
            'gender' => 'male',
            'grade_level' => 'primary1',
            'nationality' => 'saudi',
            'status' => 'pending',
        ]);
        RegistrationSubmission::query()->create([
            'father_full_name' => 'FB',
            'father_national_id' => 'f2',
            'student_full_name' => 'Student Beta',
            'student_national_id' => 's2',
            'parent_mobile' => '0502222222',
            'gender' => 'male',
            'grade_level' => 'primary2',
            'nationality' => 'saudi',
            'status' => 'replied',
        ]);

        $this->withToken($token)
            ->getJson('/api/admin/registrations?status=pending&sort=student_full_name&direction=asc')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.student_full_name', 'Student Alpha');

        $this->withToken($token)->getJson('/api/admin/registrations?search=Beta')->assertOk()->assertJsonPath('total', 1);

        $stats = $this->withToken($token)->getJson('/api/admin/registrations/stats')->assertOk();
        $stats->assertJsonPath('reviewed', 0);
        $stats->assertJsonPath('replied', 1);
    }

    public function test_admin_export_registrations_returns_xlsx(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $token = $user->createToken('t')->plainTextToken;

        RegistrationSubmission::query()->create([
            'father_full_name' => 'أب',
            'father_national_id' => '1',
            'student_full_name' => 'طالب',
            'student_national_id' => '2',
            'parent_mobile' => '0500000000',
            'gender' => 'male',
            'grade_level' => 'kg1',
            'nationality' => 'saudi',
            'status' => 'pending',
        ]);

        $response = $this->withToken($token)->get('/api/admin/registrations/export');

        $response->assertOk();
        $this->assertStringContainsString(
            'spreadsheetml',
            (string) $response->headers->get('Content-Type'),
        );
        $this->assertStringStartsWith('PK', $response->streamedContent());
    }

    public function test_guest_cannot_export_registrations(): void
    {
        $this->getJson('/api/admin/registrations/export')->assertUnauthorized();
    }
}
