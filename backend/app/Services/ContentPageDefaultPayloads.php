<?php

namespace App\Services;

/**
 * Canonical seeded payloads for fixed content pages (matches {@see \Database\Seeders\ContentPageSeeder}).
 */
final class ContentPageDefaultPayloads
{
    /**
     * @return array<string, mixed>
     */
    public static function for(string $slug, string $locale): array
    {
        return match ($locale) {
            'ar' => match ($slug) {
                'landing-page' => self::landingAr(),
                'about-page' => self::aboutAr(),
                'admissions-page' => self::admissionsAr(),
                'contact-page' => self::contactAr(),
                default => [],
            },
            default => match ($slug) {
                'landing-page' => self::landingEn(),
                'about-page' => self::aboutEn(),
                'admissions-page' => self::admissionsEn(),
                'contact-page' => self::contactEn(),
                default => [],
            },
        };
    }

    /**
     * @return array<string, mixed>
     */
    private static function landingEn(): array
    {
        return [
            'hero' => [
                'title' => 'KOON Model Bilingual Schools',
                'subtitle' => 'Balanced bilingual education across Madinah (Al Rawabi) and Riyadh — national curriculum with international strands, inquiry, and readiness for what comes next.',
                'primaryCta' => 'Book a tour',
                'secondaryCta' => 'Register now',
                'location' => 'Riyadh — Al Nakhil, King Fahd Road',
            ],
            'programs' => [
                [
                    'id' => 'ey',
                    'name' => 'Early Years (KG)',
                    'description' => 'A joyful beginning focused on language development, play-based learning, and character building.',
                    'annualFee' => '20,000 SAR',
                ],
                [
                    'id' => 'el',
                    'name' => 'Elementary (Grades 1-6)',
                    'description' => 'The foundation of reading, writing, numeracy, and exploration rooted in values.',
                    'annualFee' => '21,000 - 22,500 SAR',
                ],
                [
                    'id' => 'im',
                    'name' => 'Intermediate (Grades 7-9)',
                    'description' => 'A phase of independence, deep critical thinking, and personal growth.',
                    'annualFee' => '24,000 SAR',
                ],
                [
                    'id' => 'se',
                    'name' => 'Secondary (Grades 10-12)',
                    'description' => 'Preparation for higher education through advanced challenges and practical skills.',
                    'annualFee' => '25,000 SAR',
                ],
            ],
            'highlights' => [
                [
                    'id' => 'h1',
                    'title' => 'World-Class Learning',
                    'description' => 'Future-ready education with high academic standards.',
                ],
                [
                    'id' => 'h2',
                    'title' => 'Cultural Roots',
                    'description' => 'Strong values and local identity at the center.',
                ],
                [
                    'id' => 'h3',
                    'title' => 'Lifelong Skills',
                    'description' => 'Leadership, curiosity, and critical thinking every day.',
                ],
                [
                    'id' => 'h4',
                    'title' => 'Meaningful Community',
                    'description' => 'A safe and engaging place where boys belong.',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function landingAr(): array
    {
        return [
            'hero' => [
                'title' => 'مدارس كون النموذجية ثنائية اللغة',
                'subtitle' => 'تعليم ثنائي اللغة متوازن في المدينة المنورة (الروابي) والرياض — منهج وطني مع أبعاد دولية، وتعلّم بالاستقصاء وتجهيز للمرحلة القادمة.',
                'primaryCta' => 'احجز جولة',
                'secondaryCta' => 'سجّل الآن',
                'location' => 'الرياض — حي النخيل، طريق الملك فهد',
            ],
            'programs' => [
                [
                    'id' => 'ey',
                    'name' => 'الطفولة المبكرة (KG)',
                    'description' => 'بداية ممتعة تركز على تنمية اللغة والتعلم باللعب وبناء الشخصية.',
                    'annualFee' => '20,000 ريال',
                ],
                [
                    'id' => 'el',
                    'name' => 'الابتدائية (1-6)',
                    'description' => 'أساس القراءة والكتابة والمهارات الحسابية والاستكشاف المرتبط بالقيم.',
                    'annualFee' => '21,000 - 22,500 ريال',
                ],
                [
                    'id' => 'im',
                    'name' => 'المتوسطة (7-9)',
                    'description' => 'مرحلة للاستقلالية وتعميق التفكير النقدي والنمو الشخصي.',
                    'annualFee' => '24,000 ريال',
                ],
                [
                    'id' => 'se',
                    'name' => 'الثانوية (10-12)',
                    'description' => 'تهيئة للتعليم الجامعي من خلال تحديات أكاديمية متقدمة ومهارات عملية.',
                    'annualFee' => '25,000 ريال',
                ],
            ],
            'highlights' => [
                [
                    'id' => 'h1',
                    'title' => 'مستوى عالمي',
                    'description' => 'جودة تعليم تفتح لابنكم أبواب الجامعات والفرص القادمة.',
                ],
                [
                    'id' => 'h2',
                    'title' => 'أصلٌ وهوية',
                    'description' => 'قيمنا العربية والإسلامية حاضرة، دون أن نغفل فتح آفاق عالمية.',
                ],
                [
                    'id' => 'h3',
                    'title' => 'مهارات تبقى',
                    'description' => 'قيادة، فضول، وتفكير نقدي—نعززها يومياً داخل الصف وخارجه.',
                ],
                [
                    'id' => 'h4',
                    'title' => 'مجتمع حاضن',
                    'description' => 'بيئة آمنة ومحفّزة، يشعر فيها الطالب أنه جزء من فريق حقيقي.',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function aboutEn(): array
    {
        return [
            'title' => 'A School Community Built Around Purpose',
            'description' => 'KOON combines global standards with local values to nurture balanced, curious, and responsible learners.',
            'pillars' => [
                [
                    'id' => 'p1',
                    'title' => 'Academic Excellence',
                    'description' => 'Rigorous curriculum, measurable outcomes, and student-centered teaching.',
                ],
                [
                    'id' => 'p2',
                    'title' => 'Character and Identity',
                    'description' => 'Values-based education that strengthens confidence and belonging.',
                ],
                [
                    'id' => 'p3',
                    'title' => 'Innovation and Future Skills',
                    'description' => 'Critical thinking, collaboration, and digital fluency across all stages.',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function aboutAr(): array
    {
        return [
            'title' => 'مدرسة بروحٍ واضحة',
            'description' => 'في كون نجمع بين رصانة المعايير الدولية وعمق القيم المحلية، لنخرّج طالباً متوازناً، فضولياً بمعنى صحيح، ومسؤولاً تجاه ذاته ومجتمعه.',
            'pillars' => [
                [
                    'id' => 'p1',
                    'title' => 'تميز أكاديمي',
                    'description' => 'منهج متين، ونتائج يمكن قياسها، وتعليم يضع احتياج الطالب في مقدمة القرار.',
                ],
                [
                    'id' => 'p2',
                    'title' => 'شخصية وهوية',
                    'description' => 'نرعى القيم والأخلاق حتى ينمو الطالب واثقاً بانتمائه.',
                ],
                [
                    'id' => 'p3',
                    'title' => 'ابتكار ومهارات الغد',
                    'description' => 'تفكير نقدي، عمل جماعي، واحتراف رقمي—عبر كل المراحل.',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function admissionsEn(): array
    {
        return [
            'title' => 'Admissions Journey',
            'description' => 'A clear and supportive process for parents registering their sons at KOON.',
            'steps' => [
                [
                    'id' => 's1',
                    'title' => 'Submit Inquiry',
                    'description' => 'Share student details and preferred grade level.',
                ],
                [
                    'id' => 's2',
                    'title' => 'Campus Visit',
                    'description' => 'Meet our team, explore facilities, and ask questions.',
                ],
                [
                    'id' => 's3',
                    'title' => 'Assessment and Enrollment',
                    'description' => 'Complete evaluation, confirm placement, and finalize registration.',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function admissionsAr(): array
    {
        return [
            'title' => 'القبول والتسجيل',
            'description' => 'خطوات بسيطة وشفافة لمن يرغب في ضمّ ابنه إلى كون.',
            'steps' => [
                [
                    'id' => 's1',
                    'title' => 'تقديم الطلب',
                    'description' => 'أرسلوا بيانات ابنكم والصف المرغوب، ويتواصل معكم فريق القبول.',
                ],
                [
                    'id' => 's2',
                    'title' => 'زيارة الحرم المدرسي',
                    'description' => 'لقاء الفريق، جولة في المرافق، وإجابة عن كل الأسئلة.',
                ],
                [
                    'id' => 's3',
                    'title' => 'التقييم وإكمال الإجراءات',
                    'description' => 'نقيّم المستوى المناسب، ثم نكمل التسجيل بكل وضوح.',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function contactEn(): array
    {
        return [
            'title' => 'Contact KOON',
            'description' => 'Our admissions and support teams are ready to help.',
            'phone' => '0501050907',
            'email' => 'info@koon.edu.sa',
            'address' => 'Riyadh - Al Nakhil, King Fahd Road',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function contactAr(): array
    {
        return [
            'title' => 'تواصل معنا',
            'description' => 'قبولٌ ودعمٌ—نرد على استفساراتكم بأسرع ما يمكن.',
            'phone' => '0501050907',
            'email' => 'info@koon.edu.sa',
            'address' => 'الرياض - حي النخيل، طريق الملك فهد',
        ];
    }
}
