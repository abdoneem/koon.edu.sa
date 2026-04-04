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
      name: "الطفولة المبكرة (رياض الأطفال والصفوف الدنيا)",
      description:
        "استكشاف وارتباط عاطفي؛ نور البيان؛ وحدات قصيرة؛ ملاحظة وتعزيز—بمواءمة توقعات المرحلة التأسيسية الوطنية.",
      annualFee: "الرسوم حسب المرحلة — يطلب التفاصيل من القبول",
    },
    {
      id: "p2",
      name: "الابتدائية (4–6)",
      description:
        "ثلاثية كون (تهيئة–بناء–تطبيق)، تعلم تعاوني، مختبر صفي، وروتينات تحليلية مبكرة بموازاة المعايير الوطنية.",
      annualFee: "الرسوم حسب المرحلة — يطلب التفاصيل من القبول",
    },
    {
      id: "p3",
      name: "المتوسطة (7–9)",
      description:
        "تعلم قائم على المشكلات، مقدمات تخصصية، وحقائب قدرات وتحصيلي مدمجة في الجدول الدراسي.",
      annualFee: "الرسوم حسب المرحلة — يطلب التفاصيل من القبول",
    },
    {
      id: "p4",
      name: "الثانوية (10–12)",
      description:
        "مسارات متقدمة، إعداد مكثف للاختبارات الوطنية، وجاهزية دولية حيث ينطبق، مع حوكمة تحترم كرامة المتعلم.",
      annualFee: "الرسوم حسب المرحلة — يطلب التفاصيل من القبول",
    },
    {
      id: "p5",
      name: "الثنائية اللغوية ومواءمة المنهج",
      description:
        "عربية للهوية والإنسانيات؛ STEM بامتداد إنجليزي ومسارات دولية؛ إكساب مكثف للإنجليزية في المراحل العليا.",
      annualFee: "ضمن البرنامج الاعتيادي",
    },
    {
      id: "p6",
      name: "STEM والفنون والقيادة",
      description:
        "مختبرات ومشاريع وفنون وأندية—متسقة مع العمود الفقري الأكاديمي لا كإضافة مزدحمة للتقويم.",
      annualFee: "حسب النشاط",
    },
  ],
  highlights: [
    {
      id: "h1",
      title: "الأصالة والمواطنة",
      description:
        "قيم إسلامية وهوية وطنية كأساس، ثم تمكين الطالب بثنائية اللغة والانفتاح الواعي ليكون مواطناً عالمياً مؤثراً.",
    },
    {
      id: "h2",
      title: "التمكين والأثر",
      description:
        "«المعلم أولاً» بدعم وإشراف تطوري مستمر، لتوجيه الجهود نحو فهم عميق ونواتج تعلّم حقيقية.",
    },
    {
      id: "h3",
      title: "الإتقان والابتكار",
      description:
        "السعي للجودة في كل حصة، وتشجيع التفكير الإبداعي والمبادرات التي تصنع قادة المستقبل.",
    },
    {
      id: "h4",
      title: "الشفافية والشراكة",
      description:
        "وضوح في البيانات ومؤشرات الأداء مع القيادة، وشراكة راسخة مع الأسرة مبنية على الأرقام والنتائج.",
    },
    {
      id: "h5",
      title: "المرونة التشغيلية",
      description: "هندسة العمليات الإدارية لتكون داعمة بالكامل للخطة الأكاديمية دون بيروقراطية عقيمة.",
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
      src: photoUrls.campusExterior,
      alt: "مبنى المدرسة والحرم",
      caption: "حرم مدرسي معاصر يدعم التعلّم والانتماء",
      mediaKind: "image",
    },
    {
      id: "g2",
      src: photoUrls.campusWalkway,
      alt: "ممرات ومساحات الحرم",
      caption: "بيئة منظّمة وآمنة للتنقّل والتفاعل اليومي",
      mediaKind: "image",
    },
    {
      id: "g3",
      src: photoUrls.receptionLobby,
      alt: "استقبال ومساحات الترحيب",
      caption: "نقطة لقاء دافئة للعائلات والزوار",
      mediaKind: "video",
    },
    {
      id: "g4",
      src: photoUrls.hallwayBright,
      alt: "ممرات ومداخل تعليمية",
      caption: "إضاءة وتصميم يدعمان جواً تعليمياً هادئاً",
      mediaKind: "image",
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
      name: "Early childhood (KG & lower primary)",
      description:
        "Exploration, Noor Al-Bayan, short learning cycles, and observation-led growth—aligned to national early-years expectations.",
      annualFee: "Fees by grade — contact admissions",
    },
    {
      id: "p2",
      name: "Primary (grades 4–6)",
      description:
        "Koon triad (prime–build–apply), collaborative learning, in-class lab, and early analytical routines alongside national standards.",
      annualFee: "Fees by grade — contact admissions",
    },
    {
      id: "p3",
      name: "Middle school (grades 7–9)",
      description:
        "Problem-based learning, specialised foundations, and Qudurat/Tahsili preparation integrated into the weekly timetable.",
      annualFee: "Fees by grade — contact admissions",
    },
    {
      id: "p4",
      name: "High school (grades 10–12)",
      description:
        "Advanced tracks, intensive national exam preparation, international readiness where applicable, and governance that protects learner dignity.",
      annualFee: "Fees by grade — contact admissions",
    },
    {
      id: "p5",
      name: "Bilingual & curriculum alignment",
      description:
        "Arabic anchors identity and humanities; STEM extends in English with international strands; intensive English acquisition in upper grades.",
      annualFee: "Included in the standard programme",
    },
    {
      id: "p6",
      name: "STEM, arts & leadership",
      description:
        "Labs, projects, arts and clubs—coherent with the academic spine, not a crowded add-on calendar.",
      annualFee: "Activity-dependent",
    },
  ],
  highlights: [
    {
      id: "h1",
      title: "Authenticity & citizenship",
      description:
        "Islamic values and Saudi identity as the base; bilingual communication and mindful openness so learners compete and contribute globally.",
    },
    {
      id: "h2",
      title: "Empowerment & impact",
      description:
        "Teachers first—continuous developmental support so every effort targets deep understanding and real learning outcomes.",
    },
    {
      id: "h3",
      title: "Mastery & innovation",
      description:
        "We pursue excellence and quality in every lesson, encouraging creative thinking and initiatives that shape future leaders.",
    },
    {
      id: "h4",
      title: "Transparency & partnership",
      description:
        "Clear data and performance indicators with leadership; numbers-based partnership with families on each learner’s journey.",
    },
    {
      id: "h5",
      title: "Operational agility",
      description:
        "Lean processes: administrative workflows engineered to support the academic plan—not slow it down.",
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
  gallery: [
    {
      id: "g1",
      src: photoUrls.campusExterior,
      alt: "School campus and buildings",
      caption: "A contemporary campus designed for learning and belonging",
      mediaKind: "image",
    },
    {
      id: "g2",
      src: photoUrls.campusWalkway,
      alt: "Walkways and circulation spaces",
      caption: "Clear, calm routes for daily movement and connection",
      mediaKind: "image",
    },
    {
      id: "g3",
      src: photoUrls.receptionLobby,
      alt: "Reception and welcome areas",
      caption: "A welcoming first touchpoint for families and visitors",
      mediaKind: "video",
    },
    {
      id: "g4",
      src: photoUrls.hallwayBright,
      alt: "Interior corridors and learning adjacencies",
      caption: "Bright, orderly spaces that support focus and routine",
      mediaKind: "image",
    },
  ],
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
