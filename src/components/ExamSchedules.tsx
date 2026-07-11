import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firebase-error";
import { Calendar, Clock, MapPin, Search, Printer, FileText, ChevronLeft, ShieldAlert } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface ScheduleItem {
  id: string;
  academicYear: string; // الفرقة الأولى، الثانية، الثالثة، الرابعة
  subject: string;
  date: string;
  time: string;
  hall: string;
}

const DEFAULT_SCHEDULES: ScheduleItem[] = [
  {
    id: "s1",
    academicYear: "الفرقة الرابعة",
    subject: "التخطيط الاجتماعي والتنمية المستدامة",
    date: "2026-06-25",
    time: "09:00 - 11:00",
    hall: "مدرج أ - الطابق الأول"
  },
  {
    id: "s2",
    academicYear: "الفرقة الرابعة",
    subject: "تنظيم المجتمعات المحلية بأسوان",
    date: "2026-06-28",
    time: "09:00 - 11:00",
    hall: "مدرج ب - الطابق الثاني"
  },
  {
    id: "s3",
    academicYear: "الفرقة الثالثة",
    subject: "طرق الخدمة الاجتماعية (جماعة)",
    date: "2026-06-25",
    time: "11:30 - 13:30",
    hall: "مدرج ج - الطابق الأول"
  },
  {
    id: "s4",
    academicYear: "الفرقة الثالثة",
    subject: "علم النفس الاجتماعي للأسرة",
    date: "2026-06-28",
    time: "11:30 - 13:30",
    hall: "مدرج أ - الطابق الأول"
  },
  {
    id: "s5",
    academicYear: "الفرقة الثانية",
    subject: "مبادئ علم الاجتماع التنموي",
    date: "2026-06-26",
    time: "09:00 - 11:00",
    hall: "القاعة ٤ - الطابق الثالث"
  },
  {
    id: "s6",
    academicYear: "الفرقة الأولى",
    subject: "مقدمة الخدمة الاجتماعية",
    date: "2026-06-26",
    time: "11:30 - 13:30",
    hall: "القاعة ٥ - الطابق الثالث"
  }
];

