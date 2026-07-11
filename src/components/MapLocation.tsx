import React from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function MapLocation() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const tMap = {
    ar: {
      badge: "الموقع الجغرافي والميداني للمعهد",
      title: "المقر الرئيسي بأسوان",
      desc: "يقع المعهد العالي للخدمة الاجتماعية في قلب مدينة أسوان، شارع كسر الحجر بميدان الإشارة العريق، بجوار مسجد أبو شوك الكبير، مما يجعله سهلاً للغاية للوصول إليه عبر كافة خطوط النقل العامة والداخلية بكافة أرجاء المحافظة.",
      btn: "افتح الموقع في تطبيق خرائط Google",
      note: "* انقر للاتجاه المباشر وتشغيل الملاحة الجغرافية بأسوان",
      iframeTitle: "موقع المعهد العالي للخدمة الاجتماعية بأسوان"
    },
    en: {
      badge: "Campus Geographic & Field Location",
      title: "Main Headquarters in Aswan",
      desc: "The Higher Institute for Social Work is located in the heart of Aswan, Kasr El-Hagar Street, at the historic El-Ishara Square, next to the grand Abu Shouk Mosque. This makes it highly accessible via all public transport routes around the city.",
      btn: "Open Campus Location in Google Maps",
      note: "* Click to direct navigation and GPS mapping to Aswan campus",
      iframeTitle: "Aswan Higher Institute for Social Work Campus Location"
    }
  };

  const active = isAr ? tMap.ar : tMap.en;

  return (
    <div className="bg-slate-50/50 rounded-2xl border border-gray-200/60 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="p-6 sm:p-8 lg:col-span-4 flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-accent font-black text-xs">
            <MapPin className="w-4 h-4 text-accent" />
            <span>{active.badge}</span>
          </div>
          <h4 className="text-xl font-black text-slate-900">{active.title}</h4>
          <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
            {active.desc}
          </p>
        </div>
        
        <div className="space-y-3">
          <a 
            href="https://maps.app.goo.gl/7M2APMzAY9yk69yM7" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-primary hover:bg-slate-900 text-white font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer text-center"
          >
            <MapPin className="w-4 h-4 text-accent animate-bounce" />
            <span>{active.btn}</span>
          </a>
          <p className="text-[10px] text-center text-slate-400 font-bold">
            {active.note}
          </p>
        </div>
      </div>
      
      <div className="lg:col-span-8 h-80 sm:h-96 w-full relative border-t lg:border-t-0 lg:border-r border-gray-200">
        <iframe 
          title={active.iframeTitle}
          src="https://maps.google.com/maps?q=%D8%A7%D9%84%D9%85%D8%B9%D9%87%D8%AF%20%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%8a%20%D9%84%D9%84%D8%AE%D8%AF%D9%85%D8%A9%20%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%85%D8%A7%D8%B9%D9%8I%D9%8E%20%D8%A8%D8%A3%D8%B3%D9%88%D9%86&t=&z=16&ie=UTF8&iwloc=&output=embed"
          className="w-full h-full border-0 absolute inset-0"
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}
