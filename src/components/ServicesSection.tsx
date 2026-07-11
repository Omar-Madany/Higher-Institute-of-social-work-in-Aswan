import React, { useState } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Activity, 
  ShieldCheck, 
  BookMarked,
  Layers,
  PhoneCall,
  CheckCircle
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ServicesSectionProps {
  setTab: (tab: string) => void;
}

export default function ServicesSection({ setTab }: ServicesSectionProps) {
  const { lang, t } = useLanguage();
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const services = lang === "ar" ? [
    {
      id: "portal-grades",
      title: "بوابة الاستعلام عن النتائج الفورية",
      shortDesc: "الحصول على الدرجات التفصيلية وبيان المواد بالرقم القومي مع التحليل البياني العام لدرجة الطالب.",
      longDesc: "تتيح البوابة الرقمية المتطورة للطلاب في جميع الفرق الأربعة الاستعلام الفوري عن الدرجات ببيانات دقيقة ومفصلة بمجرد رصدها واعتمادها من الإدارة التعليمية بأسوان. تتميز بفحص المواد بالتفوق، وحجم رصد درجات أعمال السنة بشكل آمن.",
      icon: GraduationCap,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      targetTab: "portal",
      badge: "رقمي عاجل"
    },
    {
      id: "portal-register",
      title: "منظومة التقديم والقبول الإلكتروني",
      shortDesc: "التقديم للالتحاق بالمعهد وتعبئة استمارات الطلاب الجدد والتحويل بكل يسر وسهولة.",
      longDesc: "خدمة إلكترونية للطلاب الجدد للالتحاق بالمعهد عقب استلام بطاقات الترشيح والحدود الدنيا من التنسيق؛ حيث تتيح البوابة رفع صور الشهادات، استمارات الحالة الاجتماعية، ملء بيانات المقابلة الشخصية، وتلقي الرد المبدئي في غضون 24 ساعة فقط دون عناء السفر.",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      targetTab: "portal",
      badge: "متاح حالياً"
    },
    {
      id: "academic-departments",
      title: "التوجيه والدعم الأكاديمي للأقسام",
      shortDesc: "استكشف الأقسام العلمية السبعة لمعرفة أخصائي الإرشاد ومجالات العمل المهني المتوقعة للخريجين.",
      longDesc: "تضم بنية المعهد سبعة أقسام بحثية متكاملة (خدمة فرد، خدمة جماعة، تنظيم مجتمع، تخطيط، مجالات، علوم مساعدة، والتدريب الميداني). تتيح هذه الخدمة للطلاب وأولياء الأمور معرفة الأهداف التربوية، ورؤساء المجموعات العلمية، ومجالات التدريب المناسبة لبناء شخصية الطالب.",
      icon: BookOpen,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      targetTab: "departments",
      badge: "دليل دراسي"
    },
    {
      id: "field-training",
      title: "التدريب الميداني وإشراف المؤسسات",
      shortDesc: "مكتبة الفرص التدريبية العملية داخل المدارس، والمستشفيات، والجمعيات في محافظة أسوان.",
      longDesc: "يعتبر التدريب الميداني الركيزة المهنية الأساسية؛ حيث يتدرب الطلاب في الفرق الأعلى في مؤسسات الدولة والجمعيات الأهلية لتبني وتطبيق المهارات العيادية والنفسية بموجب بروتوكولات تعاون رسمية مع وزارات التربية والتعليم والصحة والتضامن الاجتماعي.",
      icon: Activity,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      targetTab: "departments",
      badge: "تنمية مهارات"
    },
    {
      id: "digital-library",
      title: "المكتبة الرقمية والمراجع البحثية",
      shortDesc: "حصر بأمهات الكتب المتخصصة، والرسائل الجامعية، ومجلة البحوث بالخدمة الاجتماعية.",
      longDesc: "تحتوي مكتبة المعهد بأسوان على آلاف المؤلفات والمراجع المتخصصة في الخدمة الاجتماعية وعلم الاجتماع والتشريعات القانونية، فضلاً عن مجلات البحوث الدورية، مما يتيح للطلاب والباحثين استخدام محركات بحث المكتبة لتحديد الكتب واستعارتها لتسهيل المشروعات البحثية.",
      icon: BookMarked,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      targetTab: "about",
      badge: "أبحاث علمية"
    },
    {
      id: "grievances-desk",
      title: "صندوق الشكاوى والمقترحات الإلكتروني",
      shortDesc: "أرسل التماس النتيجة، تظلمات الامتحانات، أو شكوى مباشرة ليتم مراجعتها فورياً عبر العميد.",
      longDesc: "بوابة مباشرة وسريعة لتسجيل الاقتراحات الفنية والشكاوى الشخصية. نقوم بدراسة المذكرات والالتماسات بجدية كاملة ويتم إخطار الطالب أو ولي أمره بالنتيجة رسمياً على بريده الإلكتروني أو تليفونياً، مما يضمن الشفافية وتطبيق معايير الجودة.",
      icon: PhoneCall,
      color: "text-violet-600 bg-violet-50 border-violet-100",
      targetTab: "contact",
      badge: "تواصل مباشر"
    }
  ] : [
    {
      id: "portal-grades",
      title: "Instant Examination Outcomes Portal",
      shortDesc: "Acquire segmented semester scores and grade breakdowns securely with standard National ID checks.",
      longDesc: "Our high-tech grades platform lets students across all four training levels retrieve exact academic scores as soon as they are approved by administration. Offers secure index views and full transparency regarding daily work marks.",
      icon: GraduationCap,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      targetTab: "portal",
      badge: "Live Digital"
    },
    {
      id: "portal-register",
      title: "Online Admission & Enrollment System",
      shortDesc: "Securely apply for newly high-school seats or transfer student slots step-by-step.",
      longDesc: "An automated helper designed for incoming students. Fill basic biographical information, submit prerequisite documents, schedule initial face-to-face evaluations, and receive validated administrative status updates within 24 hours.",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      targetTab: "portal",
      badge: "Active Now"
    },
    {
      id: "academic-departments",
      title: "Academic Divisions & Curricular Support",
      shortDesc: "Discover specialized social branches to locate course blueprints and research advisors.",
      longDesc: "Aswan Higher Institute manages seven core departments (Case Work, Group Work, Community Organization, Planning, Scope Fields, Supplementary Sciences, and Internships). Lean about learning outcomes, division heads, and specialized courses.",
      icon: BookOpen,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      targetTab: "departments",
      badge: "Syllabus Guide"
    },
    {
      id: "field-training",
      title: "Field Internships & Welfare Allotments",
      shortDesc: "Explore professional placements in state schools, healthcare centers, and social institutions in Aswan.",
      longDesc: "Hands-on internships are crucial for real-world excellence. Students are assigned to licensed schools, psychiatric hospitals, and civil structures under formal protocols with the Egyptian ministries of Health, Education, and Welfare.",
      icon: Activity,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      targetTab: "departments",
      badge: "Practical Training"
    },
    {
      id: "digital-library",
      title: "Scientific Library & Social Literature Index",
      shortDesc: "Locate professional references, verified masters/doctoral theses, and social periodicals.",
      longDesc: "Our Aswan campus features thousands of physical textbooks, counseling journals, and legal catalogs. Utilizing current indices help student groups and advanced researchers fulfill references requests effortlessly.",
      icon: BookMarked,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      targetTab: "about",
      badge: "Library Center"
    },
    {
      id: "grievances-desk",
      title: "Electronic Petitions & Suggestions Box",
      shortDesc: "Send terminal feedback, grade reviews, or structural complaints directly to the Dean.",
      longDesc: "A swift feedback mechanism ensuring perfect clarity. Submitted requests are reviewed directly under the dean's desk. Once finalized, official status reports are dispatched to your phone or verified emails.",
      icon: PhoneCall,
      color: "text-violet-600 bg-violet-50 border-violet-100",
      targetTab: "contact",
      badge: "Dean Desk"
    }
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-white border-b border-gray-100/80" id="services">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* الترويسة والعنوان */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-hover px-4 py-1.5 rounded-full text-xs font-black">
            <Layers className="w-3.5 h-3.5 text-accent animate-spin" />
            <span>{t("services_badge")}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t("services_title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
            {t("services_desc")}
          </p>
        </div>

        {/* شبكة الخدمة المدهشة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((srv) => {
            const Icon = srv.icon;
            return (
              <div 
                key={srv.id}
                className="bg-slate-50/55 rounded-2xl p-6 border border-gray-200/60 hover:border-accent/40 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${srv.color} transition-colors duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] bg-slate-200/60 text-slate-700 px-2.5 py-1 rounded-full font-black">
                      {srv.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-normal group-hover:text-primary transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-3">
                      {srv.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setTab(srv.targetTab)}
                    className="text-primary hover:text-accent font-black text-xs flex items-center gap-1.5 transition-all text-right cursor-pointer"
                  >
                    <span>{t("services_go")}</span>
                    <span className="text-[9px]">&#10094;</span>
                  </button>

                  <button
                    onClick={() => setSelectedService(srv)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold bg-white hover:bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                  >
                    {t("services_btn_details")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* مودال تفصيلي لعرض المزيد عن الخدمة بطابع مميز للغاية */}
        {selectedService && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    {React.createElement(selectedService.icon, { className: "w-5 h-5 text-accent" })}
                  </div>
                  <div>
                    <span className="text-[10px] text-yellow-300 font-black tracking-widest block">{t("srv_official_badge")}</span>
                    <h4 className="text-sm sm:text-base font-black">{selectedService.title}</h4>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  {t("srv_close")}
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                  {selectedService.longDesc}
                </p>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-emerald-800 block">{t("srv_accredited_badge")}</span>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold">
                      {t("srv_accredited_text")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setTab(selectedService.targetTab);
                      setSelectedService(null);
                    }}
                    className="flex-1 bg-primary hover:bg-slate-900 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t("srv_modal_go")}</span>
                  </button>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="px-5 border border-gray-300 text-slate-700 hover:bg-slate-100 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {t("srv_modal_cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
