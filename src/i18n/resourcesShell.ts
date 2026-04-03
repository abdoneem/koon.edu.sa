/** Minimal i18n shell: UI chrome + admin SEO only. All public copy lives in `siteDocument`. */
export const resourcesShell = {
  en: {
    translation: {
      common: {
        loading: "Loading…",
        contentLoadError: "Unable to load the latest content. Showing saved information.",
      },
      language: {
        switcherAria: "Language switcher",
        ariaButtonEn: "English",
        ariaButtonAr: "Arabic",
      },
      imagery: {
        aboutHeroAlt: "Representative image of a contemporary school campus.",
        contactHeroAlt: "Representative image of a contemporary school campus.",
        admissionsHeroAlt: "Welcoming reception area for prospective families.",
        academicsHeroAlt: "Students and teacher in a collaborative classroom discussion.",
        studentLifeHeroAlt: "Outdoor sports field — teamwork and healthy routines.",
        facilitiesHeroAlt: "Bright school corridor with natural light.",
      },
      seo: {
        paths: {
          adminLogin: {
            title: "Admin sign in | KOON",
            description: "Staff access to the KOON content and admissions console.",
          },
          admin: {
            title: "Admin | KOON",
            description: "KOON staff dashboard.",
          },
        },
      },
    },
  },
  ar: {
    translation: {
      imagery: {
        aboutHeroAlt: "صورة تعريفية لحرم مدرسي معاصر.",
        contactHeroAlt: "صورة تعريفية لحرم مدرسي معاصر.",
        admissionsHeroAlt: "استقبال دافئ لاستقبال العائلات المهتمة بالتسجيل.",
        academicsHeroAlt: "طلاب ومعلم في نقاش جماعي داخل الصف.",
        studentLifeHeroAlt: "ملعب رياضي — الانضباط واللياقة.",
        facilitiesHeroAlt: "ممر مدرسي مضيء بضوء النهار.",
      },
      common: {
        loading: "جاري التحميل…",
        contentLoadError: "تعذر تحميل أحدث المحتوى. يُعرض المحتوى المحفوظ.",
      },
      language: {
        switcherAria: "تبديل اللغة",
        ariaButtonEn: "الإنجليزية",
        ariaButtonAr: "العربية",
      },
      seo: {
        paths: {
          adminLogin: {
            title: "دخول الإدارة | كون",
            description: "دخول الموظفين إلى لوحة المحتوى والقبول.",
          },
          admin: {
            title: "الإدارة | كون",
            description: "لوحة تحكم الموظفين.",
          },
        },
      },
    },
  },
} as const
