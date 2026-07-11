import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Heart, Sparkles, ArrowRight, ArrowLeft, Sun, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface PageLoadingIndicatorProps {
  currentTab: string;
}

export default function PageLoadingIndicator({ currentTab }: PageLoadingIndicatorProps) {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  // 1. Initial Launch Loading Screen States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialProgress, setInitialProgress] = useState(0);
  const [initialStatusMsg, setInitialStatusMsg] = useState("");

  // 2. Tab Navigation Loading States
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStatusMsg, setNavStatusMsg] = useState("");
  const prevTabRef = useRef<string>(currentTab);

  // Sound/Vibration simulation (gentle & premium)
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(8);
      } catch (e) {}
    }
  };

  // Status message list for initial loading (Aswan Social Work theme)
  const initialStatuses = isAr
    ? [
        "جاري الاتصال بقاعدة بيانات معهد أسوان...",
        "تحميل الهيكل التنظيمي وهيئة التدريس...",
        "تجهيز بوابة الطالب الرقمية الآمنة...",
        "تحميل اللوائح والقرارات المعتمدة للوزارة...",
        "بدء تشغيل النظام والربط بنجاح..."
      ]
    : [
        "Connecting to Aswan Institute database...",
        "Loading academic faculty structure...",
        "Initializing secure digital student portal...",
        "Retrieving bylaws & ministerial decrees...",
        "Starting application workspace successfully..."
      ];

  // Map of Tab specific navigation statuses
  const getTabNavigationMessage = (tabName: string) => {
    const isArLang = lang === "ar";
    switch (tabName) {
      case "home":
        return isArLang ? "جاري العودة للرئيسية..." : "Returning to homepage...";
      case "about":
        return isArLang ? "تحميل رؤية ورسالة المعهد..." : "Loading institute vision & mission...";
      case "departments":
        return isArLang ? "فتح الأقسام العلمية..." : "Accessing academic departments...";
      case "units":
        return isArLang ? "تجهيز الوحدات والمراكز التخصصية..." : "Opening specialized centers & units...";
      case "portal":
      case "student":
        return isArLang ? "تأمين الاتصال ببوابة الطالب..." : "Securing student portal connection...";
      case "exams":
        return isArLang ? "جاري جلب جداول الامتحانات الرسمية..." : "Fetching official exam schedules...";
      case "guide":
        return isArLang ? "تجهيز دليل الطالب ولائحة المعهد..." : "Preparing student guide & bylaws...";
      case "faq":
        return isArLang ? "تحميل الأسئلة الشائعة والمستندات..." : "Loading FAQs & general guidelines...";
      case "contact":
        return isArLang ? "جاري تحديد موقع الجغرافي للمعهد..." : "Locating campus map & contact info...";
      case "admin":
        return isArLang ? "تشفير لوحة التحكم والتحقق..." : "Encrypting control panel gateway...";
      default:
        return isArLang ? "جاري التحميل..." : "Loading content...";
    }
  };

  // --- Initial Launch Progress Loop ---
  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let statusIndex = 0;

    setInitialStatusMsg(initialStatuses[0]);

    const runProgress = () => {
      progressTimer = setInterval(() => {
        setInitialProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            // Stagger closing of loading screen slightly for visual beauty
            setTimeout(() => {
              setIsInitialLoading(false);
              triggerHaptic();
            }, 300);
            return 100;
          }

          // Random smooth increments
          const increment = Math.floor(Math.random() * 8) + 4;
          const nextProgress = Math.min(prev + increment, 100);

          // Rotate status messages matching progress intervals
          const targetStatusIndex = Math.min(
            Math.floor((nextProgress / 100) * initialStatuses.length),
            initialStatuses.length - 1
          );
          if (targetStatusIndex !== statusIndex) {
            statusIndex = targetStatusIndex;
            setInitialStatusMsg(initialStatuses[targetStatusIndex]);
          }

          return nextProgress;
        });
      }, 100);
    };

    runProgress();

    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, []);

  // --- Tab Navigation Transition Trigger ---
  useEffect(() => {
    // Avoid triggering navigation loading during the initial launch phase
    if (isInitialLoading) {
      prevTabRef.current = currentTab;
      return;
    }

    if (prevTabRef.current !== currentTab) {
      // Tab changed!
      setIsNavigating(true);
      setNavStatusMsg(getTabNavigationMessage(currentTab));
      triggerHaptic();

      // Fast, premium transition time (900ms)
      const navTimer = setTimeout(() => {
        setIsNavigating(false);
      }, 900);

      prevTabRef.current = currentTab;
      return () => clearTimeout(navTimer);
    }
  }, [currentTab, isInitialLoading, lang]);

  return (
    <>
      <AnimatePresence mode="wait">
        {/* ==========================================================
            1. INITIAL LAUNCH LOADING OVERLAY (GLORIOUS FULL SCREEN)
            ========================================================== */}
        {isInitialLoading && (
          <motion.div
            key="initial-loading-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.45, ease: "easeInOut" } }}
            className="fixed inset-0 w-full h-full min-h-screen z-[99999] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 text-white select-none"
          >
            {/* Traditional Nubian Sunset Style Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-amber-500/15 rounded-full blur-[90px] sm:blur-[120px] animate-pulse pointer-events-none select-none" />
            <div className="absolute bottom-12 right-12 w-[150px] sm:w-[280px] h-[150px] sm:h-[280px] bg-sky-500/10 rounded-full blur-[70px] sm:blur-[100px] pointer-events-none select-none" />
            <div className="absolute top-12 left-12 w-[120px] sm:w-[200px] h-[120px] sm:h-[200px] bg-emerald-500/10 rounded-full blur-[60px] sm:blur-[90px] pointer-events-none select-none" />

            {/* Top Logo / Institutional Seals */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none select-none opacity-40">
              <span className="text-[9px] font-mono tracking-widest uppercase text-amber-200 hidden sm:block">
                {isAr ? "معهد الخدمة الاجتماعية بأسوان" : "ASWAN SOCIAL WORK INSTITUTE"}
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400">
                {isAr ? "البوابة الرقمية الرسمية" : "OFFICIAL DIGITAL PORTAL"}
              </span>
            </div>

            {/* Main Visual Unit */}
            <div className="relative z-10 flex flex-col items-center justify-center max-w-lg px-6 text-center w-full">
              
              {/* Spinning Sun Mandala & Core Icon */}
              <div className="relative mb-8 flex justify-center items-center w-28 h-28">
                {/* Outer Rotating Sun Pattern */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-amber-500/40"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-dashed border-yellow-400/30"
                />

                {/* Central Emblem */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute rounded-full bg-gradient-to-br from-amber-500 to-amber-600 w-20 h-20 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-amber-300/30"
                >
                  <GraduationCap className="w-10 h-10 text-slate-950 stroke-[1.8]" />
                </motion.div>

                {/* Satellite Floating Accents */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.1 }}
                  className="absolute top-0 right-0 bg-sky-500 text-white p-1 rounded-full shadow-md z-20"
                >
                  <Heart className="w-3.5 h-3.5 fill-current text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.4 }}
                  className="absolute bottom-1 left-0 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-md z-20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </motion.div>
              </div>

              {/* Title Header with Aswan styling */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3 w-full"
              >
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-100 font-sans">
                  {isAr ? "المعهد العالي للخدمة الاجتماعية بأسوان" : "Aswan Higher Institute for Social Work"}
                </h1>
                <p className="text-xs text-amber-500/90 font-mono tracking-widest uppercase">
                  {isAr ? "تحت إشراف وزارة التعليم العالي" : "Under supervision of Ministry of Higher Education"}
                </p>
              </motion.div>

              {/* Ethnic Sunwave Divider */}
              <div className="my-6 flex justify-center items-center gap-2 opacity-50 w-full">
                <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-amber-500" />
                <span className="text-[10px] text-amber-500 font-mono">✦</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px] text-amber-500 font-mono">✦</span>
                <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-amber-500" />
              </div>

              {/* Loader Control Box */}
              <div className="w-72 max-w-full space-y-3.5 mx-auto">
                <div className="flex justify-between items-center text-[11px] font-mono font-bold text-amber-100">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>{initialProgress}%</span>
                  </span>
                  <span className="text-slate-400 uppercase tracking-widest text-[9px]">
                    {isAr ? "جاري التحضير" : "LOADING SYSTEM"}
                  </span>
                </div>

                {/* Professional Progress Track */}
                <div className="w-full h-1.5 bg-slate-900/85 rounded-full overflow-hidden p-[1px] border border-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 rounded-full"
                    style={{ width: `${initialProgress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>

                {/* Status Message */}
                <div className="min-h-[28px] flex items-center justify-center">
                  <p className="text-[11px] text-slate-300/95 font-medium leading-relaxed max-w-xs transition-all duration-300">
                    {initialStatusMsg}
                  </p>
                </div>

                {/* Direct Entry Skip Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <button
                    onClick={() => {
                      setIsInitialLoading(false);
                      triggerHaptic();
                    }}
                    className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-extrabold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 active:scale-95 cursor-pointer"
                  >
                    <span>{isAr ? "الدخول للبوابة فوراً" : "Enter Portal Instantly"}</span>
                    {isAr ? (
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Nubian Wisdom and Accreditation Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8 px-2 w-full"
              >
                <blockquote className="text-[11px] md:text-xs text-amber-100/90 leading-relaxed font-semibold italic">
                  {isAr 
                    ? "« الخدمة الاجتماعية رسالة إنسانية راقية تبني المجتمعات، وتعزز التكافل من منبع شمس أسوان الخالدة »" 
                    : "“Social work is a noble humanitarian mission that builds societies from the eternal golden springs of Aswan”"}
                </blockquote>
                <div className="text-[9px] text-slate-500 font-mono mt-3 uppercase tracking-widest">
                  {isAr 
                    ? "المجلس الأعلى للجامعات • جمهورية مصر العربية" 
                    : "Supreme Council of Universities • Egypt"}
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================================
          2. NAVIGATIONAL PAGE TRANSITION OVERLAY (RESPONSIVE IN MIDDLE OF SCREEN)
          ========================================================== */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            key="navigation-transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }}
            className="fixed inset-0 w-full h-full min-h-screen z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none pointer-events-auto"
          >
            {/* Highly responsive modal card designed like an official educational certificate/badge */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -5, transition: { duration: 0.18 } }}
              className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/35 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] p-6 sm:p-8 max-w-md w-full flex flex-col items-center justify-center text-center text-white relative overflow-hidden"
            >
              {/* Traditional Educational Frame Accents */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
              
              {/* Watermark of Ministry of Higher Education */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-[8px] font-mono opacity-30 text-slate-400">
                <span>{isAr ? "وزارة التعليم العالي" : "MINISTRY OF HIGHER ED."}</span>
                <span>{isAr ? "شعبة الخدمة الاجتماعية" : "SOCIAL WORK DEPT"}</span>
              </div>

              {/* Glowing Background Radial */}
              <div className="absolute -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Rotating golden sun in center & Graduation Cap */}
              <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute inset-0 border-[2px] border-dashed border-amber-500/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute inset-2 border border-dotted border-yellow-400/30 rounded-full"
                />
                
                <div className="absolute rounded-full bg-slate-800/90 w-14 h-14 flex items-center justify-center shadow-inner border border-amber-500/25">
                  <GraduationCap className="w-7 h-7 text-amber-400 stroke-[1.5] animate-pulse" />
                </div>
              </div>

              {/* Academic Institute Title */}
              <div className="space-y-1 mb-4">
                <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
                  {isAr ? "معهد الخدمة الاجتماعية بأسوان" : "ASWAN SOCIAL WORK INSTITUTE"}
                </h4>
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto my-1.5" />
                <h3 className="text-sm font-black text-slate-100">
                  {isAr ? "البوابة الأكاديمية الرقمية" : "Official Academic Gateway"}
                </h3>
              </div>

              {/* Center status heading */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 w-full space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>{isAr ? "جاري فتح القسم..." : "Transitioning Section..."}</span>
                </div>
                {/* Status Message */}
                <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xs mx-auto">
                  {navStatusMsg}
                </p>
              </div>

              {/* Small dynamic progress bar indicator */}
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-5 p-[0.5px] border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.85, ease: "easeInOut" }}
                />
              </div>

              {/* Educational Badge Verification */}
              <div className="flex items-center justify-center gap-1.5 mt-4 text-[9px] font-mono text-slate-400 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? "اتصال آمن وموثق" : "SECURED ACADEMIC LINK"}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
