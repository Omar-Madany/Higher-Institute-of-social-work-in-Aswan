import React, { useState, useEffect, useRef } from "react";
import { Award, Calendar, Users2, Landmark, GraduationCap } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface CounterProps {
  target: number;
  suffix?: string;
  hasComma?: boolean;
}

function Counter({ target, suffix = "", hasComma = false }: CounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const duration = 2000; // 2 seconds animation duration
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out quadratic function
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentProgress = easeOutQuad(progress);

      const value = Math.floor(currentProgress * target);
      setCount(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, target]);

  const formatNumber = (num: number) => {
    if (hasComma) {
      return num.toLocaleString("en-US");
    }
    return num.toString();
  };

  return (
    <span ref={elementRef} className="tabular-nums">
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export default function StatsOverlay() {
  const { t } = useLanguage();

  const stats = [
    {
      id: 1,
      target: 1975,
      suffix: "",
      hasComma: false,
      title: t("stats_stat1_title"),
      desc: t("stats_stat1_desc"),
      icon: Calendar,
      color: "text-accent",
      bg: "bg-accent/10 border-accent/20",
    },
    {
      id: 2,
      target: 18500,
      suffix: "+",
      hasComma: true,
      title: t("stats_stat2_title"),
      desc: t("stats_stat2_desc"),
      icon: GraduationCap,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      id: 3,
      target: 120,
      suffix: "+",
      hasComma: false,
      title: t("stats_stat3_title"),
      desc: t("stats_stat3_desc"),
      icon: Users2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: 4,
      target: 95,
      suffix: "+",
      hasComma: false,
      title: t("stats_stat4_title"),
      desc: t("stats_stat4_desc"),
      icon: Landmark,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      {/* Background with glowing effects */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header container */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-4 py-1.5 rounded-full text-[11px] font-black text-slate-300">
            <Award className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>{t("stats_section_badge")}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            {t("stats_section_title")}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-bold leading-relaxed">
            {t("stats_section_desc")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`text-2xl md:text-3.5xl font-black ${stat.color} block tracking-tight font-mono`}>
                      <Counter target={stat.target} suffix={stat.suffix} hasComma={stat.hasComma} />
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-white transition-colors">
                      {stat.title}
                    </h4>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${stat.bg} ${stat.color} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="border-t border-slate-800/50 mt-4 pt-3">
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
