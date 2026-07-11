import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Rich Translation Dictionary for Arabic & English
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Top Info Bar & Common Header
    "student_portal_btn": "بوابة الطالب الأكاديمية",
    "apply_online_btn": "طلب تقديم إلكتروني ✉️",
    "arabic": "العربية",
    "english": "English",
    "established_title": "تأسس عام",
    "established_desc": "تأسس عام 1975 م • مرخص ومعادل من المجلس الأعلى للجامعات",
    "years_title": "تاريخ التأسيس",
    "depts_count": "أقسام علمية",
    "accredited_ratio": "شهادة معتمدة حكومياً",
    "ar_institute_name": "المعهد العالي للخدمة الاجتماعية بأسوان",
    "en_institute_name": "Aswan Higher Institute for Social Work",
    "governorate": "محافظة أسوان",
    "address_text": "أسوان، شارع كسر الحجر، بميدان الإشارة، بجوار مسجد أبو شوك",
    "phone_text": "اتصل بنا",
    "fax_text": "الفاكس الرسمي",
    
    // Navigation Links
    "nav_home": "الرئيسية",
    "nav_about": "عن المعهد",
    "nav_dean-message": "كلمة عميد المعهد",
    "nav_departments": "أقسام المعهد",
    "nav_units": "الوحدات والمراكز",
    "nav_programs": "البرامج التعليمية",
    "nav_portal": "بوابة الطالب الذكية",
    "nav_exams": "جداول الامتحانات",
    "nav_guide": "دليل المعهد",
    "nav_faq": "الأسئلة الشائعة",
    "nav_contact": "اتصل بنا",
    "nav_admin": "لوحة التحكم ⚙️",

    // Banner Help & FAQ Banner
    "help_banner_badge": "هل لديك أي استفسار عاجل؟",
    "help_banner_title": "دليل الإجابات والأسئلة الشائعة لأولياء الأمور والطلاب الجدد ⚡",
    "help_banner_desc": "جمعنا لكم أكثر من 30 سؤالاً وجواباً رسمياً معتمداً من إدارة المعهد ووزارة التعليم العالي بخصوص شروط القبول، المصروفات، التدريب العملي الميداني، والنتائج!",
    "help_banner_btn": "تصفح دليل الأسئلة الشائعة الآن 📚",

    // Dean Message & Main Cards
    "dean_badge": "منظومة التعليم العالي",
    "dean_title": "رسالة إدارة المعهد الأكاديمية",
    "dean_desc": "نحرص في معهد أسوان على المزج الدائم بين مخرجات التكنولوجيا والمنهج الأكاديمي الصارم لنخرج للمجتمع المصري أخصائيين ملمين بآليات الدعم النفسي والتدخل المهني المحترف.",
    "dean_btn": "اقرأ المزيد عن الإدارة",
    
    "research_badge": "البحوث والمؤتمرات السنوية",
    "research_title": "الملتقى السنوي للخدمة بأسوان",
    "research_desc": "نعقد وندير دورياً بأسوان ندوات ومناقشات حول الأثر البيئي والتكافل والتنمية الأسرية في صعيد مصر، لربط المعرفة المأخوذة من الكتب بالواقع الميداني والبحوث المنشورة.",
    "research_btn": "تصفح الأبحاث المنشورة",

    "digital_badge": "الجودة والامتياز الدراسي",
    "digital_title": "خدمات الطلاب الرقمية المتكاملة",
    "digital_desc": "عبر كارت الطالب الذكي وتحديثات النتائج، نسعى لتسخير أفضل آليات الدعم الرقمي لمساعدة أولياء الأمور والطلاب على متابعة درجات الاختبارات وفترات التدريب الميداني بسهولة.",
    "digital_btn": "افتح بوابة النتائج",

    // Research Publications
    "last_papers_title": "آخر الأوراق والأبحاث المنشورة بالمعهد",
    "last_papers_subtitle": "نساهم بشكل عملي في تنمية مجتمعات الصعيد عبر أبحاث الكادر التعليمي",

    // News Ticker
    "ticker_title": "الأخبار العاجلة والقرارات الهامة 🔥",

    // Quick Actions
    "qa_section_badge": "بوابة الخدمات الرقمية السريعة",
    "qa_section_title": "لوحة الخدمات السريعة لطلاب معهد الخدمة بأسوان 🎓",
    "qa_section_desc": "أنجز معاملاتك الأكاديمية وتابع نتائج الاختبارات، رسوم التسجيل، وأماكن التدريب الميداني فورياً ودون عناء.",
    "qa_results_title": "نتائج الطلاب والامتحانات",
    "qa_results_desc": "استعلام فوري وتفصيلي بالرقم القومي للنتائج الدراسية المعتمدة.",
    "qa_register_title": "طلب التسجيل والقبول",
    "qa_register_desc": "قدم طلب الالتحاق إلكترونياً بالمعهد من خلال نموذج البيانات والدرجات.",
    "qa_location_title": "الموقع الجغرافي للمقر",
    "qa_location_desc": "خرائط تفاعلية توضح كيفية الوصول للمعهد بوسط أسوان.",
    "qa_faq_title": "دليل الأسئلة الشائعة",
    "qa_faq_desc": "إجابات متكاملة لكافة التساؤلات بخصوص المصروفات والتحويلات.",
    "qa_depts_title": "أقسام المعهد التدريبية",
    "qa_depts_desc": "تعرف على الأقسام الأكاديمية ولائحة المقررات والتعليم الميداني.",
    "qa_library_title": "المكتبة والكتب الدراسية",
    "qa_library_desc": "تصفح مستجدات المراجع ومواصفات تسليم كارت الطالب وبنك المعرفة.",

    // Stats Overlay
    "stats_section_badge": "المعهد العالي للخدمة الاجتماعية بأسوان في أرقام ⚡",
    "stats_section_title": "إنجازات تاريخية وأرقام مضيئة تفخر بها العمادة",
    "stats_section_desc": "نعمل بلا كلل لضمان التفوق الأكاديمي والمدد البحثي، وهذا حصاد مسيرتنا الممتدة في خدمة التنمية المحلية بمحافظة أسوان وصعيد مصر بأكمله.",
    "stats_stat1_title": "عام التأسيس العريق",
    "stats_stat1_desc": "نصف قرن من الريادة الأكاديمية بالصعيد",
    "stats_stat2_title": "خريج وخريجة مقيدين بالنقابة",
    "stats_stat2_desc": "يقودون مسيرة الرعاية والتمكين الاجتماعي بمصر",
    "stats_stat3_title": "من قامات التدريس والباحثين",
    "stats_stat3_desc": "نخبة من أساتذة الخدمة الاجتماعية والعلوم المساعدة",
    "stats_stat4_title": "مؤسسة تدريبية شريكة بأسوان",
    "stats_stat4_desc": "تغطية ميدانية شاملة في المدارس والمستشفيات والمؤسسات الأهلية والخاصة",

    // Services Section
    "services_badge": "المنصات الخدمية الذكية للمعهد",
    "services_title": "خدماتنا الرقمية والأكاديمية المتكاملة ⚙️",
    "services_desc": "نسخر التكنولوجيا الحديثة لتيسير تجربة التعليم وبناء منصات ريادية لزيادة تفاعل الطلاب، دعم الباحثين، وضمان الشفافية والتواصل المباشر مع أولياء الأمور بأسوان.",
    "services_go": "الذهاب للخدمة الآن",
    "services_btn_details": "تفاصيل الخدمة 📄",
    "srv_accredited_badge": "تفاصيل الاعتماد والتشغيل:",
    "srv_accredited_text": "هذه المنظومة معتمدة إدارياً وتقنياً وخادمة للطلاب وأولياء الأمور للارتقاء بجودة العملية التعليمية داخل المعهد بأسوان لعام 2026 م.",
    "srv_modal_go": "الدخول للبوابة الآن",
    "srv_modal_cancel": "تراجع",
    "srv_official_badge": "الخدمات الرسمية",
    "srv_close": "إغلاق ✕",

    // Latest News
    "news_badge": "المركز الإعلامي وأخبار المعهد",
    "news_title": "أحدث الأخبار والإعلانات الرسمية 📰",
    "news_desc": "تصفح كل التحديثات والقرارات الصادرة من إدارة المعهد ووزارة التعليم العالي، وجداول الامتحانات، والفعاليات الميدانية مباشرة وفورياً بأسوان.",
    "news_search_placeholder": "ابحث بقائمة الأخبار والقرارات...",
    "news_filter_all": "الكل",
    "news_filter_news": "أخبار",
    "news_filter_announcements": "إعلانات",
    "news_filter_events": "فعاليات",
    "news_read_button": "تصفح الخبر كاملاً",
    "news_views": "قراءة",
    "news_modal_published": "تم النشر في:",
    "news_modal_extra": "تم استخراج الخبر من المركز الإعلامي لعام 2026",
    "news_modal_portal": "بوابة معهد أسوان الإلكترونية",
    "news_modal_close": "إغلاق نافذة الخبر",
    "news_no_results": "عذراً، لم نجد أي أخبار أو بيانات توافق مدخلاتك",
    "news_no_results_desc": "تصفح التبويبات الأخرى أو اكتب كلمة بحثية مغايرة للوصول للأخبار المطلوبة.",
    "news_share_title": "مشاركة الخبر والقرار:",
    "news_share_fb": "فيسبوك",
    "news_share_tw": "إكس (تويتر)",
    "news_share_wa": "واتساب",
    "news_share_tg": "تيليجرام",
    "news_share_copy": "نسخ الرابط",
    "news_share_copied": "تم نسخ رابط الخبر!",

    // Map Location
    "map_badge": "الموقع الجغرافي والميداني للمعهد",
    "map_title": "المقر الرئيسي بأسوان",
    "map_desc": "يقع المعهد العالي للخدمة الاجتماعية في قلب مدينة أسوان، شارع كسر الحجر بميدان الإشارة العريق، بجوار مسجد أبو شوك الكبير، مما يجعله سهلاً للغاية للوصول إليه عبر كافة خطوط النقل العامة والداخلية بكافة أرجاء المحافظة.",
    "map_google_maps_btn": "افتح الموقع في تطبيق خرائط Google",
    "map_google_maps_note": "* انقر للاتجاه المباشر وتشغيل الملاحة الجغرافية بأسوان",
    "map_iframe_title": "موقع المعهد العالي للخدمة الاجتماعية بأسوان",
    
    // Footer Section
    "footer_description": "يعد المعهد العالي للخدمة الاجتماعية بأسوان من أقدّم المؤسسات التعليمية والأكاديمية الرائدة في الصعيد، والتي تهدف لإعداد خريجين مبرزين على توجيه مسارات التكافل والبحث وصناعة القرار الاجتماعي بنجاح متواصل منذ عام 1975 م.",
    "footer_badges_licensed": "مرخص قانونياً 📜",
    "footer_badges_equivalence": "معادلة المجلس الأعلى للجامعات ✔️",
    "footer_links_title": "أبواب وصفحات البوابة:",
    "footer_links_home": "الصفحة الرئيسية للمعهد",
    "footer_links_about": "عن المعهد وتاريخ التأسيس",
    "footer_links_depts": "الأقسام العلمية وأعضاء التدريس",
    "footer_links_portal": "بوابة الطالب واستعلام النتائج",
    "footer_links_contact": "قنوات الاتصال المباشرة من المكتب الأكاديمى",
    "footer_contact_title": "تواصل مع رعاية الطلاب بأسوان:",
    "footer_contact_address": "أسوان، شارع كسر الحجر، بميدان الإشارة، بجوار مسجد أبو شوك.",
    "footer_contact_phone": "تليفون:",
    "footer_maps_btn": "افتح الموقع التفاعلي في خرائط Google 🗺️",
    "footer_scu": "المجلس الأعلى للجامعات المصرية",
    "footer_mohe": "وزارة التعليم العالي والبحث العلمي",
    "footer_copyright": "جميع الحقوق محفوظة ومحمية © {year} • المعهد العالي للخدمة الاجتماعية بأسوان. تم التطوير والتصميم وفق أحدث معايير الجودة الأكاديمية والتقنية لتلبية احتياجات طلابنا الأعزاء بأسوان."
  },
  en: {
    // Top Info Bar & Common Header
    "student_portal_btn": "Student Academic Portal",
    "apply_online_btn": "Apply Online ✉️",
    "arabic": "العربية",
    "english": "English",
    "established_title": "Established",
    "established_desc": "Established in 1975 • Accredited by the Ministry of Higher Education & Supreme Council of Universities",
    "years_title": "Est. Year",
    "depts_count": "Academic Depts",
    "accredited_ratio": "Govt. Accredited",
    "ar_institute_name": "Aswan Higher Institute for Social Work",
    "en_institute_name": "Aswan Higher Institute for Social Work",
    "governorate": "Aswan Governorate",
    "address_text": "Aswan, Kasr El-Hagar Street, El-Ishara Square, next to Abu Shouk Mosque",
    "phone_text": "Call Us",
    "fax_text": "Official Fax",

    // Navigation Links
    "nav_home": "Home",
    "nav_about": "About Institute",
    "nav_dean-message": "Dean's Welcome",
    "nav_departments": "Departments",
    "nav_units": "Units & Centers",
    "nav_programs": "Educational Programs",
    "nav_portal": "Student Portal",
    "nav_exams": "Exam Schedules",
    "nav_guide": "University Guide",
    "nav_faq": "FAQ Guide",
    "nav_contact": "Contact Us",
    "nav_admin": "Admin Panel ⚙️",

    // Banner Help & FAQ Banner
    "help_banner_badge": "Do you have any urgent inquiries?",
    "help_banner_title": "A Complete FAQ Guide for Parents and New Students ⚡",
    "help_banner_desc": "We have compiled more than 30 official questions and answers certified by the institute administration and the Ministry of Higher Education regarding admission, fees, field training, and results!",
    "help_banner_btn": "Browse the FAQ Guide 📚",

    // Dean Message & Main Cards
    "dean_badge": "Higher Education System",
    "dean_title": "Dean's Academic Message",
    "dean_desc": "We are keen to continuously combine technological advancements with rigorous academic curricula to graduate psychologists and social specialists aware of professional interventions.",
    "dean_btn": "Read More from Leadership",

    "research_badge": "Annual Scientific Conferences",
    "research_title": "Annual Social Conference in Aswan",
    "research_desc": "We establish seminars on ecological impacts, social solidarity, and family development in Upper Egypt, to bridge theoretical knowledge with on-field research publications.",
    "research_btn": "Browse Published Researchs",

    "digital_badge": "Academic Excellence & Quality",
    "digital_title": "Integrated Digital Student Services",
    "digital_desc": "Through the Smart Student Card and instant grades updates, we aim to deliver the best digital infrastructure to follow test performance and internship rosters easily.",
    "digital_btn": "Open Grades Portal",

    // Research Publications
    "last_papers_title": "Latest Papers & Research Published at the Institute",
    "last_papers_subtitle": "We actively contribute to the development of Upper Egypt communities through our academic staff's papers.",

    // News Ticker
    "ticker_title": "Breaking News & Important Announcements 🔥",

    // Quick Actions
    "qa_section_badge": "Digital Fast Services Portal",
    "qa_section_title": "Quick Dashboard for Aswan Social Work Students 🎓",
    "qa_section_desc": "Complete your academic transactions and follow your final exam marks, tuition fees, and field training allocations securely without hassle.",
    "qa_results_title": "Student Exam Results",
    "qa_results_desc": "Instant secure inquiries using National ID cards for authenticated academic records.",
    "qa_register_title": "Online Registration Request",
    "qa_register_desc": "Apply online for student registration by filling in your basic personal and academic details.",
    "qa_location_title": "Institute Geographic Maps",
    "qa_location_desc": "Interactive map instructions illustrating easy directions to our premises in Aswan.",
    "qa_faq_title": "Admission & Fees FAQs",
    "qa_faq_desc": "In-depth comprehensive answers regarding tuition rates, credit transfers, and schedules.",
    "qa_depts_title": "Academic Departments",
    "qa_depts_desc": "Explore department directories, curricula, and field training advisors.",
    "qa_library_title": "Digital Library & Syllabus",
    "qa_library_desc": "Browse list of reference books, smart student cards, and the Egyptian Knowledge Bank.",

    // Stats Overlay
    "stats_section_badge": "Aswan Higher Institute for Social Work in Figures ⚡",
    "stats_section_title": "Historic Accomplishments & Luminous Figures We Offer",
    "stats_section_desc": "We work relentlessly to ensure academic excellence and active research resources. Here is the cumulative harvest of our service to Upper Egypt.",
    "stats_stat1_title": "Prestige Foundation Year",
    "stats_stat1_desc": "Half a century of absolute academic leadership in Upper Egypt",
    "stats_stat2_title": "Graduates Registered in Syndicates",
    "stats_stat2_desc": "Leading the social development and welfare missions across Egypt",
    "stats_stat3_title": "Reputable Instructors & Mentors",
    "stats_stat3_desc": "Elite professors of social work, sociology, and supplementary fields",
    "stats_stat4_title": "Partner Internship Institutions",
    "stats_stat4_desc": "Thorough field coverages inside schools, hospitals, and civil agencies",

    // Services Section
    "services_badge": "The Institute's Intelligent Portals",
    "services_title": "Our Integrated Academic & Digital Services ⚙️",
    "services_desc": "Leveraging modern technology to facilitate student experiences, empower researchers, and ensure complete transparency and direct communication with guardians in Aswan.",
    "services_go": "Proceed to Service Now",
    "services_btn_details": "Service Details 📄",
    "srv_accredited_badge": "Accreditation and Operation Details:",
    "srv_accredited_text": "This platform is fully certified and operated to maximize the educational quality and comfort of our community in Aswan for 2026.",
    "srv_modal_go": "Go to Portal",
    "srv_modal_cancel": "Cancel",
    "srv_official_badge": "Official Services",
    "srv_close": "Close ✕",

    // Latest News
    "news_badge": "Media Center & Scientific Press",
    "news_title": "Latest News & General Decisions 📰",
    "news_desc": "Browse all resolutions, exam schedules, events, and campus updates published by the Dean and government higher education bodies.",
    "news_search_placeholder": "Search the news list and guidelines...",
    "news_filter_all": "All",
    "news_filter_news": "News",
    "news_filter_announcements": "Announcements",
    "news_filter_events": "Events",
    "news_read_button": "Browse Full Article",
    "news_views": "views",
    "news_modal_published": "Published on:",
    "news_modal_extra": "Official release from the media office for 2026",
    "news_modal_portal": "Aswan Institute Online Gazette",
    "news_modal_close": "Close Article",
    "news_no_results": "Sorry, no articles match your search parameters",
    "news_no_results_desc": "Try to select other filters or write another keyword to access wanted news.",
    "news_share_title": "Share Decision & News:",
    "news_share_fb": "Facebook",
    "news_share_tw": "X (Twitter)",
    "news_share_wa": "WhatsApp",
    "news_share_tg": "Telegram",
    "news_share_copy": "Copy Link",
    "news_share_copied": "Link Copied!",

    // Map Location
    "map_badge": "Geographic Site & Campus Location",
    "map_title": "Aswan Head Office",
    "map_desc": "The Higher Institute for Social Work is situated in the vital center of Aswan City, at Kasr El-Hagar Street close to El-Ishara Square, right next to the historic Abu Shouk Grand Mosque, rendering it highly accessible via all public transportation methods.",
    "map_google_maps_btn": "Open in Google Maps Application",
    "map_google_maps_note": "* Click for instant route guidance and GPS navigation in Aswan",
    "map_iframe_title": "Directions to Aswan Higher Institute for Social Work",

    // Footer Section
    "footer_description": "Aswan Higher Institute for Social Work is one of the oldest leading academic institutions in Upper Egypt, dedicated to graduating specialists capable of guiding social solidarity, scientific research, and professional community interventions since 1975.",
    "footer_badges_licensed": "Legally Licensed 📜",
    "footer_badges_equivalence": "Supreme Council Equivalence ✔️",
    "footer_links_title": "Academic Portals & Pages:",
    "footer_links_home": "Institute Home Page",
    "footer_links_about": "About Institute & Foundation",
    "footer_links_depts": "Academic Departments & Faculty",
    "footer_links_portal": "Student Portal & Grade Inquiry",
    "footer_links_contact": "Direct Dean & Academic Office Contact",
    "footer_contact_title": "Contact Student Welfare in Aswan:",
    "footer_contact_address": "Aswan, Kasr El-Hagar Street, El-Ishara Square, near Abu Shouk Mosque.",
    "footer_contact_phone": "Phone:",
    "footer_maps_btn": "Open GPS Navigation on Google Maps 🗺️",
    "footer_scu": "Egyptian Supreme Council of Universities",
    "footer_mohe": "Ministry of Higher Education & Scientific Research",
    "footer_copyright": "All Rights Reserved © {year} • Aswan Higher Institute for Social Work. Crafted and optimized in compliance with academic and technical quality standards to support our beloved students in Aswan."
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("aswan_inst_lang");
    return (saved === "ar" || saved === "en" ? saved : "ar") as Language;
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("aswan_inst_lang", newLang);
  };

  useEffect(() => {
    // Dynamically update document layout parameters to mirror standard Arabic/English expectations
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang][key] || translations["ar"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
