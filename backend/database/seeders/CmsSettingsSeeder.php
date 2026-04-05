<?php

namespace Database\Seeders;

use App\Models\CmsSetting;
use Illuminate\Database\Seeder;

class CmsSettingsSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['phone', 'email', 'whatsapp', 'logo'] as $key) {
            CmsSetting::query()->firstOrCreate(
                ['key' => $key],
                ['value' => ''],
            );
        }
    }
}
