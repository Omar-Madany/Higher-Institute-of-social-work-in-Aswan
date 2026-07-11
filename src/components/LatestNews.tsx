import React, { useState, useEffect } from "react";
import { Newspaper, Calendar, Search, ArrowLeft, Globe, Eye, Maximize2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType, isQuotaError } from "../lib/firebase-error";
import { motion, AnimatePresence } from "motion/react";
import { seedDefaultNews, defaultArticles } from "../lib/seedNews";

export default function LatestNews() {
  const { lang, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents] = useState<boolean>(false);

  useEffect(() => {
    function loadFallbackNews() {
      const list: any[] = [];
      defaultArticles.forEach((art) => {
        let mappedCategory = art.category;
        if (lang !== "ar") {
          if (art.category === "أخبار") mappedCategory = "News";
          else if (art.category === "إعلانات") mappedCategory = "Announcements";
          else if (art.category === "فعاليات") mappedCategory = "Events";
        } else {
          if (art.category === "News") mappedCategory = "أخبار";
          else if (art.category === "Announcements") mappedCategory = "إعلانات";
          else if (art.category === "Events") mappedCategory = "فعاليات";
        }

        const title = lang === "ar" ? art.title_ar : art.title_en;
        const summary = lang === "ar" ? art.summary_ar : art.summary_en;
        const content = lang === "ar" ? art.content_ar : art.content_en;

        list.push({
          id: art.id,
          title: title || "",
          summary: summary || "",
          content: content || "",
          date: art.date,
          category: mappedCategory,
          image: art.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop",
          badgeColor: mappedCategory === "إعلانات" || mappedCategory === "Announcements"
            ? "bg-red-500 text-white"
            : mappedCategory === "فعاليات" || mappedCategory === "Events"
            ? "bg-emerald-500 text-white"
            : "bg-blue-500 text-white",
          views: art.views ? Number(art.views).toLocaleString() : "350"
        });
      });
      setDbArticles(list);
    }

    async function loadDbNews() {
      if (sessionStorage.getItem("aswan_inst_firestore_quota_exceeded") === "true") {
        loadFallbackNews();
        return;
      }

      try {
        // Run database seeding first
        await seedDefaultNews();

        const q = query(collection(db, "news_articles"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list: any[] = [];
        snapshot.forEach((doc) => {
          if (doc.id === "_seed_flag") return; // Skip seed flag
          const data = doc.data();
          
          let mappedCategory = data.category;
          if (lang !== "ar") {
            if (data.category === "أخبار") mappedCategory = "News";
            else if (data.category === "إعلانات") mappedCategory = "Announcements";
            else if (data.category === "فعاليات") mappedCategory = "Events";
          } else {
            if (data.category === "News") mappedCategory = "أخبار";
            else if (data.category === "Announcements") mappedCategory = "إعلانات";
            else if (data.category === "Events") mappedCategory = "فعاليات";
          }

          const title = lang === "ar" ? (data.title_ar || data.title) : (data.title_en || data.title);
          const summary = lang === "ar" ? (data.summary_ar || data.summary) : (data.summary_en || data.summary);
          const content = lang === "ar" ? (data.content_ar || data.content) : (data.content_en || data.content);

          list.push({
            id: doc.id,
            title: title || "",
            summary: summary || "",
            content: content || "",
            date: data.date,
            category: mappedCategory,
            image: data.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop",
            badgeColor: mappedCategory === "إعلانات" || mappedCategory === "Announcements"
              ? "bg-red-500 text-white"
              : mappedCategory === "فعاليات" || mappedCategory === "Events"
              ? "bg-emerald-500 text-white"
              : "bg-blue-500 text-white",
            views: data.views ? Number(data.views).toLocaleString() : "350"
          });
        });
        setDbArticles(list);
      } catch (err) {
        if (isQuotaError(err)) {
          console.warn("Error loading db news (using local fallback news): ", err);
          loadFallbackNews();
        } else {
          console.error("Error loading db news: ", err);
        }
        handleFirestoreError(err, OperationType.LIST, "news_articles");
      }
    }
    loadDbNews();
  }, [lang]);

  const handleShareClick = (platform: string, article: any) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?article=${article.id}#latest-news`;
    const text = `${article.title} - ${lang === "ar" ? "المعهد العالي للخدمة الاجتماعية بأسوان" : "Aswan Higher Institute for Social Work"}`;
    
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + "\n" + shareUrl)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        break;
    }
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyLink = (articleId: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?article=${articleId}#latest-news`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(articleId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  function ArticleShare({ article, alignment = "right" }: { article: any; alignment?: "center" | "right" | "left" }) {
    const alignClass = alignment === "right" ? "justify-end" : alignment === "left" ? "justify-start" : "justify-center";

    return (
      <div className="space-y-2">
        <span className="block text-[10px] font-black text-slate-400">
          {t("news_share_title")}
        </span>
        <div className={`flex flex-wrap items-center gap-1.5 ${alignClass}`}>
          {/* Facebook */}
          <button
            onClick={() => handleShareClick("facebook", article)}
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition-all duration-300 cursor-pointer shadow-xs flex items-center justify-center border border-blue-100"
            title={t("news_share_fb")}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
            </svg>
          </button>

          {/* Twitter / X */}
          <button
            onClick={() => handleShareClick("twitter", article)}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white transition-all duration-300 cursor-pointer shadow-xs flex items-center justify-center border border-slate-200"
            title={t("news_share_tw")}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => handleShareClick("whatsapp", article)}
            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-all duration-300 cursor-pointer shadow-xs flex items-center justify-center border border-emerald-100"
            title={t("news_share_wa")}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.706 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>

          {/* Telegram */}
          <button
            onClick={() => handleShareClick("telegram", article)}
            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-500 text-sky-500 hover:text-white transition-all duration-300 cursor-pointer shadow-xs flex items-center justify-center border border-sky-100"
            title={t("news_share_tg")}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.64-.35-1 .22-1.58.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.36-.49 1-.74 3.9-1.69 6.51-2.8 7.83-3.33 3.73-1.5 4.5-1.76 5.01-1.77.11 0 .36.03.52.16.14.11.18.27.2.4.02.1-.01.27-.02.32z" />
            </svg>
          </button>

          {/* Copy Link */}
          <button
            onClick={() => handleCopyLink(article.id)}
            className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer shadow-xs flex items-center justify-center border ${
              copiedId === article.id 
                ? "bg-emerald-500 text-white border-transparent" 
                : "bg-slate-50 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
            title={t("news_share_copy")}
          >
            {copiedId === article.id ? (
              <span className="text-[9px] px-1 font-black flex items-center gap-0.5">
                ✓ {t("news_share_copied")}
              </span>
            ) : (
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }


  const filterCategories = lang === "ar" 
    ? [
        { key: "all", label: "الكل" },
        { key: "أخبار", label: "أخبار" },
        { key: "إعلانات", label: "إعلانات" },
        { key: "فعاليات", label: "فعاليات" }
      ]
    : [
        { key: "all", label: "All" },
        { key: "News", label: "News" },
        { key: "Announcements", label: "Announcements" },
        { key: "Events", label: "Events" }
      ];

  const articles = dbArticles.filter((item) => !item.id.includes("timeline-event"));
  const timelineEvents = dbArticles.filter((item) => item.id.includes("timeline-event"));
  const combinedArticles = dbArticles;

  // Deep linking and URL handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("article");
    if (articleId) {
      const art = combinedArticles.find((a) => a.id === articleId);
      if (art) {
        setSelectedArticle(art);
        setTimeout(() => {
          const element = document.getElementById("latest-news");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 800);
      }
    }
  }, [dbArticles, lang]);

  const filteredArticles = articles.filter((article) => {
    // For English filter key matching
    let isFilterMatch = false;
    if (activeFilter === "all") {
      isFilterMatch = true;
    } else {
      isFilterMatch = article.category === activeFilter;
    }
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return isFilterMatch && matchesSearch;
  });

  return (
    <section className="py-16 px-4 md:px-8 bg-slate-50/75 border-b border-gray-100" id="latest-news">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {showAllEvents ? (
          <>
            {/* زر العودة الذكي */}
            <div className="flex justify-between items-center pb-2">
              <button 
                onClick={() => setShowAllEvents(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-black rounded-xl transition-all cursor-pointer border border-slate-200/50 hover:border-red-100 shadow-2xs"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${lang === "ar" ? "rotate-180" : ""}`} />
                <span>{lang === "ar" ? "العودة للأحداث القادمة" : "Back to Upcoming Events"}</span>
              </button>
            </div>

            {/* العناوين والترويسة */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4 border-b border-gray-200">
              <div className="space-y-3 text-right">
                <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent-hover px-3 py-1 rounded-full text-[11px] font-black">
                  <Newspaper className="w-3.5 h-3.5 text-accent" />
                  <span>{t("news_badge")}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-normal">
                  {t("news_title")}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-xl leading-relaxed">
                  {t("news_desc")}
                </p>
              </div>

              {/* الباحث السريع عن الأخبار */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t("news_search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-right p-2.5 pr-10 rounded-xl border border-gray-400/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white shadow-xs"
                />
              </div>
            </div>

            {/* تصنيفات فرز الأخبار التفاعلية */}
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeFilter === category.key 
                      ? "bg-primary text-white shadow-md shadow-primary/10" 
                      : "bg-white text-slate-700 border border-gray-200 hover:bg-slate-50"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* شبكة المقالات (News Grid) */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredArticles.map((art) => {
                  const isExpanded = expandedId === art.id;
                  return (
                    <div 
                      key={art.id}
                      className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* غطاء الصورة مع بار بمدلول المقال */}
                      <div className="h-48 sm:h-52 w-full relative overflow-hidden bg-slate-100 flex items-center justify-center">
                        {art.image ? (
                          <img
                            src={art.image}
                            alt={art.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-transform"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200">
                            <span className="text-3xl">📰</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1.5">
                              {lang === "ar" ? "مكان صورة الخبر" : "News Image Place"}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 z-10">
                          <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-md ${art.badgeColor}`}>
                            {art.category}
                          </span>
                        </div>

                        {/* زر المشاركة الذكية العائم */}
                        <div className="absolute top-4 left-4 z-20">
                          <div className="relative group/share">
                            <button
                              className="bg-slate-950/65 hover:bg-accent text-white font-extrabold rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-xs border border-white/10"
                              title={lang === "ar" ? "مشاركة هذا الخبر" : "Share this article"}
                            >
                              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                              </svg>
                            </button>
                            
                            {/* القائمة المنسدلة الأنيقة عند التمرير */}
                            <div className={`absolute top-full mt-1.5 opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all duration-300 transform scale-95 origin-top-left z-30 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2.5 flex flex-col gap-1 w-36 ${lang === "ar" ? "left-0" : "left-0"}`}>
                              <button
                                onClick={() => handleShareClick("facebook", art)}
                                className="text-right text-[10px] font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600 px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 cursor-pointer"
                              >
                                <span>{t("news_share_fb")}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              </button>
                              <button
                                onClick={() => handleShareClick("twitter", art)}
                                className="text-right text-[10px] font-black text-slate-700 hover:bg-slate-50 hover:text-slate-950 px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 cursor-pointer"
                              >
                                <span>{t("news_share_tw")}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                              </button>
                              <button
                                onClick={() => handleShareClick("whatsapp", art)}
                                className="text-right text-[10px] font-black text-slate-700 hover:bg-slate-50 hover:text-emerald-600 px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 cursor-pointer"
                              >
                                <span>{t("news_share_wa")}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              </button>
                              <button
                                onClick={() => handleShareClick("telegram", art)}
                                className="text-right text-[10px] font-black text-slate-700 hover:bg-slate-50 hover:text-sky-500 px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 cursor-pointer"
                              >
                                <span>{t("news_share_tg")}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                              </button>
                              <button
                                onClick={() => handleCopyLink(art.id)}
                                className="text-right text-[10px] font-black text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg flex items-center justify-between gap-1.5 cursor-pointer"
                              >
                                <span>{copiedId === art.id ? t("news_share_copied") : t("news_share_copy")}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                      </div>

                      {/* تفاصيل الموضوع */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3 text-right">
                          {/* معلومات النشر */}
                          <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold justify-start">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{art.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-slate-400" />
                              <span>{art.views} {t("news_views")}</span>
                            </div>
                          </div>

                          <h3 className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 group-hover:text-primary leading-normal line-clamp-2 transition-colors">
                            {art.title}
                          </h3>
                          
                          <p className="text-[11px] sm:text-xs text-slate-500 font-bold leading-relaxed line-clamp-3">
                            {art.summary}
                          </p>

                          {/* Smooth inline height transition animation */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: "easeInOut" }}
                                className="overflow-hidden border-t border-slate-100 pt-3 mt-3"
                              >
                                <p className="text-[11px] sm:text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line text-justify">
                                  {art.content}
                                </p>
                                
                                {/* شريط المشاركة المدمج */}
                                <div className="border-t border-slate-100 pt-3 mt-4">
                                  <ArticleShare article={art} alignment={lang === "ar" ? "right" : "left"} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : art.id)}
                            className="flex-1 bg-slate-50 hover:bg-slate-950 group-hover:bg-primary text-slate-800 hover:text-white group-hover:text-white text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-gray-200/50 hover:border-transparent"
                          >
                            <span>{isExpanded ? (lang === "ar" ? "عرض أقل" : "Show Less") : t("news_read_button")}</span>
                            <ArrowLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "-rotate-90" : ""}`} />
                          </button>

                          {isExpanded && (
                            <button
                              onClick={() => setSelectedArticle(art)}
                              className="bg-accent/10 hover:bg-accent text-accent hover:text-white text-xs font-black p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer border border-accent/20 hover:border-transparent shadow-xs"
                              title={lang === "ar" ? "قراءة بملء الشاشة" : "Read full screen"}
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 space-y-4">
                <span className="text-4xl">🔎</span>
                <h5 className="font-bold text-slate-700 text-sm">{t("news_no_results")}</h5>
                <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto">
                  {t("news_no_results_desc")}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* الترويسة الرئيسية للقسم الإخباري بأسوان */}
            <div className="text-center space-y-3">
              <span className="text-xs bg-red-100 text-red-600 border border-red-200 font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
                {lang === "ar" ? "المركز الإعلامي والمستجدات" : "Media Center & Latest Updates"}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-normal relative inline-block">
                <span>{lang === "ar" ? "أخبار وفعاليات المعهد" : "Institute News & Events"}</span>
                <span className="block w-24 h-1.5 bg-accent mx-auto mt-2 rounded-full"></span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
                {lang === "ar" 
                  ? "تابع آخر أخبار المعهد العالي للخدمة الاجتماعية بأسوان، القرارات الأكاديمية الرسمية، والفعاليات القادمة لحظة بلحظة." 
                  : "Keep track of the latest news from Aswan Higher Institute for Social Work, official academic announcements, and upcoming events."}
              </p>
            </div>

            {/* شبكة العرض المختلطة الحديثة */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* القسم الأيمن في لغة العرب (الأخبار المميزة) - 8 أعمدة من 12 */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 1. الخبر البارز المميز (Large Highlight Card) */}
                {articles.length > 0 && (() => {
                  const featured = articles[0];
                  return (
                    <div 
                      key={featured.id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col md:flex-row relative"
                    >
                      {/* خلفية صورة الخبر البارز */}
                      <div className="md:w-1/2 h-64 md:h-auto min-h-[250px] relative overflow-hidden bg-slate-100">
                        {featured.image ? (
                          <img 
                            src={featured.image} 
                            alt={featured.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <span className="text-4xl">📰</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 z-10">
                          <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-full shadow-md ${featured.badgeColor}`}>
                            {featured.category}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-slate-950/40 via-transparent to-transparent"></div>
                      </div>

                      {/* محتوى الخبر البارز */}
                      <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-4 text-right">
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold justify-start">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{featured.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-slate-400" />
                              <span>{featured.views} {lang === "ar" ? "مشاهدة" : "Views"}</span>
                            </div>
                          </div>

                          <span className="text-xs bg-accent/10 text-accent font-black px-2.5 py-0.5 rounded w-fit block">
                            {lang === "ar" ? "أخبار المعهد الهامة" : "Important News"}
                          </span>

                          <h3 
                            onClick={() => setSelectedArticle(featured)}
                            className="font-black text-slate-900 hover:text-primary text-base sm:text-lg leading-snug transition-colors cursor-pointer line-clamp-3"
                          >
                            {featured.title}
                          </h3>

                          <p className="text-slate-500 text-xs font-bold leading-relaxed line-clamp-3">
                            {featured.summary}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex gap-2">
                          <button
                            onClick={() => setSelectedArticle(featured)}
                            className="flex-1 bg-primary hover:bg-slate-900 text-white text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>{lang === "ar" ? "اقرأ الخبر كاملاً" : "Read Full Story"}</span>
                            <ArrowLeft className={`w-3.5 h-3.5 ${lang === "ar" ? "" : "rotate-180"}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. شبكة الأخبار الجانبية الأصغر (Small Side Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.slice(1, 3).map((art) => (
                    <div 
                      key={art.id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* غطاء الصورة */}
                      <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                        {art.image ? (
                          <img 
                            src={art.image} 
                            alt={art.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 duration-500 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">📰</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 z-10">
                          <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full shadow-sm ${art.badgeColor}`}>
                            {art.category}
                          </span>
                        </div>
                      </div>

                      {/* محتوى الخبر الصغير */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 text-right">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-[9px] text-gray-400 font-bold justify-start">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{art.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{art.views}</span>
                            </div>
                          </div>

                          <h4 
                            onClick={() => setSelectedArticle(art)}
                            className="font-extrabold text-slate-900 hover:text-primary text-xs sm:text-sm leading-snug line-clamp-2 transition-colors cursor-pointer"
                          >
                            {art.title}
                          </h4>
                          
                          <p className="text-slate-500 text-[11px] font-bold leading-relaxed line-clamp-2">
                            {art.summary}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedArticle(art)}
                            className="text-primary hover:text-accent text-[11px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>{lang === "ar" ? "قراءة المزيد" : "Read More"}</span>
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* القسم الأيسر في لغة العرب (4 أعمدة من أصل 12: خط الأحداث الزمنية الأنيق) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-200/60 shadow-md">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200/85 mb-6">
                    <span className="text-[10px] bg-red-100 text-red-600 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      {lang === "ar" ? "فعاليات مستقبلية" : "Upcoming Events"}
                    </span>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base text-right">
                      {lang === "ar" ? "مواعيد وفعاليات هامة" : "Key Events Schedule"}
                    </h3>
                  </div>

                  {/* خط الزمن العمودي الفخم الصغير */}
                  <div className="relative pl-0 space-y-6">
                    {/* الخط الرأسي للأحداث */}
                    <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-red-200" />

                    {timelineEvents.slice(0, 4).map((event) => (
                      <div key={event.id} className="relative flex gap-4 items-start pr-8">
                        {/* النقطة الزمنية الحمراء */}
                        <div className="absolute right-[10px] top-1.5 w-5 h-5 bg-white border-4 border-red-500 rounded-full flex items-center justify-center shadow-xs z-10" />

                        {/* الكارت الصغير لكل حدث */}
                        <div className="flex-1 space-y-1.5 text-right bg-white p-4 rounded-2xl border border-slate-100 hover:border-red-100 hover:shadow-md transition-all duration-300">
                          <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded inline-block">
                            {event.date}
                          </span>
                          <h4 
                            onClick={() => setSelectedArticle(event)}
                            className="font-extrabold text-slate-900 hover:text-red-600 text-xs leading-snug cursor-pointer transition-colors line-clamp-2"
                          >
                            {event.title}
                          </h4>
                          <p className="text-slate-500 text-[10px] font-bold leading-relaxed line-clamp-2">
                            {event.summary}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* رابط عرض الكل */}
                  <div className="pt-6 border-t border-slate-200 mt-6 text-center">
                    <button
                      onClick={() => {
                        setShowAllEvents(true);
                        const element = document.getElementById("latest-news");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-black flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                    >
                      <span>{lang === "ar" ? "تصفح كافة الفعاليات والمستجدات" : "View All Events & News"}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* المودال الشامل لقراءه الخبر بالكامل مثل المواقع الإخبارية للجامعات */}
        <AnimatePresence>
          {selectedArticle && (
            <div 
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedArticle(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* غطاء الصورة في المودال */}
                <div className="h-56 sm:h-64 w-full relative shrink-0 flex items-center justify-center">
                  {selectedArticle.image ? (
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 border-b border-slate-800 border-dashed">
                      <span className="text-4xl mb-1">📰</span>
                      <span className="text-xs text-slate-500 font-bold">
                        {lang === "ar" ? "مساحة مخصصة لصورة الخبر" : "News Image Space"}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="absolute top-4 left-4 bg-slate-950/60 hover:bg-slate-950 text-white font-extrabold rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer shadow"
                  >
                    ✕
                  </button>
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`text-[10px] uppercase font-black px-3.5 py-1.5 rounded-full shadow ${selectedArticle.badgeColor}`}>
                      {selectedArticle.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  <div className="absolute bottom-4 right-4 left-4 text-white space-y-1 text-right">
                    <div className="flex items-center gap-1 text-[10px] text-yellow-300 font-bold justify-start">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t("news_modal_published")} {selectedArticle.date}</span>
                    </div>
                    <h4 className="text-sm sm:text-base md:text-lg font-black leading-snug">{selectedArticle.title}</h4>
                  </div>
                </div>

                {/* نص الخبر بالكامل مع إمكانية التمرير */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-right">
                  <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed whitespace-pre-line text-justify">
                    {selectedArticle.content}
                  </p>

                  {/* شريط مشاركة الخبر داخل النافذة الكاملة */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <ArticleShare article={selectedArticle} alignment={lang === "ar" ? "right" : "left"} />
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>{t("news_modal_extra")}</span>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{t("news_modal_portal")}</span>
                    </div>
                  </div>
                </div>

                {/* أزرار الأسفل للإغلاق والتحكم */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="bg-primary hover:bg-slate-900 text-white font-black text-xs py-2 px-6 rounded-xl transition-all shadow cursor-pointer text-center"
                  >
                    {t("news_modal_close")}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
