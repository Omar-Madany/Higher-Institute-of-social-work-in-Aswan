import React, { useState } from "react";
import { TICKER_NEWS } from "../data";
import { Megaphone, Volume2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function NewsTicker() {
  const { lang, t } = useLanguage();

  const tickerItems = lang === "ar" ? TICKER_NEWS : [
    "Congratulations from the Dean of the Institute to the successful fourth-year students."
  ];

  return (
    <div className="w-full bg-accent text-white flex items-center h-11 overflow-hidden shadow-sm relative z-10">
      
      {/* 1. ملصق "آخر الأخبار" الثابت بعلامة البوق التفاعلية */}
      <div className="bg-navy-dark h-full px-4 md:px-6 flex items-center gap-2 font-black text-sm relative z-20 shrink-0 shadow-lg border-l border-accent">
        <Megaphone className="w-4 h-4 text-accent animate-pulse" />
        <span className="tracking-wide text-xs md:text-sm">
          {lang === "ar" ? "عاجل • أحدث الأخبار" : "BREAKING NEWS"}
        </span>
      </div>

      {/* 2. الـ Marquee أو شريط النصوص المتحرك */}
      <div className="flex-1 h-full flex items-center relative overflow-hidden bg-gradient-to-r from-accent to-accent-hover">
        <marquee
          behavior="scroll"
          direction={lang === "ar" ? "right" : "left"}
          scrollamount="5"
          className="w-full h-full text-xs md:text-sm font-bold pt-2.5 outline-none cursor-pointer"
          onMouseOver={(e) => {
            // توقيف الحركة مؤقتاً عند وقوف الكروس لمساعدة الطالب على القراءة بذكاء
            (e.currentTarget as any).stop();
          }}
          onMouseOut={(e) => {
            // استئناف الحركة بمجرد مغادرة الماوس
            (e.currentTarget as any).start();
          }}
          aria-label={lang === "ar" ? "شريط الأخبار العاجلة والأكاديمية للمعهد" : "Institute academic and breaking news ticker"}
          role="marquee"
        >
          {tickerItems.map((news, index) => (
            <span key={index} className="inline-flex items-center mx-8">
              <Volume2 className="w-4 h-4 inline-block ml-2 text-yellow-200" />
              <span>{news}</span>
              <span className="mr-6 text-yellow-100/60">|</span>
            </span>
          ))}
        </marquee>
      </div>

      {/* 3. شارة مساعدة للتحكم بالحركة وتنبيه المستخدم باللمس */}
      <div className="hidden sm:flex h-full items-center px-4 bg-accent-hover text-white/85 text-[11px] gap-1 shrink-0 relative z-20 select-none">
        <span className="font-medium text-[10px]">
          {lang === "ar" ? "ضع المؤشر للتثبيت 🖱️" : "Hover to pause 🖱️"}
        </span>
      </div>

    </div>
  );
}
