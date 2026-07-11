import React, { useState } from "react";
import { Mail, Phone, GraduationCap, Globe, Menu, X, Users, Compass, BookOpen, HelpCircle, Layers, ChevronDown, Sun, Moon, Facebook, Award, Landmark } from "lucide-react";
import { INST_INFO, NAVIGATION_LINKS, DEPARTMENTS, ADMIN_DEPARTMENTS, UNITS } from "../data";
import { useLanguage } from "../context/LanguageContext";

interface HeaderProps {
  currentTab: string;
  setTab: (tabId: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Header({ currentTab, setTab, darkMode, setDarkMode }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  // نطاق الحالة للتحكم في المنيو التفاعلية للهواتف المحمولة
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubDeptClick = (category: "academic" | "administrative", deptId: string) => {
    // Disabled: Clicking any department must do nothing.
  };

  const handleSubUnitClick = (unitId: string) => {
    // Disabled: Clicking any unit must do nothing.
  };

  const handleProgramClick = () => {
    setTab("programs");
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById("educational-programs");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      
      {/* 1. شريط الاتصال العلوي المميز (Top Info Bar) */}
      <div className="w-full bg-primary text-white text-[11px] py-1.5 px-3 md:px-8 border-b-2 border-accent">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-2 flex-wrap">
          
          {/* الجانب الأيمن: وسائل الاتصال مع الأيقونات المطلوبة */}
          <div className="flex items-center justify-center gap-3 md:gap-6">
            <a 
              href={`mailto:${INST_INFO.email}`} 
              className="flex items-center gap-1.5 hover:text-accent transition-colors"
              title="Official email"
            >
              <Mail className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">{INST_INFO.email}</span>
            </a>
            
            <a 
              href={`tel:${INST_INFO.phone}`} 
              className="flex items-center gap-1.5 hover:text-accent transition-colors font-mono"
              title="Call us"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>{INST_INFO.phoneDisplay}</span>
            </a>

            {INST_INFO.facebook && (
              <a 
                href={INST_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
                title="Official Facebook Page"
              >
                <Facebook className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">فيسبوك</span>
              </a>
            )}
          </div>

          {/* الجانب الأيسر: روابط تفاعلية سريعة تليق ببوابة الأكاديمية العربية ومعهد الدلتا للخدمة */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTab("portal")} 
              className="flex items-center gap-1 bg-accent hover:bg-accent-hover text-white px-2 py-0.5 rounded font-bold text-[10px] transition-all shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-3 h-3" />
              <span>{t("student_portal_btn")}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-gray-300">
                <Globe className="w-3 h-3 text-gray-400" />
                <button 
                  onClick={() => setLang("ar")} 
                  className={`cursor-pointer hover:text-white transition-colors text-[10px] font-bold ${lang === "ar" ? "text-yellow-300 select-none underline" : "text-gray-300"}`}
                >
                  العربية
                </button>
                <span className="text-gray-500 text-[9px]">|</span>
                <button 
                  onClick={() => setLang("en")} 
                  className={`cursor-pointer hover:text-white transition-colors text-[10px] font-bold ${lang === "en" ? "text-yellow-300 select-none underline" : "text-gray-300"}`}
                >
                  English
                </button>
              </div>

              {/* Dark Mode Top Toggle Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-center p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
                title={lang === "ar" ? "تبديل المظهر الداكن/المضيء" : "Toggle Dark/Light Mode"}
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> : <Moon className="w-3.5 h-3.5 text-slate-200" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. منطقة شعار المعهد الموسعة والواضحة (Enlarged Institutional Logo Section) */}
      <div className="hidden md:block w-full bg-gradient-to-r from-primary via-blue-950 to-primary text-white py-3 px-4 md:px-8 shadow-inner border-b border-accent/10">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4 md:gap-5 flex-row text-right">
            {/* شعار المعهد المحدث */}
            <div className="bg-white p-1 rounded-xl shadow-md border border-accent flex duration-300 hover:scale-105 items-center justify-center w-16 h-16 md:w-20 md:h-20 overflow-hidden">
              <img
                src="/assets/images/3dlogo2.png"
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/assets/images/3dlogo2.png";
                }}
              />
            </div>
            
            {/* الأسماء بالعربي والإنجليزي */}
            <div>
              <h1 className="font-extrabold text-base md:text-xl lg:text-2xl tracking-tight text-white drop-shadow">
                {lang === "ar" ? INST_INFO.nameAr : INST_INFO.nameEn}
              </h1>
              <p className="font-sans font-medium text-[10px] md:text-xs text-yellow-400/90 uppercase tracking-widest mt-0.5">
                {lang === "ar" ? "المعهد العالي للخدمة الاجتماعية بأسوان" : "Higher Institute of Social Work - Aswan"}
              </p>
              <div className="inline-block bg-accent/25 border border-accent/50 text-[9px] md:text-xs text-yellow-200 px-2 py-0.5 rounded mt-1">
                {lang === "ar" 
                  ? `تأسس عام ${INST_INFO.established} م • مرخص ومعادل من المجلس الأعلى للجامعات` 
                  : `Established in ${INST_INFO.established} • Licensed & Accredited by the Supreme Council of Universities`}
              </div>
            </div>
          </div>

          {/* لوحة الشرف الأكاديمي السريعة */}
          <div className="hidden lg:flex items-center gap-5 text-xs text-blue-100 border-r border-accent/30 pr-5">
            <div className="text-center">
              <span className="block font-black text-base text-yellow-400">1975</span>
              <span className="text-[10px] opacity-80">{t("years_title")}</span>
            </div>
            <div className="text-center">
              <span className="block font-black text-base text-yellow-400">7+</span>
              <span className="text-[10px] opacity-80">{t("depts_count")}</span>
            </div>
            <div className="text-center">
              <span className="block font-black text-base text-yellow-400">100%</span>
              <span className="text-[10px] opacity-80">{t("accredited_ratio")}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. شريط التنقل الأكاديمي (Main Navigation Bar) */}
      <nav className="w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8">
          
          {/* القوائم الرئيسية لنسخة الديسكتوب */}
          <ul className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAVIGATION_LINKS.map((link) => {
              const hasSubmenu = link.id === "departments" || link.id === "programs" || link.id === "units";
              const isDisabled = link.id === "departments" || link.id === "units";
              return (
                <li key={link.id} className={`relative ${hasSubmenu ? "group" : ""}`}>
                  <button
                    onClick={() => {
                      if (isDisabled) return;
                      setTab(link.id);
                      setMobileMenuOpen(false);
                    }}
                    title={isDisabled ? (lang === "ar" ? "سيتم إتاحة هذا القسم قريباً" : "This section will be available soon") : undefined}
                    className={`px-4 py-4 text-sm font-bold transition-all border-b-3 flex items-center gap-1.5 cursor-pointer ${
                      currentTab === link.id
                        ? "text-primary border-accent bg-slate-50/50"
                        : "text-slate-700 border-transparent hover:text-primary hover:bg-slate-50"
                    }`}
                  >
                    {link.id === "home" && <Compass className="w-4 h-4 text-primary" />}
                    {link.id === "about" && <Users className="w-4 h-4 text-primary" />}
                    {link.id === "dean-message" && <Landmark className="w-4 h-4 text-primary" />}
                    {link.id === "departments" && <BookOpen className="w-4 h-4 text-primary" />}
                    {link.id === "units" && <Layers className="w-4 h-4 text-primary" />}
                    {link.id === "programs" && <Layers className="w-4 h-4 text-primary" />}
                    {link.id === "portal" && <GraduationCap className="w-4 h-4 text-primary" />}
                    {link.id === "faq" && <HelpCircle className="w-4 h-4 text-primary" />}
                    <span>{t("nav_" + link.id)}</span>
                    {hasSubmenu && <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:rotate-180 transition-transform duration-200" />}
                  </button>

                  {/* Dropdown element for departments */}
                  {link.id === "departments" && (
                    <div className={`absolute top-full mt-0 pt-1.5 w-[500px] lg:w-[600px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 pointer-events-none group-hover:pointer-events-auto ${lang === "ar" ? "right-0" : "left-0"}`}>
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 grid grid-cols-2 gap-5 text-right">
                        {/* الأقسام العلمية */}
                        <div className={`space-y-2 ${lang === "ar" ? "border-l border-slate-100 pl-4" : "border-r border-slate-100 pr-4"}`}>
                          <h4 className="font-extrabold text-xs text-primary pb-1.5 border-b border-primary/10 flex items-center gap-1 justify-end">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "الأقسام العلمية (٧)" : "Scientific Depts (7)"}</span>
                          </h4>
                          <ul className="space-y-1 pt-1">
                            {DEPARTMENTS.map((dept) => (
                              <li key={dept.id}>
                                <button
                                  onClick={() => handleSubDeptClick("academic", dept.id)}
                                  title={lang === "ar" ? "سيتم إتاحة هذا القسم قريباً" : "This section will be available soon"}
                                  className="w-full text-right text-[11px] font-bold text-slate-600 hover:text-accent hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-end gap-1 cursor-pointer"
                                >
                                  <span>{lang === "ar" ? dept.name : dept.englishName}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* الأقسام الإدارية */}
                        <div className="space-y-2">
                          <h4 className="font-extrabold text-xs text-emerald-800 pb-1.5 border-b border-emerald-800/10 flex items-center gap-1 justify-end">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{lang === "ar" ? "الأقسام الإدارية (٧)" : "Admin Desks (7)"}</span>
                          </h4>
                          <ul className="space-y-1 pt-1">
                            {ADMIN_DEPARTMENTS.map((dept) => (
                              <li key={dept.id}>
                                <button
                                  onClick={() => handleSubDeptClick("administrative", dept.id)}
                                  title={lang === "ar" ? "سيتم إتاحة هذا القسم قريباً" : "This section will be available soon"}
                                  className="w-full text-right text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-end gap-1 cursor-pointer"
                                >
                                  <span>{lang === "ar" ? dept.name : dept.englishName}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown element for units */}
                  {link.id === "units" && (
                    <div className={`absolute top-full mt-0 pt-1.5 w-[560px] lg:w-[660px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 pointer-events-none group-hover:pointer-events-auto ${lang === "ar" ? "right-0" : "left-0"}`}>
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 text-right">
                        <h4 className="font-extrabold text-xs text-primary pb-2 border-b border-primary/10 flex items-center gap-1 justify-end mb-3">
                          <Layers className="w-3.5 h-3.5 text-accent" />
                          <span>{lang === "ar" ? "الوحدات والمراكز التخصصية (١٣)" : "Specialized Units & Centers (13)"}</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                          {UNITS.map((unit) => (
                            <button
                              key={unit.id}
                              onClick={() => handleSubUnitClick(unit.id)}
                              title={lang === "ar" ? "سيتم إتاحة هذا القسم قريباً" : "This section will be available soon"}
                              className="w-full text-right text-[11px] font-bold text-slate-600 hover:text-accent hover:bg-slate-50 px-2.5 py-2 rounded-lg transition-all flex items-center justify-between gap-1 cursor-pointer border border-transparent hover:border-slate-100"
                            >
                              <span className="truncate">{lang === "ar" ? unit.name : unit.englishName}</span>
                              <span className="text-[9px] text-slate-400 font-mono">✦</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown element for programs */}
                  {link.id === "programs" && (
                    <div className={`absolute top-full mt-0 pt-1.5 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 pointer-events-none group-hover:pointer-events-auto ${lang === "ar" ? "right-0" : "left-0"}`}>
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 text-right">
                        <h4 className="font-extrabold text-xs text-primary pb-1.5 border-b border-primary/10 flex items-center gap-1 justify-end mb-2">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{lang === "ar" ? "البرنامج المعتمد للبكالوريوس" : "Accredited Bachelor Program"}</span>
                        </h4>
                        <button
                          onClick={handleProgramClick}
                          className="w-full text-right text-xs font-bold text-slate-600 hover:text-accent hover:bg-slate-50 px-3 py-2.5 rounded-xl transition-all flex items-center justify-end gap-1.5 cursor-pointer border border-transparent hover:border-slate-100 shadow-xs"
                        >
                          <span>{lang === "ar" ? "بكالوريوس الخدمة الاجتماعية 🎓" : "Bachelor of Social Work (BSW)"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* زر التواصل والقبول السريع */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setTab("portal")}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-5 py-2.5 rounded shadow transition-all hover:scale-[1.02] cursor-pointer"
            >
              {t("apply_online_btn")}
            </button>
          </div>

          {/* زر القائمة للهواتف الذكية */}
          <div className="flex md:hidden items-center py-2.5 justify-between w-full gap-2">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab("home")}>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-accent/30 shadow-xs overflow-hidden">
                <img
                  src="/assets/images/3dlogo2.png"
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/images/3dlogo2.png";
                  }}
                />
              </div>
              <div className="text-right leading-tight">
                <span className="block text-xs font-black text-primary">
                  {lang === "ar" ? "معهد الخدمة الاجتماعية" : "Social Work Institute"}
                </span>
                <span className="block text-[10px] font-bold text-accent">
                  {lang === "ar" ? "أسوان • تأسس ١٩٧٥" : "Aswan • Est. 1975"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-800 p-2 rounded-md hover:bg-slate-100 focus:outline-none cursor-pointer border border-slate-100 bg-slate-50 flex items-center justify-center"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
            </button>
          </div>

        </div>

        {/* منيو الهواتف الذكية المتنقلة */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 shadow-lg transition-all">
            <ul className="flex flex-col gap-1">
              {NAVIGATION_LINKS.map((link) => {
                const isDisabled = link.id === "departments" || link.id === "units";
                return (
                  <li key={link.id}>
                    <button
                      onClick={() => {
                        if (isDisabled) return;
                        setTab(link.id);
                        setMobileMenuOpen(false);
                      }}
                      title={isDisabled ? (lang === "ar" ? "سيتم إتاحة هذا القسم قريباً" : "This section will be available soon") : undefined}
                      className={`w-full text-right px-4 py-2.5 rounded-md text-sm font-bold flex items-center justify-between transition-colors ${
                        currentTab === link.id
                          ? "bg-primary text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{t("nav_" + link.id)}</span>
                      {isDisabled && <span className="text-[10px] text-accent font-black bg-accent/10 px-2 py-0.5 rounded-full">{lang === "ar" ? "قريباً" : "Soon"}</span>}
                    </button>
                  </li>
                );
              })}
              <li className="mt-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setTab("portal");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center bg-accent hover:bg-accent-hover text-white py-2 rounded font-bold text-xs shadow-sm"
                >
                  {t("student_portal_btn")}
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

    </header>
  );
}
