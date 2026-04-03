import type { HomePageBundle } from "../types/homePageBundle"
import type { Locale } from "../types/cms"
import { photoUrls } from "./photoUrls"

const AR: HomePageBundle = {
  hero: {
    title: "مدارس كون الأهلية",
    subtitle: "تعليم عال الجودة بثنائية لغوية متوازنة، وبيئة تربوية راسخة القيم.",
    primaryCta: "سجّل الآن",
    secondaryCta: "آخر الأخبار",
    location: "الرياض، المملكة العربية السعودية",
    trustLine: "بيئة آمنة • معلمون مؤهلون • مسارات أكاديمية واضحة",
  },
  stats: [
    { value: "+15", label: "عاماً من الخبرة التربوية" },
    { value: "K–12", label: "استمرارية تعليمية" },
    { value: "1:1", label: "دعم لغوي عربيّ وإنجليزيّ" },
  ],
  programs: [
    {
      id: "p1",
      name: "المراحل التأسيسية والابتدائية",
      description: "بناء المهارات الأساسية في القراءة والتعبير مع أنشطة متوازنة تنمّي الفضول وحبّ التعلّم.",
      annualFee: "الرسوم حسب المرحلة — يطلب التفاصيل من القبول",
    },
    {
      id: "p2",
      name: "المسار العلمي",
      description: "إعداد قوي في العلوم والرياضيات ومهارات التفكير المنطقي والبحث.",
      annualFee: "الرسوم حسب المرحلة — يطلب التفاصيل من القبول",
    },
    {
      id: "p3",
      name: "المسار الأدبي والإنساني",
      description: "تعزيز التعبير العربي والإنجليزي، والاطلاع، والفهم النقدي عبر المواد الإنسانية.",
      annualFee: "الرسوم حسب المرحلة — يطلب التفاصيل من القبول",
    },
    {
      id: "p4",
      name: "برنامج STEM",
      description: "مشاريع تطبيقية وتجارب مختبرية تربط المفاهيم بالحياة اليومية.",
      annualFee: "الرسوم حسب المرحلة — يطلب التفاصيل من القبول",
    },
    {
      id: "p5",
      name: "اللغات والثقافات",
      description: "تعزيز التواصل بلغتين مع احترام الهوية الوطنية والانفتاح الثقافي.",
      annualFee: "ضمن البرنامج الاعتيادي",
    },
    {
      id: "p6",
      name: "الأنشطة والمواهب",
      description: "رياضة، فنون، وقيم حضورية لتكوين شخصية متوازنة.",
      annualFee: "حسب النشاط",
    },
  ],
  highlights: [
    {
      id: "h1",
      title: "تميّز أكاديمي",
      description: "مناهج متدرجة ومتابعة فردية تدعم كل طفل على وتيرته.",
    },
    {
      id: "h2",
      title: "ثنائية لغوية",
      description: "عربية قوية وإنجليزية فاعلة في إطار أهداف تعليمية واضحة.",
    },
    {
      id: "h3",
      title: "قيم وتربية",
      description: "التزام بالأخلاق والانضباط والاحترام داخل المدرسة ومع الأسرة.",
    },
    {
      id: "h4",
      title: "شراكة مع الأهل",
      description: "قنوات تواصل منتظمة لدعم التقدم الأكاديمي والاجتماعي.",
    },
  ],
  news: [
    {
      id: "n1",
      title: "افتتاح التسجيل للعام الدراسي القادم",
      excerpt: "تعلن الإدارة عن استقبال طلبات التسجيل المبدئي، مع مواعيد زيارة ميدانية للأهل.",
      date: "2026/03/01",
      image: photoUrls.hallwayBright,
    },
    {
      id: "n2",
      title: "أسبوع الابتكار المدرسي",
      excerpt: "معرض مشاريع يقدمه الطلاب بالتعاون مع المعلمين في إطار برنامج STEM.",
      date: "2026/02/20",
      image: photoUrls.scienceLab,
    },
    {
      id: "n3",
      title: "فعاليات اليوم الوطني",
      excerpt: "فعاليات ثقافية وفنية تعكس قيم المواطنة والفخر بالهوية.",
      date: "2026/02/12",
      image: photoUrls.artsMusic,
    },
  ],
  gallery: [
    {
      id: "g1",
      src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80",
      alt: "صف دراسي حديث",
      caption: "صفوف تعلم نشِطة وتنظيم بصري هادئ",
    },
    {
      id: "g2",
      src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
      alt: "طلاب يتعاونون",
      caption: "تعلّم تعاوني ومهارات القرن الحادي والعشرين",
    },
    {
      id: "g3",
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
      alt: "حدث تخرج",
      caption: "احتفالات تكريم تليق بإنجازات الطلاب",
    },
    {
      id: "g4",
      src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=900&q=80",
      alt: "مكتبة مدرسية",
      caption: "بيئة قراءة وهدوء لدعم التحصيل",
    },
  ],
  partners: [
    { id: "pt1", name: "وزارة التعليم — متابعة إجرائية", abbreviation: "ت" },
    { id: "pt2", name: "شهادات معترف بها محلياً", abbreviation: "ع" },
    { id: "pt3", name: "شراكات تدريب للمعلمين", abbreviation: "ش" },
    { id: "pt4", name: "برامج تطوير مهني مستمر", abbreviation: "ب" },
    { id: "pt5", name: "مجتمع أهلي فاعل", abbreviation: "م" },
  ],
  admissionSteps: [
    {
      id: "s1",
      title: "تقديم الطلب",
      description: "إكمال الاستمارة عبر قناة التسجيل الإلكتروني أو زيارة قسم القبول.",
    },
    {
      id: "s2",
      title: "مقابلة توجيهية",
      description: "للتعرّف على الطالب واحتياجاته وتنسيق الخطة المناسبة.",
    },
    {
      id: "s3",
      title: "القرار والتسجيل",
      description: "إصدار القبول المبدئي ثم استكمال الوثائق والرسوم حتى تأكيد المقعد.",
    },
  ],
  articlesSectionLead: "نختار لكم مقالات عملية حول التعلّم، التوازن، والشراكة مع المدرسة — بأسلوب أكاديمي مبسّط.",
  articleCards: [
    {
      id: "a1",
      title: "كيف ندعم القراءة المبكرة في البيت والمدرسة معاً؟",
      excerpt: "نصائح عملية للأهل لتقوية عادة القراءة بلغتين دون ضغط.",
      meta: "٣ دقائق قراءة · التربية",
    },
    {
      id: "a2",
      title: "التوازن بين الأنشطة اللامنهجية والتحصيل",
      excerpt: "جدولة ذكية تُبقي الطالب متفتحاً دون إرهاق.",
      meta: "٤ دقائق قراءة · الطلاب",
    },
    {
      id: "a3",
      title: "أهمية الحضور المنتظم وبناء الروتين",
      excerpt: "لماذا الانتظام اليومي ركيزة للنجاح الأكاديمي والاجتماعي؟",
      meta: "٣ دقائق قراءة · الأسرة",
    },
  ],
  excellence: {
    title: "ركن التميز",
    body:
      "نكرّم نتائج طلابنا عبر مناشط شهرية ولوحات تكريم تركز على الجهد والتحسن المستمر، لا على المقارنة السلبية.",
    bullets: ["تكريم شهري للتميز الأكاديمي", "مبادرات خدمة مجتمعية طلابية", "مسابقات علمية وفنية مراقَبة"],
  },
  policyBullets: [
    "الرسوم والخدمات: يُفسَّر التفصيل عند القبول ويُثبَّت في العقد.",
    "أعمار الصفوف بمواءمة مع ضوابط التعليم الرسمي.",
    "الوثائق: هوية/سجل، تقارير، وسجلات صحية عند الحاجة.",
  ],
  virtualTour: {
    note: "جولة بزاوية ٣٦٠° قيد التحديث؛ يمكنكم حجز زيارة ميدانية الآن من قسم «احجز جولة» أدناه.",
  },
  mediaTicker: [
    "مرحباً بكم في بوابة مدارس كون",
    "التسجيل مفتوح — للاستفسار تواصل مع القبول",
    "ثنائية لغوية وجودة تعليمية",
    "شراكة مستمرة مع أسرنا",
  ],
}

