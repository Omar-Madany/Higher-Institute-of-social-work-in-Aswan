import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Flame, Compass } from "lucide-react";

export default function NetworkStatusWidget() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [latencyStatus, setLatencyStatus] = useState<"fast" | "slow" | "offline" | "checking" | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [showWidget, setShowWidget] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // 1. Listen to native online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnectionQuality();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLatencyStatus("offline");
      setShowWidget(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setLatencyStatus("offline");
      setShowWidget(true);
    } else {
      // Periodic gentle network checking to prevent surprise lockouts
      checkConnectionQuality();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. Measure real round-trip latency to assess if connection is slow
  const checkConnectionQuality = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setLatencyStatus("offline");
      return;
    }

    setIsMeasuring(true);
    const startTime = performance.now();

    try {
      // Fetch a small fast endpoint or cache-busted tiny resource
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s timeout

      await fetch("/api/health?t=" + Date.now(), {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setLatencyMs(duration);

      if (duration > 1200) {
        // Slow Connection
        setLatencyStatus("slow");
        setShowWidget(true);
      } else {
        // Fast Connection
        setLatencyStatus("fast");
        // If it was slow or offline before, show success brief toast then hide
        setTimeout(() => setShowWidget(false), 3500);
      }
    } catch (err) {
      // If fetching fails entirely or times out, consider it slow or offline
      setLatencyStatus("slow");
      setShowWidget(true);
    } finally {
      setIsMeasuring(false);
    }
  };

  return (
    <>
      {/* Floating Aswan-style Interactive Network Status Toast / Banner */}
      <AnimatePresence>
        {showWidget && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-22 right-4 left-4 md:left-auto md:right-6 md:w-96 z-50 rounded-2xl border bg-slate-900/95 backdrop-blur-md text-white shadow-2xl overflow-hidden border-amber-500/20"
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Ambient Desert Sun Accent Line */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${
              latencyStatus === "offline" || !isOnline
                ? "from-rose-500 to-amber-600"
                : latencyStatus === "slow"
                ? "from-amber-500 to-yellow-400"
                : "from-emerald-500 to-teal-400"
            }`} />

            <div className="p-4 sm:p-5">
              {/* Status Header */}
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl ${
                  latencyStatus === "offline" || !isOnline
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : latencyStatus === "slow"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {!isOnline || latencyStatus === "offline" ? (
                    <WifiOff className="w-5 h-5 animate-bounce" />
                  ) : latencyStatus === "slow" ? (
                    <div className="relative">
                      <Wifi className="w-5 h-5 opacity-40" />
                      <AlertTriangle className="w-4 h-4 text-amber-500 absolute -bottom-1 -right-1 animate-pulse" />
                    </div>
                  ) : (
                    <Wifi className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-sm font-bold flex items-center gap-1.5 text-slate-100">
                    {!isOnline || latencyStatus === "offline" ? (
                      <span>{isAr ? "انقطع الاتصال بالإنترنت!" : "Internet Disconnected!"}</span>
                    ) : latencyStatus === "slow" ? (
                      <span>{isAr ? "اتصال إنترنت بطيء وضغيف" : "Slow Connection Detected"}</span>
                    ) : (
                      <span>{isAr ? "تمت استعادة الاتصال بنجاح" : "Connection Restored"}</span>
                    )}
                  </h4>

                  <p className="text-[11.5px] text-slate-300 leading-relaxed font-medium">
                    {!isOnline || latencyStatus === "offline" ? (
                      isAr
                        ? "مجرى الخدمة متوقف حالياً كرمال انقطاع الإنترنت. يرجى مراجعة جهاز المودم أو باقة الجوال."
                        : "The official academic portal is paused due to network loss. Please verify your mobile data or Wi-Fi."
                    ) : latencyStatus === "slow" ? (
                      isAr
                        ? "تحميل المرفقات وصور المعهد قد يتأخر قليلاً بسبب ضعف الشبكة. جاري تكييف جودة البوابة تلقائياً."
                        : "Portal media and college documents might load slower due to network congestion. Adapting layout quality."
                    ) : (
                      isAr
                        ? "متصل الآن بشبكة المعهد بكفاءة تامة. يمكنك تصفح كافة الخدمات والنتائج بسلاسة."
                        : "Successfully connected. You can now browse programs, exam tables, and academic results smoothly."
                    )}
                  </p>
                </div>
              </div>

              {/* Nubian Geometric Divider */}
              <div className="my-3.5 flex items-center justify-center gap-1 opacity-20">
                <span className="w-full h-[1px] bg-slate-600" />
                <span className="text-[8px] font-mono">✦</span>
                <span className="w-full h-[1px] bg-slate-600" />
              </div>

              {/* Interactive controls and feedback info */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-[10px] font-mono text-slate-400">
                  {latencyMs !== null && isOnline && latencyStatus !== "offline" && (
                    <span>
                      {isAr ? "زمن الاستجابة: " : "Latency: "}
                      <strong className={latencyStatus === "slow" ? "text-amber-400" : "text-emerald-400"}>
                        {latencyMs}ms
                      </strong>
                    </span>
                  )}
                  {(!isOnline || latencyStatus === "offline") && (
                    <span className="text-rose-400 font-bold uppercase tracking-wider">
                      {isAr ? "وضع عدم الاتصال" : "OFFLINE MODE"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Minimize button */}
                  <button
                    onClick={() => setShowWidget(false)}
                    className="text-[10px] hover:text-white text-slate-400 font-semibold px-2 py-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isAr ? "إخفاء" : "Dismiss"}
                  </button>

                  {/* Refetch / Diagnostic ping button */}
                  <button
                    onClick={checkConnectionQuality}
                    disabled={isMeasuring}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-[10px] sm:text-xs font-bold text-amber-400 px-3 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer active:scale-95"
                  >
                    <RefreshCw className={`w-3 h-3 ${isMeasuring ? "animate-spin text-amber-500" : ""}`} />
                    <span>{isAr ? "إعادة فحص الاتصال" : "Test Connection"}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Quick Check Indicator Button (visible when widget is closed, but network becomes slow/offline) */}
      <AnimatePresence>
        {!showWidget && (latencyStatus === "slow" || !isOnline) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowWidget(true)}
            className={`fixed bottom-22 right-4 z-50 p-3 rounded-full shadow-lg flex items-center justify-center border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              !isOnline
                ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-rose-600/20"
                : "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400 shadow-amber-500/20"
            }`}
            title={isAr ? "حالة شبكة الإنترنت" : "Network connection health"}
          >
            {!isOnline ? (
              <WifiOff className="w-5 h-5 animate-pulse" />
            ) : (
              <div className="relative">
                <Wifi className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-900"></span>
                </span>
              </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
