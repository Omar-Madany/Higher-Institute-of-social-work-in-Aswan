import React from "react";
import { GraduationCap, FileSpreadsheet, BookOpen, PhoneCall, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface QuickActionsProps {
  setTab: (tabId: string) => void;
}

export default function QuickActions({ setTab }: QuickActionsProps) {
  const { lang, t } = useLanguage();
  
  // دالة مساعدة لربط أسماء الأيقونات بمكونات ريآكت المناسبة
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "GraduationCap":
        return <GraduationCap className="w-8 h-8 text-white" />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className="w-8 h-8 text-white" />;
      case "BookOpen":
        return <BookOpen className="w-8 h-8 text-white" />;
      case "PhoneCall":
        return <PhoneCall className="w-8 h-8 text-white" />;
      default:
        return <GraduationCap className="w-8 h-8 text-white" />;
    }
  };

  const localActions = [
    {
      id: "portal-results",
      title: t("qa_results_title"),
      desc: t("qa_results_desc"),
      icon: "GraduationCap",
      color: "from-blue-600 to-indigo-700",
      tabId: "portal"
    },
    {
      id: "portal-register",
      title: t("qa_register_title"),
      desc: t("qa_register_desc"),
      icon: "FileSpreadsheet",
      color: "from-emerald-600 to-teal-700",
      tabId: "portal"
    },
    {
      id: "departments-action",
      title: t("qa_depts_title"),
      desc: t("qa_depts_desc"),
      icon: "BookOpen",
      color: "from-amber-500 to-orange-600",
      tabId: "departments"
    },
    {
      id: "news-action",
      title: lang === "ar" ? "اتصل بإدارة المعهد والشكاوى" : "Contact & Complaints Office",
      desc: lang === "ar" ? "صندوق المراسلات، الشكاوى والاستفسارات وخرائط الوصول." : "Dean desk, student welfare contact, and dynamic campus directions.",
      icon: "PhoneCall",
      color: "from-red-500 to-rose-600",
      tabId: "contact"
    }
  ];

  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="py-12 bg-white px-4 md:px-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* العناوين وجاذبية التصميم للأكاديميات */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 bg-slate-950/5 text-slate-800 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black mb-2">
            <span>{t("qa_section_badge")}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">{t("qa_section_title")}</h3>
          <p className="text-slate-500 font-bold text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
            {t("qa_section_desc")}
          </p>
        </div>

        {/* شبكة البطاقات ذات التدرج اللوني اللامع والظل الدقيق */}
        {/* تم ترتيبها كمربعات ذكية تمكنك من القفز المباشر للأقسام المطلوبة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {localActions.map((action) => {
            const isDisabled = action.tabId === "departments" || action.tabId === "units";
            return (
              <div
                key={action.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (isDisabled) return;
                  setTab(action.tabId);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (isDisabled) return;
                    setTab(action.tabId);
                  }
                }}
                title={isDisabled ? (lang === "ar" ? "سيتم إتاحة هذا القسم قريباً" : "This section will be available soon") : undefined}
                className="group cursor-pointer bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 text-right"
                dir={lang === "ar" ? "rtl" : "ltr"}
                aria-label={`${action.title} - ${action.desc}`}
              >
              
              {/* الرأس المحتوى على الأيقونات والألوان المبهجة */}
              <div className="p-6">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow group-hover:scale-110 transition-transform`}>
                  {getIcon(action.icon)}
                </div>
                
                <h4 className="text-slate-900 font-extrabold text-base mb-2 group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                
                <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                  {action.desc}
                </p>
              </div>

              {/* ذيل ممتد للشعور بقابلية الضغط مع سهم متحرك */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between group-hover:bg-primary group-hover:text-white transition-all text-xs font-bold text-slate-500">
                <span>{lang === "ar" ? "ابدأ الآن" : "Start Now"}</span>
                <ArrowIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-primary group-hover:text-accent" />
              </div>

            </div>
          ); })}
        </div>

      </div>
    </section>
  );
}
