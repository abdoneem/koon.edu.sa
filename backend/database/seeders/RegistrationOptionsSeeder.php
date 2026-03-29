<?php

namespace Database\Seeders;

use App\Models\RegistrationGrade;
use App\Models\RegistrationGradeTranslation;
use App\Models\RegistrationNationality;
use App\Models\RegistrationNationalityTranslation;
use Illuminate\Database\Seeder;

class RegistrationOptionsSeeder extends Seeder
{
    public function run(): void
    {
        RegistrationGradeTranslation::query()->delete();
        RegistrationNationalityTranslation::query()->delete();
        RegistrationGrade::query()->delete();
        RegistrationNationality::query()->delete();

        foreach ($this->grades() as $order => $row) {
            $g = RegistrationGrade::query()->create([
                'code' => $row['code'],
                'sort_order' => $order,
                'is_active' => true,
            ]);
            $g->translations()->createMany([
                ['locale' => 'ar', 'name' => $row['ar']],
                ['locale' => 'en', 'name' => $row['en']],
            ]);
        }

        foreach ($this->nationalities() as $order => $row) {
            $n = RegistrationNationality::query()->create([
                'code' => $row['code'],
                'sort_order' => $order,
                'is_active' => true,
            ]);
            $n->translations()->createMany([
                ['locale' => 'ar', 'name' => $row['ar']],
                ['locale' => 'en', 'name' => $row['en']],
            ]);
        }
    }

    /**
     * @return list<array{code: string, ar: string, en: string}>
     */
    private function grades(): array
    {
        return [
            ['code' => 'kg1', 'ar' => 'تمهيدي - أول', 'en' => 'KG — Year 1'],
            ['code' => 'kg2', 'ar' => 'تمهيدي - ثاني', 'en' => 'KG — Year 2'],
            ['code' => 'kg3', 'ar' => 'تمهيدي - ثالث', 'en' => 'KG — Year 3'],
            ['code' => 'primary1', 'ar' => 'المرحلة الابتدائية - أول', 'en' => 'Elementary — Grade 1'],
            ['code' => 'primary2', 'ar' => 'المرحلة الابتدائية - ثاني', 'en' => 'Elementary — Grade 2'],
            ['code' => 'primary3', 'ar' => 'المرحلة الابتدائية - ثالث', 'en' => 'Elementary — Grade 3'],
            ['code' => 'primary4', 'ar' => 'المرحلة الابتدائية - رابع', 'en' => 'Elementary — Grade 4'],
            ['code' => 'primary5', 'ar' => 'المرحلة الابتدائية - خامس', 'en' => 'Elementary — Grade 5'],
            ['code' => 'primary6', 'ar' => 'المرحلة الابتدائية - سادس', 'en' => 'Elementary — Grade 6'],
            ['code' => 'middle1', 'ar' => 'المرحلة المتوسطة - أول', 'en' => 'Middle — Year 1'],
            ['code' => 'middle2', 'ar' => 'المرحلة المتوسطة - ثاني', 'en' => 'Middle — Year 2'],
            ['code' => 'middle3', 'ar' => 'المرحلة المتوسطة - ثالث', 'en' => 'Middle — Year 3'],
            ['code' => 'high1', 'ar' => 'المرحلة الثانوية - أول', 'en' => 'High school — Year 1'],
            ['code' => 'high2', 'ar' => 'المرحلة الثانوية - ثاني', 'en' => 'High school — Year 2'],
            ['code' => 'high3', 'ar' => 'المرحلة الثانوية - ثالث', 'en' => 'High school — Year 3'],
        ];
    }

