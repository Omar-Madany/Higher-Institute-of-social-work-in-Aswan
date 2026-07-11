import React, { useState } from "react";
import { HelpCircle, Search, ChevronDown, CheckCircle, GraduationCap, DollarSign, BrainCircuit, Activity, HeartHandshake, Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface FAQItem {
  id: number;
  category: "admission" | "fees" | "training" | "portal";
  question: string;
  answer: string;
}

export default function FAQSection() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  // We'll set searchQuery to "" in useEffect once or in state by default
  const [expandedId, setExpandedId] = useState<number | null>(null);

  React.useEffect(() => {
    setSearchQuery("");
  }, []);

  const tFaq = {
    ar: {
      searchPlaceholder: "ابحث بتفاصيل سؤالك هنا (مثال: الشروط، الأوراق، المصروفات، التدريب)...",
      clearSearch: "مسح البحث",
      guidanceBadge: "الدعم والإرشاد الأكاديمي والطلابي",
      title: "الأسئلة الشائعة وإجاباتها الفورية ❓",
      desc: "كل ما تبحث عنه من معلومات رسمية وقرارات وزارة التعليم العالي والبحث العلمي كطالب أو ولي أمر لتسيير مسيرتكم الأكاديمية بنجاح داخل المعهد العالي للخدمة الاجتماعية بأسوان.",
      answerTitle: "الإجابة الرسمية المعتمدة:",
      noResultsTitle: "عذراً، لم نجد أي أسئلة تطابق استفسارك",
      noResultsDesc: "جرب تغيير الكلمات المفتاحية المستخدمة في شريط البحث أو اختر تصنيف أسئلة آخر للوصول للمعلومة.",
      notFoundTitle: "ألم تجد إجابة لسؤالك المحدد؟",
      notFoundDesc: "يسعدنا تقديم كامل النصح والإرشاد لكم فورا؛ يمكنك إرسال التماسك أو سؤالك مباشرة عبر بوابتنا الرقمية بمقرح المعهد بأسوان بقسم الاتصال.",
      contactBtn: "راسل إدارة شؤون الطلاب الآن",
      cats: [
        { id: "all", label: "جميع الأسئلة", icon: HelpCircle },
        { id: "admission", label: "القبول والتنسيق والأوراق", icon: GraduationCap },
        { id: "fees", label: "المصروفات والتكافل الاجتماعي", icon: DollarSign },
        { id: "training", label: "التدريب الميداني والأنشطة", icon: Activity },
        { id: "portal", label: "بوابة الطالب والنتائج الرقمية", icon: BrainCircuit },
      ],
      faqs: [
        {
          id: 1,
          category: "admission" as const,
          question: "ما هي شروط القبول الأكاديمي للدراسة بالمعهد العالي للخدمة الاجتماعية بأسوان؟",
          answer: "يقبل المعهد التقديم المباشر أو غير المباشر للطلاب الحاصلين على شهادة الثانوية العامة بفرعيها (العلمي والأدبي) أو شهادة الثانوية الأزهرية، وما يعادلها من الشهادات الفنية والعربية، والتحويلات من المعاهد والمؤسسات المناظرة وغير المناظرة، وذلك في إطار الحدود الدنيا للتنسيق التي تقررها وزارة التعليم العالي والبحث العلمي سنوياً، مع وجوب اجتياز المقابلة الشخصية اللياقية بمقر المعهد بأسوان."
        },
        {
          id: 2,
          category: "admission" as const,
          question: "هل درجة البكالوريوس الممنوحة من المعهد معتمدة ومعادلة للجامعات المصرية؟",
          answer: "نعم، وبشكل مطلق! يمنح المعهد درجة بكالوريوس الخدمة الاجتماعية وهي درجة معتمدة بقرار من وزير التعليم العالي والبحث العلمي بجمهورية مصر العربية، وهي معادلة للدرجة العلمية التي تمنحها كليات الخدمة الاجتماعية في كافة الجامعات الحكومية المصرية بقرار من المجلس الأعلى للجامعات، وتؤهل الخريجين للتعيين فورا بكافة المكاتب الأهلية والحكومية والتسجيل بنقابة المهن الاجتماعية بمصر."
        },
        {
          id: 3,
          category: "admission" as const,
          question: "ما هي الأوراق الرسمية المطلوبة للتقديم للطلاب الجدد بنظام التنسيق؟",
          answer: "تشمل المستندات المطلوبة بصفة عامة: أصل شهادة الثانوية العامة أو ما يعادلها + أصل شهادة الميلاد المميكنة (كمبيوتر) + شهادة المقابلة الشخصية الصادرة من المعهد عقب سداد الرسوم + عدد 6 صور شخصية حديثة مقاس 4×6 خلفية بيضاء + نموذج 2 جند للطلاب الذكور المصريين (أو 6 جند لمن تجاوز 19 عاماً) + صورة بطاقة الرقم القومي الخاصة بالطالب وولي أمره."
        },
        {
          id: 4,
          category: "fees" as const,
          question: "ما هي قيمة الرسوم الدراسية والمصروفات السنوية المعتمدة لعام 2026؟",
          answer: "تُحدد وزارة التعليم العالي المصروفات والرسوم السنوية ويتم نشرها رسمياً على موقع التنسيق وداخل لوحات الإعلانات الرسمية بالمعهد لتكون عادلة ورمزية ومناسبة تماماً للعائلات بالصعيد، كما يتم تحصيلها بالكامل رقمياً باستخدام وسائل الدفع الإلكتروني المعتمدة رسمياً بالدولة (مثل فوري، ومصاري، وكارت الطالب الذكي البنكي وبوابات الدفع الوطنية)."
        },
        {
          id: 5,
          category: "fees" as const,
          question: "هل توجد رعاية أو إعفاء مخصص لتخفيف المصروفات عن ذوي الهمم أو الحالات الاجتماعية؟",
          answer: "بالطبع، يضم المعهد صندوق التكافل الاجتماعي الطلابي بمبنى رعاية الشباب، والذي يقدم إعفاءات وتسهيلات مخصصة للطلاب المتميزين رياضياً وفنياً، وأسر الشهداء، والأيتام، والحالات الاجتماعية الصعبة، وذوي الهمم ومرضى الرعاية المستمرة، وذلك بعد تقديم مستندات البحث الاجتماعي المعتمد والموافقة الإدارية لتذليل العقبات وتوفير الكتب والمواد مجاناً."
        },
        {
          id: 6,
          category: "training" as const,
          question: "متى يبدأ التدريب الميداني العملي وأين يتم تنفيذه بمباني محافظة أسوان؟",
          answer: "يشكل التدريب الميداني الركيزة الأساسية لخدمة المجتمع، ويبدأ بجدول معتمد في الفرقتين الثالثة والرابعة (أيام محددة أسبوعياً). يتم توزيع الطلاب تحت إشراف نخبة من أساتذة المعهد على مؤسسات معتمدة وممتازة بأسوان مثل: المدارس الحكومية، المستشفيات وأقسام الرعاية النفسية، مؤسسات وملاجئ الأيتام، مكاتب التوجيه والاستشارات الأسرية، مع تغطية التدريب بتقييمات عملية مستمرة ترجح معدل الطالب التراكمي."
        },
        {
          id: 7,
          category: "training" as const,
          question: "ما نوع الأنشطة والرحلات ومشاركات رعاية الشباب المتوفرة للطلاب؟",
          answer: "يوفر معهد أسوان بيئة اجتماعية وترويحية مفعمة ومثالية؛ حيث يتاح للطلاب الانخراط في: المعسكرات الصيفية والشتوية، دوري كرة القدم والرياضات الفردية للجامعات، الأنشطة المسرحية والثقافية المتميزة، مبادرات مكافحة الإدمان والتوعية البيئية والعمل الخيري، بالإضافة إلى الرحلات الاستكشافية لربط التعلم بالتراث والتاريخ الخلاب لمدينة أسوان."
        },
        {
          id: 8,
          category: "portal" as const,
          question: "كيف يمكنني تسجيل الدخول لبوابة الطالب الذكية والاستعلام عن النتائج والأخبار؟",
          answer: "يتم تسليم كل طالب جديد كود الطالب فريد مع تفعيل كارت الطالب البنكي الذكي. يمكن تسجيل الدخول على بوابتنا الرقمية المدمجة بموقع الويب بإدخال الرقم القومي للطالب وكود الطالب للتصفح، متابعة الحضور والغياب، تحميل المقررات الأساسية، والاطلاع الفوري على نتائج فصول النقل والبكالوريوس الرسمية بمجرد اعتمادها ورفعها بالكنترول المركزي."
        },
        {
          id: 9,
          category: "portal" as const,
          question: "ما العمل إذا واجهت مشكلة تقنية بالدخول أو خطأ في البيانات الشخصية؟",
          answer: "في حالة مواجهة عطل أو عدم ظهور النتيجة أو رغبة في تعديل الاسم والبيانات، يرجى ملء 'مذكرة المقترح والشكوى والمراجعة والتماس النتيجة' عبر بوابة الاتصال الإلكتروني المتاحة بموقع الويب وسيتم توجيه طلبكم تلقائياً إلى الإدارة التعليمية، أو يمكنكم زيارة مكتب إدارة النظم وتكنولوجيا المعلومات بالطابق الثالث بقرية المعهد بأسوان مباشرة لتحديث البيانات فورياً."
        }
      ]
    },
    en: {
      searchPlaceholder: "Search FAQ here (e.g., terms, documents, fees, field training)...",
      clearSearch: "Clear",
      guidanceBadge: "Academic Support & Advisory Center",
      title: "Frequently Asked Questions (FAQ) ❓",
      desc: "Official guidelines, schedules and board resolutions by Aswan Higher Institute for Social Work, designed to assist both parents and students.",
      answerTitle: "Official Accredited Response:",
      noResultsTitle: "No FAQ results match your keywords",
      noResultsDesc: "Try refining your search text or selecting a different category tab above.",
      notFoundTitle: "Didn't find your specific question?",
      notFoundDesc: "We're here to help anytime! You can send your inquiry or formal petition directly using our instant contact form below.",
      contactBtn: "Contact Student Registry Now",
      cats: [
        { id: "all", label: "All Questions", icon: HelpCircle },
        { id: "admission", label: "Admissions & Entry Criteria", icon: GraduationCap },
        { id: "fees", label: "Tuition & Financial Aid", icon: DollarSign },
        { id: "training", label: "Practicums & Youth Activities", icon: Activity },
        { id: "portal", label: "Student Portal & Grades", icon: BrainCircuit },
      ],
      faqs: [
        {
          id: 1,
          category: "admission" as const,
          question: "What are the entry and admission requirements for Aswan Higher Institute?",
          answer: "We welcome direct or centralized registry filings from high school grads (Scientific/Literary tracks, Azharite certificates, or equivalent international records) matching the minimum scores annually set by the Ministry of Higher Education, alongside passing the personal aptitude interview at Aswan campus."
        },
        {
          id: 2,
          category: "admission" as const,
          question: "Is the Bachelor's degree officially accredited and equivalent to government universities?",
          answer: "Absolutely! The Bachelor of Social Work (BSW) awarded by our institute is accredited by ministerial decree. It is fully equivalent to BSW degrees from governate universities by Council of Universities declaration, allowing registration in the Social Work Professional Guild."
        },
        {
          id: 3,
          category: "admission" as const,
          question: "What official papers are required for enrolling incoming freshmen?",
          answer: "Required papers generally include: Original High School Certificate or equivalent + Computerized Birth Certificate + Institute Aptitude Certificate (obtained post interview fees) + 6 recent personal photos (4x6, white background) + military exemption certificate (Form 2/6 Egyptian male grads only) + copies of National IDs for student & legal guardian."
        },
        {
          id: 4,
          category: "fees" as const,
          question: "What is the certified tuition structure for the 2026 academic year?",
          answer: "Tuition structures are determined by the Ministry of Higher Education and publishable on Tanseek/admissions boards inside our campus. Collections are handled securely through digital payment networks (e.g., Fawry, Masary, or the Student Smart Card gateway)."
        },
        {
          id: 5,
          category: "fees" as const,
          question: "Are there support schemes or exemptions for students with disabilities?",
          answer: "Yes, the Student Welfare Office runs a solidarity fund providing tuition aid or exemptions for athletic/art leaders, outstanding students, orphans, and families experiencing hardships, granting free textbook access."
        },
        {
          id: 6,
          category: "training" as const,
          question: "When does the practical field training start and where is it held?",
          answer: "Field training is a cornerstone BSW requirement starting in the 3rd and 4th academic years. Scheduled on specific days, students practice under senior advisors at top Aswan agencies (state schools, psychiatric departments, child nurseries, and rehabilitation clinics)."
        },
        {
          id: 7,
          category: "training" as const,
          question: "What extracurricular activities, scouts, and student sports are available?",
          answer: "We support a vibrant student calendar including: Summer and winter camps, regional university sports tournaments, arts and theater productions, anti-addiction civic initiatives, and field trips to explore history across tourism sites in Aswan."
        },
        {
          id: 8,
          category: "portal" as const,
          question: "How do I log into the Student Portal and view official course grades?",
          answer: "Each student receives a unique Student ID and a Smart Student Card. Login access is granted using the Student ID + National ID, allowing you to access schedules, track attendance rates, download academic files, and view official transcripts once central control rolls them out."
        },
        {
          id: 9,
          category: "portal" as const,
          question: "What if I experience technical glitches with my account or name typo?",
          answer: "If you encounter errors or data inconsistencies, fill out the support form directly on our Contact Us page. Alternatively, stop by the Information Systems & IT Office (on the third floor of Aswan campus) for direct technical assistance."
        }
      ]
    }
  };

  const active = isAr ? tFaq.ar : tFaq.en;

  const filteredFaqs = active.faqs.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden" id="faq-section">
      {/* خلفية فنية هادئة لإضفاء جمال للموقع */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-10 relative">
        
        {/* عنوان المقدمة والشعار المصغر */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black">
            <Info className="w-4 h-4 text-accent" />
            <span>{active.guidanceBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-normal">
            {active.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            {active.desc}
          </p>
        </div>

        {/* شريط البحث المطور */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={active.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pr-12 rounded-2xl border border-gray-400/30 shadow-md text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-slate-800 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-red-500 cursor-pointer"
            >
              {active.clearSearch}
            </button>
          )}
        </div>

        {/* فئات وتصنيفات الأسئلة التفاعلية */}
        <div className="flex flex-wrap gap-2 justify-center pb-2">
          {active.cats.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-slate-900" 
                    : "bg-white border border-gray-200 text-slate-700 hover:bg-slate-100 hover:border-gray-300"
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-accent" : "text-primary"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* قائمة الأسئلة (الأكورديون) */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div 
                  key={faq.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? "border-accent shadow-md shadow-accent/5 ring-1 ring-accent" 
                      : "border-gray-200/70 hover:border-gray-300 hover:shadow-xs"
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-right p-5 flex justify-between items-center gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isExpanded ? "text-accent animate-bounce" : "text-primary"}`} />
                      <span className="font-extrabold text-xs sm:text-sm text-slate-800 leading-normal">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isExpanded ? "transform rotate-180 text-accent" : ""}`} />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isExpanded ? "max-h-[30rem] opacity-100 py-5 px-6 border-t border-slate-100" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-dashed border-gray-200 space-y-3">
                      <div className="flex items-center gap-1.5 text-accent font-black text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{active.answerTitle}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 space-y-4">
              <span className="text-4xl">🔍</span>
              <h5 className="font-bold text-slate-700 text-sm">{active.noResultsTitle}</h5>
              <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto">
                {active.noResultsDesc}
              </p>
            </div>
          )}
        </div>

        {/* صندوق التواصل المباشر في حال عدم إيجاد إجابة */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
          {/* لمسات تجميل الصندوق */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl"></div>
          <div className="space-y-2 relative text-right md:w-2/3">
            <h4 className="text-lg sm:text-xl font-black">{active.notFoundTitle}</h4>
            <p className="text-xs text-slate-200 font-bold leading-relaxed">
              {active.notFoundDesc}
            </p>
          </div>
          <div className="relative shrink-0 w-full md:w-auto">
            <a
              href="#contact"
              onClick={(e) => {
                // تفعيل تبويب الاتصال في الموقع بصورة ذكية
                const el = document.getElementById("faq-section");
                const btn = document.querySelector('[data-contact-tab]');
                if (btn) (btn as HTMLButtonElement).click();
              }}
              className="bg-accent hover:bg-white hover:text-primary text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-2 w-full text-center hover:scale-[1.02]"
            >
              <HeartHandshake className="w-4 h-4 text-yellow-300" />
              <span>{active.contactBtn}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
