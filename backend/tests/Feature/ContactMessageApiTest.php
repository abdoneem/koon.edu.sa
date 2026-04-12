<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ContactMessageApiTest extends FeatureTestCase
{
    public function test_public_can_submit_contact_message(): void
    {
        $payload = [
            'name' => 'زائر',
            'email' => 'visitor@example.com',
            'phone' => '0500000000',
            'subject' => 'استفسار عن القبول',
            'message' => 'نود معرفة مواعيد التسجيل.',
        ];

        $res = $this->postJson('/api/contact-messages', $payload);

        $res->assertCreated()->assertJsonStructure(['id', 'message']);
        $this->assertDatabaseHas('contact_messages', [
            'email' => 'visitor@example.com',
            'subject' => 'استفسار عن القبول',
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_list_and_update_contact_message(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('super_admin');
        $token = $user->createToken('t')->plainTextToken;

        $row = ContactMessage::query()->create([
            'name' => 'A',
            'email' => 'a@b.co',
            'subject' => 'Hi',
            'message' => 'Body',
            'status' => 'pending',
        ]);

        $this->withToken($token)->getJson('/api/admin/contact-messages/stats')->assertOk();
        $this->withToken($token)->getJson('/api/admin/contact-messages')->assertOk();
        $this->withToken($token)->patchJson("/api/admin/contact-messages/{$row->id}", [
            'status' => 'replied',
            'staff_reply' => 'شكراً لتواصلكم',
        ])->assertOk()->assertJsonPath('status', 'replied');
    }

    public function test_guest_cannot_list_contact_messages_admin(): void
    {
        $this->getJson('/api/admin/contact-messages')->assertUnauthorized();
    }

    public function test_viewer_cannot_update_contact_message(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret')]);
        $user->assignRole('viewer');
        $token = $user->createToken('t')->plainTextToken;

        $row = ContactMessage::query()->create([
            'name' => 'A',
            'email' => 'a@b.co',
            'subject' => 'Hi',
            'message' => 'Body',
            'status' => 'pending',
        ]);

        $this->withToken($token)->getJson('/api/admin/contact-messages')->assertOk();
        $this->withToken($token)->patchJson("/api/admin/contact-messages/{$row->id}", [
            'status' => 'replied',
        ])->assertForbidden();
    }
}
