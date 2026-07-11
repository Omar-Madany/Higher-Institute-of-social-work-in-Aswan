import React from "react";
import { Mail, Phone, MapPin, Globe, Compass, GraduationCap, ChevronLeft, ChevronRight, ShieldCheck, HeartPulse, Facebook } from "lucide-react";
import { INST_INFO } from "../data";
import { useLanguage } from "../context/LanguageContext";
import VisitorCounter from "./VisitorCounter";

interface FooterProps {
  setTab: (tabId: string) => void;
  onAdminTrigger?: () => void;
}

export default function Footer({ setTab, onAdminTrigger }: FooterProps) {
  const { lang, t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [logoFailed, setLogoFailed] = React.useState(false);

  const isAr = lang === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <footer translate="no" className="notranslate bg-slate-950 border-t-4 border-accent text-white pt-16 pb-8 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 1. السطور الأولى: معلومات وتفاصيل المعهد العالي لخدمة أسوان والاسم ثنائي اللغة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* العمود العريض: لوجو وشرح مع التأسيس والرسالة */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-1 rounded-full border border-accent flex items-center justify-center w-18 h-18 overflow-hidden bg-slate-50 shadow-inner">
                {!logoFailed ? (
                  <img
                    src="/assets/images/3dlogo2.png"
                    alt="Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span className="text-2xl">🎓</span>
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  <span>{lang === "ar" ? INST_INFO.nameAr : INST_INFO.nameEn}</span>
                </h4>
                <p className="text-[10px] text-accent font-bold uppercase tracking-wider">
                  <span>{INST_INFO.nameEn}</span>
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              <span>{t("footer_description")}</span>
            </p>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 text-white px-2.5 py-1 rounded font-bold font-sans">
                <span>{t("footer_badges_licensed")}</span>
              </span>
              <span className="bg-white/10 text-accent px-2.5 py-1 rounded font-bold font-sans">
                <span>{t("footer_badges_equivalence")}</span>
              </span>
            </div>

            <div className="pt-2">
              <VisitorCounter key={lang} />
            </div>
          </div>

          {/* العمود الثاني: روابط سريعة بالموقع لسهولة الحركة */}
          <div className="lg:col-span-3 space-y-4">
            <h5 className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider relative pb-1">
              <span>{t("footer_links_title")}</span>
              <span className="block w-10 h-0.5 bg-accent mt-1"></span>
            </h5>
            <ul className="grid grid-cols-1 gap-2 text-xs font-semibold text-slate-300">
              <li>
                <button 
                  onClick={() => setTab("home")} 
                  className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer text-right"
                >
                  <ChevronIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{t("footer_links_home")}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTab("about")} 
                  className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer text-right"
                >
                  <ChevronIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{t("footer_links_about")}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTab("departments")} 
                  className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer text-right"
                >
                  <ChevronIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{t("footer_links_depts")}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTab("programs")} 
                  className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer text-right"
                >
                  <ChevronIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{t("nav_programs")}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTab("portal")} 
                  className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer text-right"
                >
                  <ChevronIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{t("footer_links_portal")}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setTab("contact")} 
                  className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer text-right"
                >
                  <ChevronIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{t("footer_links_contact")}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* العمود الثالث: بيانات وتفاصيل الاتصال الرسمية بالجنوب */}
          <div className="lg:col-span-4 space-y-4">
            <h5 className="font-extrabold text-xs sm:text-sm text-white uppercase tracking-wider relative pb-1">
              <span>{t("footer_contact_title")}</span>
              <span className="block w-10 h-0.5 bg-accent mt-1"></span>
            </h5>
            <div className="space-y-3.5 text-xs text-slate-300 font-semibold leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{t("footer_contact_address")}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span className="text-white flex items-center gap-1.5">
                  <span>{t("footer_contact_phone")}</span>
                  <span dir="ltr" className="inline-block font-mono font-bold tracking-wider text-accent">+20 {INST_INFO.phoneDisplay}</span>
                </span>
              </div>

              <div className="flex items-center gap-2" dir="ltr">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href={`mailto:${INST_INFO.email}`} className="text-accent hover:underline font-bold">
                  {INST_INFO.email}
                </a>
              </div>

              {INST_INFO.facebook && (
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-accent shrink-0" />
                  <a 
                    href={INST_INFO.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline font-bold text-xs"
                  >
                    {isAr ? "الصفحة الرسمية على فيسبوك 🔗" : "Official Facebook Page 🔗"}
                  </a>
                </div>
              )}
            </div>

            {/* الخريطة المصغرة الأنيقة */}
            <div className="pt-2">
              <div className="rounded-xl overflow-hidden border border-slate-800 shadow-lg h-36 relative">
                <iframe 
                  title={t("map_iframe_title")}
                  src="https://maps.google.com/maps?q=%D8%A7%D9%84%D9%85%D8%B9%D9%87%D8%AF%20%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%8ي%20%D9%84%D9%84%D8%AE%D8%AF%D9%85%D8%A9%20%D8%A7%D9%84%D8%AC%D8%AA%D9%85%D8%A7%D8%B9%D9%8I%D8%A9%20%D8%A8%D8%A3%D8%B3%D9%88%D8%A7%D9%86&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 absolute inset-0 filter invert contrast-[1.1] brightness-[0.9] saturate-[0.6]"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <a 
                href="https://maps.app.goo.gl/7M2APMzAY9yk69yM7" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 text-center text-[11px] text-accent hover:underline font-bold flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3 h-3 text-accent animate-pulse" />
                <span>{t("footer_maps_btn")}</span>
              </a>
            </div>
          </div>

        </div>

        {/* 2. السطر الأخير: الخط الفاصل والديباجة القانونية للمعهد بأسوان */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-800 text-center sm:text-right gap-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 font-bold">
              <a href="https://scu.eg/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t("footer_scu")}</span>
              </a>
              <span>•</span>
              <a href="https://mohesr.gov.eg/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{t("footer_mohe")}</span>
              </a>
            </div>
            
            <p 
              className="text-slate-400 text-[11px] font-semibold leading-relaxed select-none text-center sm:text-right"
            >
              <span>{t("footer_copyright").replace("{year}", String(currentYear))}</span>
            </p>
          </div>

      </div>
    </footer>
  );
}