    /**
     * @return list<array{code: string, ar: string, en: string}>
     */
    private function nationalities(): array
    {
        return [
            ['code' => 'saudi', 'ar' => 'سعودي', 'en' => 'Saudi'],
            ['code' => 'egyptian', 'ar' => 'مصري', 'en' => 'Egyptian'],
            ['code' => 'emirati', 'ar' => 'إماراتي', 'en' => 'Emirati'],
            ['code' => 'kuwaiti', 'ar' => 'كويتي', 'en' => 'Kuwaiti'],
            ['code' => 'qatari', 'ar' => 'قطري', 'en' => 'Qatari'],
            ['code' => 'bahraini', 'ar' => 'بحريني', 'en' => 'Bahraini'],
            ['code' => 'omani', 'ar' => 'عماني', 'en' => 'Omani'],
            ['code' => 'jordanian', 'ar' => 'أردني', 'en' => 'Jordanian'],
            ['code' => 'palestinian', 'ar' => 'فلسطيني', 'en' => 'Palestinian'],
            ['code' => 'sudanese', 'ar' => 'سوداني', 'en' => 'Sudanese'],
            ['code' => 'moroccan', 'ar' => 'مغربي', 'en' => 'Moroccan'],
            ['code' => 'tunisian', 'ar' => 'تونسي', 'en' => 'Tunisian'],
            ['code' => 'algerian', 'ar' => 'جزائري', 'en' => 'Algerian'],
            ['code' => 'iraqi', 'ar' => 'عراقي', 'en' => 'Iraqi'],
            ['code' => 'syrian', 'ar' => 'سوري', 'en' => 'Syrian'],
            ['code' => 'lebanese', 'ar' => 'لبناني', 'en' => 'Lebanese'],
            ['code' => 'yemeni', 'ar' => 'يمني', 'en' => 'Yemeni'],
            ['code' => 'libyan', 'ar' => 'ليبي', 'en' => 'Libyan'],
            ['code' => 'mauritanian', 'ar' => 'موريتاني', 'en' => 'Mauritanian'],
            ['code' => 'somali', 'ar' => 'صومالي', 'en' => 'Somali'],
            ['code' => 'djiboutian', 'ar' => 'جيبوتي', 'en' => 'Djiboutian'],
            ['code' => 'comorian', 'ar' => 'جزر القمر', 'en' => 'Comorian'],
            ['code' => 'turkish', 'ar' => 'تركي', 'en' => 'Turkish'],
            ['code' => 'iranian', 'ar' => 'إيراني', 'en' => 'Iranian'],
            ['code' => 'pakistani', 'ar' => 'باكستاني', 'en' => 'Pakistani'],
            ['code' => 'afghan', 'ar' => 'أفغاني', 'en' => 'Afghan'],
            ['code' => 'indonesian', 'ar' => 'إندونيسي', 'en' => 'Indonesian'],
            ['code' => 'malaysian', 'ar' => 'ماليزي', 'en' => 'Malaysian'],
            ['code' => 'bangladeshi', 'ar' => 'بنغلاديشي', 'en' => 'Bangladeshi'],
            ['code' => 'indian', 'ar' => 'هندي', 'en' => 'Indian'],
            ['code' => 'chinese', 'ar' => 'صيني', 'en' => 'Chinese'],
            ['code' => 'american', 'ar' => 'أمريكي', 'en' => 'American'],
            ['code' => 'british', 'ar' => 'بريطاني', 'en' => 'British'],
            ['code' => 'french', 'ar' => 'فرنسي', 'en' => 'French'],
            ['code' => 'german', 'ar' => 'ألماني', 'en' => 'German'],
            ['code' => 'canadian', 'ar' => 'كندي', 'en' => 'Canadian'],
            ['code' => 'russian', 'ar' => 'روسي', 'en' => 'Russian'],
            ['code' => 'spanish', 'ar' => 'إسباني', 'en' => 'Spanish'],
            ['code' => 'italian', 'ar' => 'إيطالي', 'en' => 'Italian'],
            ['code' => 'australian', 'ar' => 'أسترالي', 'en' => 'Australian'],
            ['code' => 'southafrican', 'ar' => 'جنوب أفريقي', 'en' => 'South African'],
            ['code' => 'brazilian', 'ar' => 'برازيلي', 'en' => 'Brazilian'],
            ['code' => 'mexican', 'ar' => 'مكسيكي', 'en' => 'Mexican'],
            ['code' => 'other', 'ar' => 'أخرى', 'en' => 'Other'],
        ];
    }
}
