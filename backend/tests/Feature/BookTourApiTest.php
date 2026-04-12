<?php

namespace Tests\Feature;

use App\Models\BookTourRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class BookTourApiTest extends FeatureTestCase
{
    public function test_public_can_submit_book_tour(): void
    {
        $payload = [
            'name' => 'ولي أمر',
            'phone' => '0500000000',
            'email' => 'parent@example.com',
            'preferred_date' => '2026-05-01',
            'notes' => 'نرغب بزيارة صباحية',
        ];

        $res = $this->postJson('/api/book-tour', $payload);

        $res->assertCreated()->assertJsonStructure(['id', 'message']);
        $this->assertDatabaseHas('book_tour_requests', [
            'name' => 'ولي أمر',
            'phone' => '0500000000',
            'email' => 'parent@example.com',
            'status' => 'pending',
            'notes' => 'نرغب بزيارة صباحية',
        ]);
    }

    public function test_admin_can_list_and_update_book_tour(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;

        $row = BookTourRequest::query()->create([
            'name' => 'N',
            'phone' => '051',
            'status' => 'pending',
        ]);

        $this->withToken($token)->getJson('/api/admin/book-tour-requests/stats')->assertOk();

        $this->withToken($token)->getJson('/api/admin/book-tour-requests')->assertOk();

        $this->withToken($token)->patchJson("/api/admin/book-tour-requests/{$row->id}", [
            'status' => 'replied',
            'staff_reply' => 'تم التواصل',
        ])->assertOk()->assertJsonPath('status', 'replied');
    }

    public function test_guest_cannot_list_book_tour_admin(): void
    {
        $this->getJson('/api/admin/book-tour-requests')->assertUnauthorized();
    }

    public function test_viewer_cannot_update_book_tour(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('viewer');
        $token = $user->createToken('t')->plainTextToken;

        $row = BookTourRequest::query()->create([
            'name' => 'N',
            'phone' => '051',
            'status' => 'pending',
        ]);

        $this->withToken($token)->getJson('/api/admin/book-tour-requests')->assertOk();

        $this->withToken($token)->patchJson("/api/admin/book-tour-requests/{$row->id}", [
            'status' => 'replied',
        ])->assertForbidden();
    }
}
