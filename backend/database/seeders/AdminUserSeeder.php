<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@koon.edu.sa');
        $password = env('ADMIN_PASSWORD', 'password');

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => env('ADMIN_NAME', 'KOON Admin'),
                'password' => Hash::make($password),
            ],
        );
    }
}
