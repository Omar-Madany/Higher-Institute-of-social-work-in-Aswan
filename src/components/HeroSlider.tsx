import React, { useState, useEffect } from "react";
import { SLIDER_ITEMS } from "../data";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function HeroSlider() {
  const { lang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  // تحديث السلايد تلقائيا كل 6 ثوانٍ
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDER_ITEMS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDER_ITEMS.length) % SLIDER_ITEMS.length);
  };

  const localizedSlides = lang === "ar" ? SLIDER_ITEMS : [
    {
      id: 1,
      title: "Aswan Higher Institute for Social Work",
      subtitle: "Over fifty years of academic dedication preparing social development leaders and sustainable care experts.",
      image: "/assets/images/frontview7.png"
    },
    {
      id: 2,
      title: "Accredited Degrees & Government Equivalency",
      subtitle: "Our Bachelor's of Social Work is equivalent to national university degrees & accredited by Higher Education.",
      image: "/assets/images/2secondview.jpg"
    },
    {
      id: 3,
      title: "Elite Environment & Rich Field Internships",
      subtitle: "Intertwining theoretical frameworks with on-field training inside Aswan’s medical, school, and welfare associations.",
      image: "/assets/images/studying.jpg"
    },
    {
      id: 4,
      title: "A Unique Journey In Beautiful Aswan",
      subtitle: "Enjoy studying inside Aswan, one of the world's most glorious natural cities, under great climate encouraging research.",
      image: "/assets/images/nile_view_1783237363654.jpg"
    }
  ];

  return (
    <div className="relative w-full h-[370px] sm:h-[450px] md:h-[550px] bg-slate-900 overflow-hidden">
      
      {/* 1. السلايدز مصفوفة صور الخلفية مع الفلاتر السينمائية */}
      {localizedSlides.map((item, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={item.id}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
              isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0 pointer-events-none"
            }`}
          >
            {/* الصورة الرسمية مع تقليل السطوع لضمان تباين مريح للقراءة، أو عرض عنصر مخصص فارغ */}
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover filter brightness-[0.4]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center border-4 border-dashed border-slate-800 p-6">
                <span className="text-4xl text-slate-700 mb-2">🖼️</span>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  {lang === "ar" ? "مساحة مخصصة لصورة السلايدر (فارغة حالياً)" : "Slider Image Space (Currently Empty)"}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">
                  {lang === "ar" ? "سيتم ملؤها تلقائياً عند إضافة رابط الصورة" : "Will be automatically filled when an image URL is supplied"}
                </p>
              </div>
            )}
            
            {/* تراكب تدرج لوني يعكس الفخامة مستوحى من الأكاديمية العربية */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-900/50 pointer-events-none" />
            
            {/* محتوى الكتابة والتواصل */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-12">
              <div className="max-w-4xl text-center text-white space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* شارة تميز المعهد الصعيدي العريق */}
                <div className="inline-flex items-center gap-1 bg-accent/25 border border-accent/60 text-yellow-300 text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full uppercase tracking-wider mx-auto">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
                  <span>
                    {lang === "ar" ? "الريادة الأكاديمية منذ 1975 م" : "Academic Leadership Since 1975"}
                  </span>
                </div>
                
                {/* عنوان السلايد العريض */}
                <h2 className="text-base sm:text-3xl md:text-5xl font-black leading-snug sm:leading-tight drop-shadow-md text-white whitespace-pre-line">
                  {item.title}
                </h2>
                
                {/* الوصف والسطر المساعد */}
                <p className="text-[11px] sm:text-sm md:text-lg text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
                  {item.subtitle}
                </p>

                {/* روابط تفاعلية داخل السلايدر */}
                <div className="flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
                  <span className="bg-accent text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full shadow-md sm:shadow-lg">
                    {lang === "ar" ? "شهادة معتمدة حكومياً 🎓" : "Government Accredited Certificate 🎓"}
                  </span>
                  <span className="bg-primary/90 backdrop-blur-xs text-yellow-300 text-[10px] sm:text-xs font-semibold px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full border border-accent/25">
                    {lang === "ar" ? "رعاية اجتماعية شاملة ☘️" : "Comprehensive Student Welfare ☘️"}
                  </span>
                </div>

              </div>
            </div>
          </div>
        );
      })}

      {/* 2. أزرار التحكم للتمرير اليدوي الفوري اليمين واليسار */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 hover:scale-105 text-white p-2.5 rounded-full z-20 backdrop-blur-sm transition-all focus:outline-none cursor-pointer"
        title={lang === "ar" ? "الشريحة السابقة" : "Previous Slide"}
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 hover:scale-105 text-white p-2.5 rounded-full z-20 backdrop-blur-sm transition-all focus:outline-none cursor-pointer"
        title={lang === "ar" ? "الشريحة التالية" : "Next Slide"}
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* 3. مؤشرات النقط السفلية التفاعلية */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
        {localizedSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentIndex ? "w-8 bg-accent" : "w-2 bg-white/45 hover:bg-white/80"
            }`}
            title={lang === "ar" ? `الانتقال للشريحة رقم ${i + 1}` : `Go to slide ${i + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