const EN: HomePageBundle = {
  hero: {
    title: "Koon Private Schools",
    subtitle: "High-quality bilingual education in a values-driven learning environment.",
    primaryCta: "Apply now",
    secondaryCta: "Latest news",
    location: "Riyadh, Saudi Arabia",
    trustLine: "Safe campus • Qualified educators • Clear academic pathways",
  },
  stats: [
    { value: "15+", label: "Years of educational experience" },
    { value: "K–12", label: "Continuity across stages" },
    { value: "1:1", label: "Arabic & English support" },
  ],
  programs: [
    {
      id: "p1",
      name: "Foundation & elementary",
      description:
        "Core literacy and numeracy with balanced activities that nurture curiosity and confident learners.",
      annualFee: "Fees by grade — contact admissions",
    },
    {
      id: "p2",
      name: "Science track",
      description:
        "Strong preparation in science, mathematics, logical reasoning and guided inquiry.",
      annualFee: "Fees by grade — contact admissions",
    },
    {
      id: "p3",
      name: "Arts & humanities track",
      description:
        "Arabic eloquence and humanities with critical reading, writing and discussion.",
      annualFee: "Fees by grade — contact admissions",
    },
    {
      id: "p4",
      name: "STEM programme",
      description: "Applied labs and projects linking scientific concepts to authentic problems.",
      annualFee: "Fees by grade — contact admissions",
    },
    {
      id: "p5",
      name: "Languages & cultures",
      description: "Bilingual communication rooted in national identity and cultural literacy.",
      annualFee: "Included in the standard programme",
    },
    {
      id: "p6",
      name: "Activities & talent",
      description: "Sports, arts and leadership routines for a balanced school life.",
      annualFee: "Activity-dependent",
    },
  ],
  highlights: [
    {
      id: "h1",
      title: "Academic excellence",
      description: "Structured progression with individual support at each level.",
    },
    {
      id: "h2",
      title: "Bilingual learning",
      description: "Arabic and English with clear learning objectives.",
    },
    {
      id: "h3",
      title: "Character",
      description: "Respect, discipline and integrity at school and home.",
    },
    {
      id: "h4",
      title: "Family partnership",
      description: "Regular communication on academic and social progress.",
    },
  ],
  news: [
    {
      id: "n1",
      title: "Enrolment opens for the next academic year",
      excerpt: "Applications and scheduled campus visits for families.",
      date: "2026-03-01",
      image: photoUrls.hallwayBright,
    },
    {
      id: "n2",
      title: "Innovation week showcase",
      excerpt: "Student STEM projects presented with faculty guidance.",
      date: "2026-02-20",
      image: photoUrls.scienceLab,
    },
    {
      id: "n3",
      title: "National Day celebrations",
      excerpt: "Cultural and arts activities reflecting citizenship values.",
      date: "2026-02-12",
      image: photoUrls.artsMusic,
    },
  ],
  gallery: AR.gallery,
  partners: [
    { id: "pt1", name: "Ministry alignment — procedural", abbreviation: "M" },
    { id: "pt2", name: "Nationally recognised certifications", abbreviation: "C" },
    { id: "pt3", name: "Teacher training partners", abbreviation: "T" },
    { id: "pt4", name: "Continuous professional development", abbreviation: "P" },
    { id: "pt5", name: "Active parent community", abbreviation: "F" },
  ],
  admissionSteps: [
    {
      id: "s1",
      title: "Submit application",
      description: "Complete the online form or visit the admissions office.",
    },
    {
      id: "s2",
      title: "Orientation meeting",
      description: "Understand your child’s profile and suitable placement.",
    },
    {
      id: "s3",
      title: "Offer & enrolment",
      description: "Provisional offer, documents and fees to confirm the seat.",
    },
  ],
  articlesSectionLead:
    "Practical reads on learning, balance, and family–school partnership—in a clear, academic tone.",
  articleCards: [
    {
      id: "a1",
      title: "Supporting early reading at home and school",
      excerpt: "Practical tips for families in two languages, without pressure.",
      meta: "3 min read · Education",
    },
    {
      id: "a2",
      title: "Balancing co-curriculars and achievement",
      excerpt: "Smart scheduling that keeps learners engaged, not overloaded.",
      meta: "4 min read · Students",
    },
    {
      id: "a3",
      title: "Attendance and routine building",
      excerpt: "Why daily consistency matters academically and socially.",
      meta: "3 min read · Families",
    },
  ],
  excellence: {
    title: "Excellence corner",
    body: "We celebrate effort and growth through monthly showcases and boards that highlight improvement, not negative comparison.",
    bullets: ["Monthly academic recognition", "Student-led community initiatives", "Supervised contests"],
  },
  virtualTour: {
    note: "360° campus tour is being refreshed — book an on-site visit below.",
  },
  policyBullets: [
    "Fees and services are detailed at offer stage and confirmed in the contract.",
    "Grade ages align with national placement guidance.",
    "Documents: ID/records, transcripts, and health files as applicable.",
  ],
  mediaTicker: [
    "Welcome to Koon Schools portal",
    "Enrolment open — contact admissions for details",
    "Bilingual quality you can trust",
    "Strong partnership with our families",
  ],
}

export function getHomePageBundleDefaults(locale: Locale): HomePageBundle {
  return locale === "ar" ? structuredClone(AR) : structuredClone(EN)
}
