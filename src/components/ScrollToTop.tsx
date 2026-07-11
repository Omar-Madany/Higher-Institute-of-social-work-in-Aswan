import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

export default function ScrollToTop() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [isVisible, setIsVisible] = useState(false);

  // مراقبة التمرير لإظهار أو إخفاء زر الذهاب لأعلى
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 bg-accent hover:bg-slate-900 text-white rounded-full p-3.5 shadow-xl border border-white/20 transition-colors duration-300 pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent group hover:scale-115 active:scale-90 flex items-center justify-center"
          title={isAr ? "الذهاب إلى أعلى الصفحة" : "Scroll to Top"}
          id="scroll-to-top-btn"
        >
          <ArrowUp className="w-5 h-5 text-white animate-bounce group-hover:translate-y-[-2px] transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
