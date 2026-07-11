import React, { useState, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import NewsTicker from "./components/NewsTicker";
import HeroSlider from "./components/HeroSlider";
import QuickActions from "./components/QuickActions";
import AboutSection from "./components/AboutSection";
import DeanMessage from "./components/DeanMessage";
import DepartmentsGrid from "./components/DepartmentsGrid";
import UnitsGrid from "./components/UnitsGrid";
import StudentPortal from "./components/StudentPortal";
import ContactUs from "./components/ContactUs";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import StatsOverlay from "./components/StatsOverlay";
import ServicesSection from "./components/ServicesSection";
import EducationalPrograms from "./components/EducationalPrograms";
import LatestNews from "./components/LatestNews";
import ScrollToTop from "./components/ScrollToTop";
import ExamSchedules from "./components/ExamSchedules";
import UniversityGuide from "./components/UniversityGuide";
import AdminDashboard from "./components/AdminDashboard";
import AccessibilityWidget from "./components/AccessibilityWidget";
import NetworkStatusWidget from "./components/NetworkStatusWidget";
import PageLoadingIndicator from "./components/PageLoadingIndicator";
import { GraduationCap, Trophy, HelpCircle, ArrowLeft, Heart, BookOpen, Star, Sparkles, Newspaper, Landmark } from "lucide-react";
import { useLanguage } from "./context/LanguageContext";

export default function App() {
  const { lang, t } = useLanguage();
  // حالة التحكم بالتبويب النشط على مستوى بوابة المعهد بالكامل
  const [tab, setTab] = useState<string>("home");



  // حالات خاصة بإغلاق وقفل لوحة التحكم وحمايتها بكلمة مرور سرية
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // مظهر الوضع الداكن (Dark Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // العودة لقمة الشاشة تلقائياً بمرونة وراحة عند تغيير التبويب المتاح
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  // Dynamic SEO metadata mapping based on active language and tab
  const getSeoMetadata = () => {
    const isAr = lang === "ar";
    switch (tab) {
      case "about":
        return {
          title: isAr 
            ? "عن المعهد ورؤيتنا | المعهد العالي للخدمة الاجتماعية بأسوان" 
            : "About Us & Vision | Aswan Higher Institute for Social Work",
          description: isAr
            ? "تعرف على نشأة المعهد العالي للخدمة الاجتماعية بأسوان، رؤيتنا ورسالتنا الأكاديمية، وأعضاء هيئة التدريس الموقرين."
            : "Learn about the foundation of Aswan Higher Institute for Social Work, our vision, academic mission, and distinguished faculty."
        };
      case "dean-message":
        return {
          title: isAr
            ? "كلمة عميد المعهد العالي للخدمة الاجتماعية بأسوان"
            : "Dean's Welcome Message | Aswan Higher Institute for Social Work",
          description: isAr
            ? "تصفح كلمة ترحيبية من عميد المعهد العالي للخدمة الاجتماعية بأسوان لأبنائه الطلاب والطالبات وأعضاء هيئة التدريس."
            : "Read the welcoming message from the Dean of Aswan Higher Institute for Social Work to students and faculty members."
        };
      case "departments":
        return {
          title: isAr 
            ? "الأقسام العلمية والأكاديمية | المعهد العالي للخدمة الاجتماعية بأسوان" 
            : "Academic Departments | Aswan Higher Institute for Social Work",
          description: isAr
            ? "تصفح الأقسام العلمية المتخصصة في المعهد العالي للخدمة الاجتماعية بأسوان مثل التخطيط الاجتماعي، ومجالات الخدمة الاجتماعية، وتنظيم المجتمع."
            : "Browse the specialized academic departments at Aswan Higher Institute for Social Work such as Social Planning, Social Work Fields, and Community Organization."
        };
      case "units":
        return {
          title: isAr 
            ? "الوحدات والمراكز التخصصية | المعهد العالي للخدمة الاجتماعية بأسوان" 
            : "Specialized Units & Centers | Aswan Higher Institute for Social Work",
          description: isAr
            ? "تصفح الوحدات والمراكز التخصصية التابعة للمعهد العالي للخدمة الاجتماعية بأسوان مثل وحدة الأزمات، وحدة البحث العلمي، ووحدة تكنولوجيا المعلومات."
            : "Browse the specialized academic and administrative units at Aswan Higher Institute for Social Work such as the Crisis Unit, IT Unit, and Research Unit."
        };
      case "portal":
      case "student":
        return {
          title: isAr 
            ? "بوابة الطالب الرقمية | المعهد العالي للخدمة الاجتماعية بأسوان" 
            : "Digital Student Portal | Aswan Higher Institute for Social Work",
          description: isAr
            ? "الخدمات الإلكترونية لبوابة الطالب لمتابعة المقررات الدراسية والأكاديمية، أرقام الجلوس، الإعلانات الهامة ونتائج الامتحانات."
            : "Digital student services to track academic courses, seating numbers, important announcements, and final exam results."
        };
      case "exams":
        return {
          title: isAr 
            ? "جداول الامتحانات ولجان الاختبارات | المعهد العالي للخدمة الاجتماعية بأسوان" 
            : "Exam Schedules & Committees | Aswan Higher Institute for Social Work",
          description: isAr
            ? "جداول امتحانات الفصل الدراسي الأول والثاني، أرقام جلوس لجان الاختبارات، والتعليمات الأكاديمية المنظمة للاختبارات بأسوان."
            : "Academic exam tables for the first and second semesters, seating committee assignments, and regulations for exams in Aswan."
        };
      case "guide":
        return {
          title: isAr 
            ? "دليل المعهد واللوائح التعليمية | المعهد العالي للخدمة الاجتماعية بأسوان" 
            : "Institute Guide & Regulations | Aswan Higher Institute for Social Work",
          description: isAr
            ? "تحميل دليل الطالب الجامعي الشامل، اللائحة الداخلية المعتمدة من وزارة التعليم العالي، شروط القبول والمستندات الرسمية للتقديم."
            : "Download the student handbook, academic bylaws certified by the Ministry of Higher Education, admission criteria, and official documents."
        };
      case "faq":
        return {
          title: isAr 
            ? "الأسئلة الشائعة والاستفسارات | المعهد العالي للخدمة الاجتماعية بأسوان" 
            : "FAQ & Academic Inquiries | Aswan Higher Institute for Social Work",
          description: isAr
            ? "إجابات وحلول وافية لكافة الأسئلة الشائعة حول شروط الالتحاق بالمعهد، الرسوم الدراسية المقررة، تأجيل التجنيد، والتدريب الميداني."
            : "Comprehensive answers and solutions for FAQs regarding institute admission, registration fees, military service deferral, and practical field training."
        };
      case "contact":
        return {
          title: isAr 
            ? "اتصل بنا وموقع المعهد | المعهد العالي للخدمة الاجتماعية بأسوان" 
            : "Contact Us & Map Location | Aswan Higher Institute for Social Work",
          description: isAr
            ? "تواصل مباشرة مع إدارة المعهد العالي للخدمة الاجتماعية بأسوان. أرقام الهواتف والفاكس، البريد الإلكتروني الرسمي، وموقع المعهد التفصيلي على الخريطة."
            : "Get in touch directly with the administration of Aswan Higher Institute for Social Work. Phone numbers, fax, official email, and our interactive campus map."
        };
      case "admin":
        return {
          title: isAr 
            ? "لوحة التحكم الإدارية والأمنية | إدارة معهد أسوان" 
            : "Administrative Security Control Panel | Aswan Institute",
          description: isAr
            ? "بوابة الإدارة الإلكترونية المغلقة لتحديث ونشر المقالات والقرارات الأكاديمية وجداول المعهد العالي للخدمة الاجتماعية بأسوان."
            : "The secure backend administration panel for updating and publishing articles, academic decisions, and scheduling tables."
        };
      case "home":
      default:
        return {
          title: isAr 
            ? "المعهد العالي للخدمة الاجتماعية بأسوان | البوابة الرسمية" 
            : "Aswan Higher Institute for Social Work | Official Portal",
          description: isAr
            ? "البوابة الإلكترونية المعتمدة للمعهد العالي للخدمة الاجتماعية بأسوان - تحت إشراف وزارة التعليم العالي والمجلس الأعلى للجامعات. برامج البكالوريوس المتميزة في الخدمة الاجتماعية."
            : "The accredited digital portal of Aswan Higher Institute for Social Work - under the supervision of the Ministry of Higher Education and SCU. Outstanding bachelor programs in social work."
        };
    }
  };

  const seoMeta = getSeoMetadata();

  return (
    <HelmetProvider>
      <PageLoadingIndicator currentTab={tab} />

      <Helmet>
        <title>{seoMeta.title}</title>
        <meta name="description" content={seoMeta.description} />
        <meta property="og:title" content={seoMeta.title} />
        <meta property="og:description" content={seoMeta.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={seoMeta.title} />
        <meta name="twitter:description" content={seoMeta.description} />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-slate-50/50 mr-0 ml-0" dir={lang === "ar" ? "rtl" : "ltr"}>
      
      {/* 1. ترويسة المعهد وبطاقات الاتصال والشعار ثنائي اللغة */}
      <Header currentTab={tab} setTab={setTab} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* 2. شريط الأخبار العاجلة التفاعلي */}
      <NewsTicker />

      {/* 3. العرض الرئيسي الديناميكي بناء على التبويب المختار */}
      <main className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {tab === "home" && (
              <div>
                {/* أ) سلايدر الصور واللافتات الرائعة */}
                <HeroSlider />

                {/* نبذة تفصيلية تظهر في الرئيسية */}
                <AboutSection />

                {/* أحدث الأخبار والقرارات الأكاديمية والفعاليات */}
                <LatestNews />

                {/* دليل البرامج التعليمية والأكاديمية المعتمدة */}
                <EducationalPrograms />

                {/* دليل الخدمات الرقمية والأكاديمية المتاحة للطلاب وأولياء الأمور */}
                <ServicesSection setTab={setTab} />

                {/* ب) البوابات والخدمات السريعة (النقاط التي تزيد من تفاعلية الطلاب) */}
                <QuickActions setTab={setTab} />

                {/* إحصائيات المعهد بالأرقام المضيئة والسجلات التاريخية */}
                <StatsOverlay />

                {/* بنر مخصص للأسئلة الشائعة وتسهيل الحصول على الإجابات */}
                <section className="py-6 bg-slate-50 border-b border-gray-100">
                  <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="bg-gradient-to-r from-accent/90 to-accent-hover text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md border border-accent">
                      <div className="space-y-2 text-right">
                        <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black">
                          <HelpCircle className="w-3.5 h-3.5 text-white" />
                          <span>{t("help_banner_badge")}</span>
                        </div>
                        <h3 className="text-lg sm:text-2xl font-black">{t("help_banner_title")}</h3>
                        <p className="text-xs sm:text-sm text-yellow-100 font-semibold max-w-2xl leading-relaxed">
                          {t("help_banner_desc")}
                        </p>
                      </div>
                      <button
                        onClick={() => setTab("faq")}
                        className="bg-white hover:bg-slate-900 text-primary hover:text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0 flex items-center justify-center gap-2 w-full md:w-auto"
                      >
                        <span>{t("help_banner_btn")}</span>
                        <ArrowLeft className="w-4 h-4 animate-pulse" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* ج) بطاقات ترحيب وإحصائيات تضفي هيبة للجامعة */}
                <section className="py-12 bg-white border-b border-gray-100">
                  <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* كلمة العميد */}
                      <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/50 p-6 rounded-2xl border border-primary/10 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary font-extrabold text-sm">
                            <Landmark className="w-5 h-5 text-primary" />
                            <span>{t("dean_badge")}</span>
                          </div>
                          <h4 className="text-slate-900 font-black text-base">{t("dean_title")}</h4>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                            {t("dean_desc")}
                          </p>
                        </div>
                        <button
                          onClick={() => setTab("dean-message")}
                          className="text-primary text-xs font-black hover:text-accent duration-150 mt-4 flex items-center gap-1 self-start cursor-pointer"
                        >
                          <span>{t("dean_btn")}</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>

                      {/* أخبار الأنشطة الميدانية ومؤتمرات الصعيد */}
                      <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-6 rounded-2xl border border-accent/20 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-accent font-extrabold text-sm">
                            <Trophy className="w-5 h-5 text-accent" />
                            <span>{t("research_badge")}</span>
                          </div>
                          <h4 className="text-slate-900 font-black text-base">{t("research_title")}</h4>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                            {t("research_desc")}
                          </p>
                        </div>
                        <button
                          onClick={() => setTab("departments")}
                          className="text-accent text-xs font-black hover:text-accent-hover duration-150 mt-4 flex items-center gap-1 self-start cursor-pointer"
                        >
                          <span>{t("research_btn")}</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>

                      {/* خدمات الدعم الصحي والمجتمعي */}
                      <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/40 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                            <Sparkles className="w-5 h-5 text-emerald-700" />
                            <span>{t("digital_badge")}</span>
                          </div>
                          <h4 className="text-slate-900 font-black text-base">{t("digital_title")}</h4>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold">
                            {t("digital_desc")}
                          </p>
                        </div>
                        <button
                          onClick={() => setTab("portal")}
                          className="text-emerald-800 text-xs font-black hover:underline mt-4 flex items-center gap-1 self-start cursor-pointer"
                        >
                          <span>{t("digital_btn")}</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* التبويب الفرعي: عن المعهد */}
            {tab === "about" && (
              <AboutSection />
            )}

            {/* التبويب الفرعي: كلمة عميد المعهد */}
            {tab === "dean-message" && (
              <DeanMessage />
            )}

            {/* التبويب الفرعي: الأقسام الأكاديمية */}
            {tab === "departments" && (
              <DepartmentsGrid />
            )}

            {/* التبويب الفرعي: الوحدات والمراكز التخصصية */}
            {tab === "units" && (
              <UnitsGrid />
            )}

            {/* التبويب الفرعي: البرامج التعليمية المعتمَدة */}
            {tab === "programs" && (
              <EducationalPrograms />
            )}

            {/* التبويب الفرعي: بوابة الطالب */}
            {tab === "portal" && (
              <StudentPortal />
            )}

            {/* التبويب الفرعي: جداول الامتحانات */}
            {tab === "exams" && (
              <ExamSchedules />
            )}

            {/* التبويب الفرعي: دليل المعهد */}
            {tab === "guide" && (
              <UniversityGuide />
            )}

            {/* التبويب الفرعي: لوحة التحكم الإدارية */}
            {tab === "admin" && (
              <AdminDashboard />
            )}

            {/* التبويب الفرعي: الأسئلة الشائعة */}
            {tab === "faq" && (
              <FAQSection />
            )}

            {/* التبويب الفرعي: اتصل بنا */}
            {tab === "contact" && (
              <ContactUs />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. تذييل الموقع الموحد مع الروابط الأكاديمية وصندوق الضمان بأسوان */}
      <Footer setTab={setTab} onAdminTrigger={() => setIsAdminModalOpen(true)} />

      {/* تسهيلات الاستخدام الرقمية العائمة بالموقع */}
      <AccessibilityWidget darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* نافذة التحقق من البريد الإلكتروني وكلمة المرور للدخول للوحة الإدارة والتحكم */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-right relative overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
            <div className="flex items-center gap-2 mb-4 text-accent border-b border-slate-100 pb-3">
              <span className="text-xl">🔒</span>
              <h3 className="font-extrabold text-base text-slate-900">
                {lang === "ar" ? "بوابة الإدارة والأمان السرية للمعهد" : "Institute Admin & Security Portal"}
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 font-semibold mb-4 leading-relaxed">
              {lang === "ar" 
                ? "الرجاء إدخال البريد الإلكتروني وكلمة المرور المعتمدة لإدارة المعهد العالي للخدمة الاجتماعية بأسوان للوصول إلى لوحة التحكم الإدارية:" 
                : "Please enter the authorized administrator email and password for Aswan Higher Institute for Social Work to access the Control Panel:"}
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              // البريد الإلكتروني وكلمة المرور الرسمية للأدمن
              const normalizedEmail = adminEmail.trim().toLowerCase();
              const correctEmails = ["admin@aswan.edu", "omarmadany83@gmail.com"];
              const correctPasswords = ["aswan123456", "admin2026", "1975", "admin1975"];
              
              if (correctEmails.includes(normalizedEmail) && correctPasswords.includes(adminPassword)) {
                setTab("admin");
                setIsAdminModalOpen(false);
                setAdminEmail("");
                setAdminPassword("");
                setAuthError("");
              } else {
                setAuthError(lang === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة! يرجى التحقق وإعادة المحاولة." : "Invalid email or password! Please check and try again.");
              }
            }} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {lang === "ar" ? "البريد الإلكتروني للأدمن:" : "Admin Email:"}
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (authError) setAuthError("");
                    }}
                    placeholder="admin@aswan.edu"
                    className="w-full border border-slate-200 focus:border-accent rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none transition-colors text-right placeholder-slate-300"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    {lang === "ar" ? "كلمة المرور:" : "Password:"}
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (authError) setAuthError("");
                    }}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 focus:border-accent rounded-xl px-4 py-3 text-sm font-semibold tracking-widest focus:outline-none transition-colors text-right"
                  />
                </div>

                {authError && (
                  <p className="text-[11px] text-red-600 font-extrabold mt-2 text-center">
                    ⚠️ {authError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {lang === "ar" ? "دخول" : "Log In"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setAdminEmail("");
                    setAdminPassword("");
                    setAuthError("");
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* زر الانتقال السلس إلى أعلى الصفحة */}
      <ScrollToTop />
      
      {/* مراقب حالة جودة اتصال الإنترنت والتصميم بأسلوب أسوان */}
      <NetworkStatusWidget />
    </div>
    </HelmetProvider>
  );
}
