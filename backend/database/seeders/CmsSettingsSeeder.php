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

        foreach ([
            'nav_tree_en' => self::navTreeEnJson(),
            'nav_tree_ar' => self::navTreeArJson(),
        ] as $key => $json) {
            CmsSetting::query()->firstOrCreate(
                ['key' => $key],
                ['value' => $json],
            );
        }
    }

    private static function navTreeEnJson(): string
    {
        $data = [
            ['id' => 'about', 'label' => 'About us', 'href' => '/about'],
            ['id' => 'academics', 'label' => 'Academics', 'href' => '/academics'],
            ['id' => 'student-life', 'label' => 'Student life', 'href' => '/student-life'],
            ['id' => 'admissions', 'label' => 'Admissions', 'href' => '/admissions'],
            ['id' => 'contact', 'label' => 'Contact', 'href' => '/contact'],
        ];

        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }

    private static function navTreeArJson(): string
    {
        $data = [
            ['id' => 'about', 'label' => 'عن المدرسة', 'href' => '/about'],
            ['id' => 'academics', 'label' => 'البرامج الأكاديمية', 'href' => '/academics'],
            ['id' => 'student-life', 'label' => 'الحياة المدرسية', 'href' => '/student-life'],
            ['id' => 'admissions', 'label' => 'القبول والتسجيل', 'href' => '/admissions'],
            ['id' => 'contact', 'label' => 'تواصل معنا', 'href' => '/contact'],
        ];

        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }
}
