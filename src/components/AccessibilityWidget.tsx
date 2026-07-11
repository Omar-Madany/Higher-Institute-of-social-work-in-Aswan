import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Eye, Volume2, Type, RefreshCcw, Accessibility, Check, X, ShieldAlert, Sun, Moon } from "lucide-react";

interface AccessibilityWidgetProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function AccessibilityWidget({ darkMode, setDarkMode }: AccessibilityWidgetProps) {
  const { lang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [voiceReader, setVoiceReader] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isAr = lang === "ar";

  // Handle outside clicks to close the accessibility menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Apply Font Size changes to HTML root element (scales all rem units perfectly)
  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "normal") {
      root.style.fontSize = "16px";
    } else if (fontSize === "large") {
      root.style.fontSize = "18px";
    } else if (fontSize === "xlarge") {
      root.style.fontSize = "20px";
    }
  }, [fontSize]);

  // Apply high contrast state to document element
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [highContrast]);

  // Apply grayscale state to document element
  useEffect(() => {
    const root = document.documentElement;
    if (grayscale) {
      root.classList.add("grayscale-mode");
    } else {
      root.classList.remove("grayscale-mode");
    }
  }, [grayscale]);

  // Apply dyslexia-friendly font to body element
  useEffect(() => {
    const body = document.body;
    if (dyslexicFont) {
      body.classList.add("dyslexic-mode");
    } else {
      body.classList.remove("dyslexic-mode");
    }
  }, [dyslexicFont]);

  // Setup dynamic Voice Reader click listeners on headings, paragraphs, and lists
  useEffect(() => {
    if (!voiceReader) return;

    const handleSpeechClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Identify readable elements
      const isReadable = 
        target.tagName.match(/^(P|H1|H2|H3|H4|H5|H6|SPAN|LI|BUTTON|A)$/) ||
        target.closest("p") || target.closest("h1") || target.closest("h2") || 
        target.closest("h3") || target.closest("h4") || target.closest("h5") || 
        target.closest("h6") || target.closest("button");

      if (isReadable) {
        event.stopPropagation();
        event.preventDefault();

        // Get text representation
        const textToSpeak = target.innerText || target.textContent || "";
        if (!textToSpeak.trim()) return;

        // Cancel previous utterances to avoid queuing delay
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Match voice language
        if (isAr) {
          utterance.lang = "ar-EG";
        } else {
          utterance.lang = "en-US";
        }

        // Add subtle animation feedback to the clicked element
        target.classList.add("ring-2", "ring-accent", "ring-offset-2", "duration-300");
        setTimeout(() => {
          target.classList.remove("ring-2", "ring-accent", "ring-offset-2");
        }, 1200);

        window.speechSynthesis.speak(utterance);
      }
    };

    // Add click capturing handler to intercept and read aloud elements
    document.addEventListener("click", handleSpeechClick, true);

    return () => {
      document.removeEventListener("click", handleSpeechClick, true);
      window.speechSynthesis.cancel();
    };
  }, [voiceReader, isAr]);

  const resetAll = () => {
    setFontSize("normal");
    setHighContrast(false);
    setGrayscale(false);
    setDyslexicFont(false);
    setVoiceReader(false);
    setDarkMode(false);
    window.speechSynthesis.cancel();
  };

  return (
    <div className="fixed bottom-24 left-6 z-50 notranslate" dir={isAr ? "rtl" : "ltr"} ref={panelRef}>
      {/* Floating Accessibility Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-primary hover:bg-blue-950 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 border-accent cursor-pointer focus:outline-none"
        title={isAr ? "تسهيلات الاستخدام" : "Accessibility Options"}
        aria-label="Toggle Accessibility Menu"
      >
        {isOpen ? <X className="w-6 h-6 animate-spin duration-300" /> : <Accessibility className="w-6 h-6 animate-pulse" />}
      </button>

      {/* Accessibility Control Panel Box */}
      {isOpen && (
        <div className={`absolute bottom-16 ${isAr ? "left-0" : "left-0"} w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4 animate-in slide-in-from-bottom duration-300 z-50`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-primary" />
              <h4 className="font-extrabold text-sm text-slate-900">
                {isAr ? "تسهيلات الاستخدام الرقمية" : "Digital Accessibility Assistance"}
              </h4>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Core Settings Menu */}
          <div className="space-y-4">
            
            {/* 1. Font Size Multiplier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 justify-start">
                <Type className="w-4 h-4 text-primary" />
                <span>{isAr ? "حجم خط القراءة والدراسة:" : "Academic Font Size:"}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setFontSize("normal")}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    fontSize === "normal"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isAr ? "افتراضي" : "Default"}
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    fontSize === "large"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isAr ? "كبير (+١٥٪)" : "Large (+15%)"}
                </button>
                <button
                  onClick={() => setFontSize("xlarge")}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    fontSize === "xlarge"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {isAr ? "ضخم (+٣٠٪)" : "Huge (+30%)"}
                </button>
              </div>
            </div>

            {/* 2. High Contrast Mode Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800">{isAr ? "تباين لوني عالي" : "High Contrast"}</span>
                  <span className="block text-[9px] text-slate-500 font-semibold">{isAr ? "تسهيل رؤية العناصر والنصوص" : "Enhanced contrast overlay"}</span>
                </div>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  highContrast ? "bg-accent justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* 3. Grayscale Mode Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs">🎨</span>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800">{isAr ? "عرض أبيض وأسود" : "Grayscale Mode"}</span>
                  <span className="block text-[9px] text-slate-500 font-semibold">{isAr ? "ألوان أحادية لعمى الألوان" : "Monochrome color blindness view"}</span>
                </div>
              </div>
              <button
                onClick={() => setGrayscale(!grayscale)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  grayscale ? "bg-accent justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* 4. Dyslexia Friendly Font Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs">📖</span>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800">{isAr ? "خط ميسر للقراءة" : "Dyslexia Friendly"}</span>
                  <span className="block text-[9px] text-slate-500 font-semibold">{isAr ? "تغيير الخط لتسهيل القراءة" : "High legibility typeface & spacing"}</span>
                </div>
              </div>
              <button
                onClick={() => setDyslexicFont(!dyslexicFont)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  dyslexicFont ? "bg-accent justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* Dark Mode Toggle inside Accessibility Panel */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-primary" />}
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800">{isAr ? "المظهر الداكن" : "Dark Mode"}</span>
                  <span className="block text-[9px] text-slate-500 font-semibold">{isAr ? "تحويل الألوان لراحة العينين" : "Turn layout to dark theme"}</span>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  darkMode ? "bg-accent justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* 5. Voice Reader Interactive Voice Mode */}
            <div className="flex flex-col p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-800">{isAr ? "القارئ الصوتي التفاعلي" : "Interactive Voice Reader"}</span>
                    <span className="block text-[9px] text-slate-500 font-semibold">{isAr ? "اضغط على أي نص لقراءته بصوت مسموع" : "Click any text block to read aloud"}</span>
                  </div>
                </div>
                <button
                  onClick={() => setVoiceReader(!voiceReader)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                    voiceReader ? "bg-accent justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>
              
              {voiceReader && (
                <div className="text-[10px] bg-accent/10 border border-accent/20 rounded p-1.5 text-accent font-semibold flex items-start gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    {isAr 
                      ? "مفعّل! يمكنك الآن النقر فوق أي فقرة أو عنوان أو زر بالموقع ليتم نطقه صوتياً."
                      : "Activated! Click on any heading, paragraph or link to read it aloud."}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Footer controls: Reset Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={resetAll}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>{isAr ? "إعادة تعيين كافة الخيارات" : "Reset All Adjustments"}</span>
            </button>
            
            <div className="text-[9px] text-slate-400 font-bold">
              {isAr ? "المعهد العالي لخدمة أسوان" : "Aswan Social Work Inst."}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
