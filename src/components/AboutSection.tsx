import React, { useState } from "react";
import { Award, Compass, ShieldCheck, Target, Sparkles, AlertCircle, FileText, ExternalLink } from "lucide-react";
import { INST_INFO } from "../data";
import { useLanguage } from "../context/LanguageContext";

export default function AboutSection() {
  const { lang } = useLanguage();
  // حالة تفعيل التبويبات الداخلية لعرض التفاصيل الأكاديمية
  const [activeSubTab, setActiveSubTab] = useState<"who" | "vision" | "dean" | "degree">("who");

  const isAr = lang === "ar";

  const content = {
    ar: {
      badge: "الصرح العريق بالصعيد الأعلى",
      title: "نبذة تاريخية وأكاديمية عن المعهد",
      desc: "منذ أكثر من 50 عاماً، والمعهد العالي للخدمة الاجتماعية بأسوان يخرّج رواداً وأخصائيين اجتماعيين في قيادة دفة التكافل الاجتماعي والتنمية بمصر والوطن العربي.",
      tabWho: "تأسيس المعهد",
      tabVision: "الرؤية والرسالة الأكاديمية",
      tabDean: "كلمة إدارة المعهد بأسوان",
      tabDegree: "الشهادة والمعادلة الجامعية",
      whoText1: `تأسس ${INST_INFO.nameAr} عام ${INST_INFO.established} كأحد أقدم وأكبر الصروح المتخصصة في جنوب الصعيد بجمهورية مصر العربية بموافقات وقرارات رسمية من وزارة التعليم العالي.`,
      whoText2: "يستند المعهد في نظامه التدريبي على دمج العلوم الإنسانية التطوّيرية، علم النفس، تشريعات الرعاية بمختلف الفئات وعقد بروتوكولات تدريب ميداني مستمرة في قرى ومدن محافظة أسوان ومستشفياتها لتخريج أخصائيين أكفاء مستعدين لقيادة برامج المساعدات الإنسانية والتنمية المستدامة.",
      whoAlert: "تم توثيق بيانات التأسيس والاعتماد من المجلس الأعلى للجامعات بناء على سجلات دليل الجامعات المصرية المعتمد بوزارة التعليم العالي.",
      visionTitle: "رؤية المعهد:",
      visionText: "الريادة والتميز في تعليم مهنة الخدمة الاجتماعية محلياً وإقليمياً بما يتماشى مع متغيرات التحول الرقمي طبقاً للمعايير الأكاديمية القومية للجودة والإعتماد.",
      missionTitle: "رسالة المعهد:",
      missionText: "يسعى المعهد لإعداد أخصائي اجتماعي معد علمياً وعملياً وبحثياً ومهارياً قادر علي تلبية احتياجات سوق العمل لخدمة المجتمع والبيئة في ضوء أخلاقيات المهنة.",
      deanText1: `"أعزائي الطلاب وأبنائي الكرام، أرحب بكم في رحاب المعهد العالي للخدمة الاجتماعية بأسوان. إن الخدمة الاجتماعية ليست مجرد تخصص دراسي، بل هي أمانة إنسانية ورسالة وطنية سامية لرفع قيمة الفرد ووعي المجتمع والنهوض به."`,
      deanText2: "نحن نلتزم بالارتقاء بالعملية التعليمية، والالتزام بمعايير الجودة والاعتماد الأكاديمي، وتوفير كل سبل الدعم والأنشطة الطلابية ورعاية المواهب لخوض غمار سوق العمل بمستوى يليق بالمؤسسة العريقة.",
      deanSign: "— إدارة المعهد والوكلاء",
      degreeText: "يمنح المعهد طلابه الخريجين درجة بكالوريوس الخدمة الاجتماعية وهي درجة معتمدة ومعادلة للدرجات التي تمنحها كليات جامعة حلوان وباقي الجامعات المصرية بموجب موافقة المجلس الأعلى للجامعات.",
      degreeCard1Title: "طبيعة الدراسة",
      degreeCard1Desc: "4 سنوات بنظام الفصول الدراسية",
      degreeCard2Title: "الترخيص والاعتماد",
      degreeCard2Desc: "معادل للجامعات الحكومية تماماً",
      landscapeBadge: "بيئة الدراسة الخلابة",
      landscapeTitle: "أسوان • ملتقى الأكاديميين والثقافات",
      landscapeDesc: "شريان النيل والخدمات الصحية والأهلية بأسوان",
      contactTitle: "عنوان المعهد للتسجيل والزيارات:",
      contactPhone: "تليفون الاستعلام:",
      contactFax: "الفاكس:"
    },
    en: {
      badge: "The Prestigious Beacon of Upper Egypt",
      title: "History & Academic Overview",
      desc: "For over 50 years, the Aswan Higher Institute for Social Work has graduated pioneers and practitioners in social action, community coordination, and national development across Egypt.",
      tabWho: "History & Foundation",
      tabVision: "Vision & Academic Mission",
      tabDean: "Administration Message",
      tabDegree: "Degree & Universitary Equivalence",
      whoText1: `Founded in ${INST_INFO.established}, ${INST_INFO.nameEn} is one of the oldest specialized higher education hubs in southern Egypt under the direct licensing of the Ministry of Higher Education.`,
      whoText2: "The institute's curriculum emphasizes applying human behavioral sciences, developmental psychology, and welfare legislation. Our continuous field training protocols inside the hospitals, schools, and civic associations of Aswan ensure high-quality professional exposure for graduates.",
      whoAlert: "Foundational and licensing records are strictly verified in compliance with the Egyptian Ministry of Higher Education and the Supreme Council of Universities database.",
      visionTitle: "Institute Vision:",
      visionText: "Leadership and excellence in teaching the social work profession locally and regionally, in line with the changes of digital transformation, according to the national academic standards for quality and accreditation.",
      missionTitle: "Institute Mission:",
      missionText: "The institute seeks to prepare a socially, scientifically, practically, research-wise, and skill-wise qualified social worker capable of meeting the needs of the labor market to serve society and the environment in light of professional ethics.",
      deanText1: `"Dear students and community partners, I welcome you to Aswan Higher Institute for Social Work. Social Work is not merely an academic discipline; it is a sacred humanitarian pledge to elevate human dignity and champion communal solidarity."`,
      deanText2: "We are passionately committed to optimizing student services, promoting continuous quality assurance standards, and fostering student activities and talent creation to build a competitive workforce.",
      deanSign: "— Aswan Higher Institute Dean & Administration",
      degreeText: "Graduates are officially awarded the Bachelor of Social Work (BSW) degree. This degree is fully accredited and exactly equivalent to equivalent degrees awarded by Helwan University and other Egyptian public universities.",
      degreeCard1Title: "Academic Duration",
      degreeCard1Desc: "4 Years (Divided into Semesters)",
      degreeCard2Title: "Accreditation",
      degreeCard2Desc: "Fully Equivalent to Public Universities",
      landscapeBadge: "Scenic Campus Environment",
      landscapeTitle: "Aswan • Academic and Cultural Crossroads",
      landscapeDesc: "The majestic Nile, healthcare programs, and social field training positions.",
      contactTitle: "Admission & Registration Address:",
      contactPhone: "Tel Assistance:",
      contactFax: "Fax:"
    }
  };

  const activeContent = isAr ? content.ar : content.en;

  return (
    <section className="py-16 bg-slate-50 px-4 md:px-8 border-b border-gray-100" id="about">
      <div className="max-w-7xl mx-auto">
        
        {/* العناوين والزخرفة */}
        <div className="text-center mb-12">
          <span className="text-xs bg-primary/10 text-primary border border-primary/20 font-extrabold px-3.5 py-1 rounded-full uppercase">
            {activeContent.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 relative inline-block">
            {activeContent.title}
            <span className="block w-20 h-1.5 bg-accent mx-auto mt-2 rounded"></span>
          </h2>
          <p className="text-slate-500 font-bold text-xs sm:text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
            {activeContent.desc}
          </p>
        </div>

        {/* جسم العرض: مقسم لجزأين للتواصل البصري والشرح الممتاز */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* الجانب الأيمن: التبويبات الأكاديمية التفاعلية مع شرح السطور البرمجية */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
            
            {/* التبويبات */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
              <button
                onClick={() => setActiveSubTab("who")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeSubTab === "who"
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {activeContent.tabWho}
              </button>
              <button
                onClick={() => setActiveSubTab("vision")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeSubTab === "vision"
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {activeContent.tabVision}
              </button>
              <button
                onClick={() => setActiveSubTab("dean")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeSubTab === "dean"
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {activeContent.tabDean}
              </button>
              <button
                onClick={() => setActiveSubTab("degree")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeSubTab === "degree"
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {activeContent.tabDegree}
              </button>
            </div>

            {/* محتوى كل تبويب بالتفصيل الموثق من مسك الكنكت ومدارس مصر */}
            <div className="min-h-[220px] text-slate-700 leading-relaxed font-semibold text-sm">
              {activeSubTab === "who" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p>
                    {activeContent.whoText1}
                  </p>
                  <p>
                    {activeContent.whoText2}
                  </p>
                  <div className="bg-accent/10 border-r-4 border-accent p-3.5 rounded text-xs text-accent-hover flex items-start gap-2 animate-pulse">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-accent" />
                    <span>{activeContent.whoAlert}</span>
                  </div>
                </div>
              )}

              {activeSubTab === "vision" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-accent/10 text-accent rounded-lg shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{activeContent.visionTitle}</h4>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">{activeContent.visionText}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{activeContent.missionTitle}</h4>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">{activeContent.missionText}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === "dean" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="italic text-slate-600 border-r-4 border-primary pr-3 leading-relaxed">
                    {activeContent.deanText1}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {activeContent.deanText2}
                  </p>
                  <div className="text-left font-black text-primary text-xs">
                    {activeContent.deanSign}
                  </div>
                </div>
              )}

              {activeSubTab === "degree" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <p className="leading-relaxed">
                    {activeContent.degreeText}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="block text-xs font-bold text-slate-900">{activeContent.degreeCard1Title}</span>
                        <span className="text-[11px] text-slate-500">{activeContent.degreeCard1Desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-lg">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <div>
                        <span className="block text-xs font-bold text-slate-900">{activeContent.degreeCard2Title}</span>
                        <span className="text-[11px] text-slate-500">{activeContent.degreeCard2Desc}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* الجانب الأيسر: الصورة المساعدة مع عناصر التصميم الأكاديمية (Bento-like Card) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* الكارت المصور للمعهد والمنظر العام بأسوان */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg group border border-slate-100 bg-slate-900 h-64 flex flex-col items-center justify-center text-center">
              <img
                src="/assets/images/aswan_landscape_1783237391699.jpg"
                alt="Aswan Landscape"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-500 transition-transform"
                onError={(e) => {
                  // Hide the image element if it fails to load, showing the stylized fallback
                  e.currentTarget.style.opacity = '0';
                }}
              />
              {/* Fallback styling shown if image is missing or loading */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 pointer-events-none opacity-40">
                <span className="text-3xl text-slate-500 mb-1">🖼️</span>
                <p className="text-xs text-slate-400 font-bold">
                  {lang === "ar" ? "مظهر المعهد بأسوان" : "Aswan Landscape View"}
                </p>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-5" />
              <div className="absolute bottom-4 right-4 text-white text-right z-10">
                <span className="bg-accent text-white text-[10px] font-black px-2.5 py-0.5 rounded-full block w-fit mb-1">{activeContent.landscapeBadge}</span>
                <p className="font-black text-sm">{activeContent.landscapeTitle}</p>
                <p className="text-[11px] text-slate-300">{activeContent.landscapeDesc}</p>
              </div>
            </div>

            {/* صندوق معلومات الاتصال السريع */}
            <div className="bg-gradient-to-br from-primary to-navy-dark text-white rounded-2xl p-6 shadow-md space-y-3">
              <h4 className="font-extrabold text-white text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>{activeContent.contactTitle}</span>
              </h4>
              <p className="text-xs text-blue-100 font-bold leading-relaxed">
                {isAr ? INST_INFO.address : "Kasr El-Hagar Street, El-Ishara Square, Aswan, Egypt"}
              </p>
              <div className="pt-2 border-t border-blue-800 text-slate-300 text-xs flex justify-between">
                <span>{activeContent.contactPhone} <strong className="text-white text-xs" dir="ltr">{INST_INFO.phoneDisplay}</strong></span>
                <span>{activeContent.contactFax} <span dir="rtl">{INST_INFO.fax}</span></span>
              </div>
            </div>

          </div>

        </div>

        {/* Vision & Mission Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all group duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-accent" />
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-accent/10 text-accent rounded-xl shrink-0 group-hover:scale-110 duration-300 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div className="text-right">
                <h3 className="font-black text-slate-900 text-xl mb-3">
                  {isAr ? "رؤية المعهد" : "Institute Vision"}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-bold">
                  {isAr 
                    ? "الريادة والتميز في تعليم مهنة الخدمة الاجتماعية محلياً وإقليمياً بما يتماشى مع متغيرات التحول الرقمي طبقاً للمعايير الأكاديمية القومية للجودة والإعتماد."
                    : "Leadership and excellence in teaching the social work profession locally and regionally, in line with the changes of digital transformation, according to the national academic standards for quality and accreditation."}
                </p>
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all group duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:scale-110 duration-300 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-right">
                <h3 className="font-black text-slate-900 text-xl mb-3">
                  {isAr ? "رسالة المعهد" : "Institute Mission"}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-bold">
                  {isAr
                    ? "يسعى المعهد لإعداد أخصائي اجتماعي معد علمياً وعملياً وبحثياً ومهارياً قادر علي تلبية احتياجات سوق العمل لخدمة المجتمع والبيئة في ضوء أخلاقيات المهنة."
                    : "The institute seeks to prepare a socially, scientifically, practically, research-wise, and skill-wise qualified social worker capable of meeting the needs of the labor market to serve society and the environment in light of professional ethics."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dean Biography Section */}
        <div id="dean-biography" className="mt-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-800/20 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Dean Image */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative group w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200 flex items-center justify-center">
                <img 
                  src="/dean_pic.png" 
                  alt={isAr ? "أ.د/ عبد الله على عبد الله عوده" : "Prof. Dr. Abdullah Ali Abdullah Oudah"} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 duration-300 transition-transform"
                />
              </div>
            </div>

            {/* Dean Bio Text */}
            <div className={`lg:col-span-8 space-y-4 ${isAr ? "text-right" : "text-left"}`}>
              <span className="text-xs bg-primary/10 text-primary font-black px-3 py-1 rounded-full inline-block">
                {isAr ? "عمادة المعهد العالي للخدمة الاجتماعية بأسوان" : "Dean of the Institute"}
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {isAr ? "السيرة الذاتية لعميد المعهد" : "Dean's Biography"}
              </h3>
              <div className="h-1 w-16 bg-accent rounded" />

              <div className="text-slate-700 space-y-2 text-sm leading-relaxed">
                <div className="space-y-3 font-semibold">
                  <div>
                    <span className="block text-xs text-slate-400 font-extrabold">{isAr ? "الاسم:" : "Name:"}</span>
                    <p className="text-lg font-black text-slate-900">
                      {isAr ? "أ.د/ عبد الله على عبد الله عوده" : "Prof. Dr. Abdullah Ali Abdullah Oudah"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-extrabold">{isAr ? "الدرجة العلمية:" : "Academic Title:"}</span>
                    <p className="text-sm font-bold text-slate-800">
                      {isAr ? "أستاذ ورئيس قسم العمل مع المجتمعات بالمعهد" : "Professor & Head of Working with Communities Department"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-extrabold">{isAr ? "المنصب:" : "Position:"}</span>
                    <p className="text-sm font-bold text-slate-800">
                      {isAr ? "عميد المعهد العالي للخدمة الاجتماعية بأسوان" : "Dean of the Aswan Higher Institute for Social Work"}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href="/dean_cv.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-slate-950 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isAr ? "عرض السيرة الذاتية (PDF)" : "View Biography (PDF)"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