export default function ExamSchedules() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const yearsList = isAr
    ? [
        { id: "all", label: "كل الفرق الدراسية" },
        { id: "الفرقة الأولى", label: "الفرقة الأولى" },
        { id: "الفرقة الثانية", label: "الفرقة الثانية" },
        { id: "الفرقة الثالثة", label: "الفرقة الثالثة" },
        { id: "الفرقة الرابعة", label: "الفرقة الرابعة" }
      ]
    : [
        { id: "all", label: "All Levels" },
        { id: "الفرقة الأولى", label: "1st Year (Freshman)" },
        { id: "الفرقة الثانية", label: "2nd Year (Sophomore)" },
        { id: "الفرقة الثالثة", label: "3rd Year (Junior)" },
        { id: "الفرقة الرابعة", label: "4th Year (Senior/BSW)" }
      ];

  useEffect(() => {
    async function fetchSchedules() {
      try {
        setLoading(true);
        const q = query(collection(db, "exam_schedules"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // If Firestore is empty, use default mock data
          setSchedules(DEFAULT_SCHEDULES);
        } else {
          const dbItems: ScheduleItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            dbItems.push({
              id: doc.id,
              academicYear: data.academicYear,
              subject: data.subject,
              date: data.date,
              time: data.time,
              hall: data.hall || (isAr ? "مقر اللجان بالمعهد" : "Institute Examination Hall")
            });
          });
          // Mix or use database items
          setSchedules(dbItems);
        }
      } catch (err) {
        console.error("Error fetching schedules: ", err);
        setSchedules(DEFAULT_SCHEDULES); // Fallback on error
        handleFirestoreError(err, OperationType.LIST, "exam_schedules");
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [isAr]);

  const filteredSchedules = schedules.filter((item) => {
    const matchesYear = selectedYear === "all" || item.academicYear === selectedYear;
    
    // Translate search values conceptually
    const matchesSearch = item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.academicYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.hall.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="py-12 bg-slate-50 min-h-screen px-4 md:px-8 border-b border-gray-100" id="exam-schedules-section">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* رأس القسم والتسميات الأنيقة */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-gray-200">
          <div className="space-y-3 text-right">
            <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent-hover px-3 py-1 rounded-full text-[11px] font-black">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>{isAr ? "امتحانات معهد أسوان" : "Aswan Exam Schedules"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-normal">
              {isAr ? "مواعيد وجداول امتحانات الطلاب 📝" : "Official Examination Schedules 📝"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold max-w-2xl leading-relaxed">
              {isAr 
                ? "تابع جداول الاختبارات الفصلية وأرقام المقار ومواقع اللجان الأكاديمية الصادرة من شئون الطلاب لجميع الفرق." 
                : "Browse timetables, exam room coordinates, and academic guidelines published by Student Affairs for all batches."}
            </p>
          </div>

          {/* أزرار طباعة وتأكيد الجداول */}
          <div className="flex gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={handlePrint}
              className="bg-primary hover:bg-slate-900 text-white font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? "طباعة الجداول الرسمية" : "Print Official Schedules"}</span>
            </button>
          </div>
        </div>

        {/* أدوات البحث والتصنيف */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          
          {/* فلتر الفرقة */}
          <div className="md:col-span-2 flex flex-wrap gap-2">
            {yearsList.map((y) => (
              <button
                key={y.id}
                onClick={() => setSelectedYear(y.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  selectedYear === y.id
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100"
                }`}
              >
                {y.label}
              </button>
            ))}
          </div>

          {/* خانة البحث */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder={isAr ? "ابحث عن مادة أو قاعة الامتحان..." : "Search subject or hall..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-right p-2.5 pr-10 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent bg-white shadow-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* التنبيه والضوابط الرسمية */}
        <div className="bg-yellow-50/50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-right text-xs text-amber-900 font-bold space-y-1">
            <p className="font-extrabold">{isAr ? "تعليمات وضوابط اللجان الهامة:" : "Crucial Examination Instructions:"}</p>
            <p className="leading-relaxed opacity-90 font-medium">
              {isAr 
                ? "١. يجب على الطالب التواجد قبل موعد اللجنة بـ ٣٠ دقيقة مصطحباً بطاقة الرقم القومي وكارنيه المعهد البنكي الذكي. ٢. يمنع منعاً باتاً دخول قاعات الامتحان بالهواتف المحمولة أو المذكرات والكتب الخارجية." 
                : "1. Students must arrive 30 minutes before exams carrying their National ID and Smart Student Card. 2. Mobile phones, notes, or external materials are strictly forbidden inside examination rooms."}
            </p>
          </div>
        </div>

        {/* عرض الجداول الدراسية */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-500 font-bold text-xs mt-3">{isAr ? "جاري تحميل الجداول الرسمية..." : "Loading schedules..."}</p>
          </div>
        ) : filteredSchedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-gray-150/70 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* الفرقة وتسميتها */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {isAr 
                        ? item.academicYear 
                        : (item.academicYear === "الفرقة الأولى" ? "1st Year (Freshman)" : 
                           item.academicYear === "الفرقة الثانية" ? "2nd Year (Sophomore)" : 
                           item.academicYear === "الفرقة الثالثة" ? "3rd Year (Junior)" : "4th Year (Senior)")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{item.id.substring(0, 5)}
                    </span>
                  </div>

                  {/* مادة الامتحان */}
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-primary transition-colors leading-snug">
                    {item.subject}
                  </h3>

                  {/* تفاصيل الموعد والموقع */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.hall}</span>
                    </div>
                  </div>
                </div>

                {/* تذكير الطالب */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isAr ? "معادلة المجلس الأعلى" : "Supreme Council Accredited"}</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:translate-x-[-4px] transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 space-y-4">
            <span className="text-4xl">🗓️</span>
            <h5 className="font-bold text-slate-700 text-sm">{isAr ? "لا توجد جداول امتحانات معلنة" : "No timetables announced"}</h5>
            <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto">
              {isAr 
                ? "عذراً، لم تظهر أي جداول توافق خيارات الفرز المحددة حالياً." 
                : "Sorry, no exam items match the current filtering parameters."}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
