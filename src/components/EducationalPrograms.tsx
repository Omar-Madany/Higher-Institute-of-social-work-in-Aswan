import React, { useState } from "react";
import { GraduationCap, CheckCircle, ArrowRight, ArrowLeft, ShieldCheck, Layers } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export interface ProgramDetails {
  id: string;
  title: string;
  englishTitle: string;
  icon: React.ElementType;
  badge: { ar: string; en: string };
  duration: { ar: string; en: string };
  language: { ar: string; en: string };
  shortDesc: { ar: string; en: string };
  longDesc: { ar: string; en: string };
  objectives: { ar: string[]; en: string[] };
  careers: { ar: string[]; en: string[] };
  levels: {
    ar: { name: string; courses: string[] }[];
    en: { name: string; courses: string[] }[];
  };
}

export default function EducationalPrograms() {
  const { lang, setTab } = useLanguage();
  const isAr = lang === "ar";
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetails | null>(null);

  const programs: ProgramDetails[] = [
    {
      id: "social-work-bsw",
      title: "برنامج بكالوريوس الخدمة الاجتماعية",
      englishTitle: "Bachelor of Social Work Program (BSW)",
      icon: GraduationCap,
      badge: { ar: "البرنامج الأكاديمي المعتمد", en: "Accredited Academic Program" },
      duration: { ar: "4 سنوات أكاديمية", en: "4 Academic Years" },
      language: { ar: "اللغة العربية", en: "Arabic" },
      shortDesc: {
        ar: "البرنامج الأكاديمي المعتمد من المجلس الأعلى للجامعات لإعداد أخصائيين اجتماعيين مؤهلين مهنياً وسلوكياً.",
        en: "The accredited academic program designed to qualify social workers equipped with scientific methods and professional practice tools."
      },
      longDesc: {
        ar: "يعد برنامج بكالوريوس الخدمة الاجتماعية بالمعهد العالي للخدمة الاجتماعية بأسوان من البرامج العريقة الرائدة بالصعيد منذ عام 1975 م. يهدف البرنامج إلى تزويد الطلاب بالخلفيات النظرية والعملية والمنهجية في مجالات رعاية الأسرة والطفولة، الخدمة الاجتماعية المدرسية، الخدمات الطبية الإرشادية، ورعاية الشباب والمسنين. يستفيد طلاب البرنامج من 4 سنوات من التدريس المنظم والتدريبات الميدانية المكثفة بمؤسسات محافظة أسوان والمستشفيات والمدارس لإكساب الطالب ريادة علمية وعملية قوية.",
        en: "The BSW Program is a renowned academic track in Upper Egypt since 1975. It prepares graduates to address diverse social needs across different organizations. The curriculum provides a strong integration of developmental sociology, psychology, legislative law, and advanced on-field training across public and private welfare centers in Aswan."
      },
      objectives: {
        ar: [
          "تزويد الطلاب بالمعارف الأساسية في العلوم النفسية والاجتماعية والقوانين المنظمة للرعاية.",
          "تنمية قدرة الطالب على تشخيص وتحليل المشكلات الاجتماعية الفردية والجماعية والمجتمعية.",
          "تطبيق أحدث النظريات الأكاديمية وربطها بالواقع العملي والنهوض بمؤسسات المجتمع المدني بالصعيد.",
          "ترسيخ قيم الميثاق الأخلاقي لمهنة الخدمة الاجتماعية والالتزام بالسرية والنزاهة المهنية."
        ],
        en: [
          "Provide foundational theories in psychological, sociological, and legislative care frameworks.",
          "Instill critical skills for diagnosing and planning professional interventions for people, groups, and entities.",
          "Bridge classroom curriculum with real-life community development programs in Aswan.",
          "Foster ethical standards of social work practice, maintaining integrity and ultimate professional confidentiality."
        ]
      },
      careers: {
        ar: [
          "أخصائي اجتماعي بالمؤسسات التعليمية (مدارس ومعاهد وجامعات)",
          "أخصائي إرشاد وعلاج اجتماعي ونفسي بالمستشفيات والمراكز العلاجية",
          "منسق ميداني بمؤسسات التضامن الاجتماعي والجمعيات الأهلية والدولية",
          "مخطط اجتماعي وباحث بالوزارات والهيئات والمنظمات التنموية",
          "مستشار علاقات أسرية وموجه تربوي في مراكز الاستشارات الأسرية"
        ],
        en: [
          "School or University Academic Social Counselor",
          "Clinical / Psychiatric Social Worker inside state hospitals and rehabilitation clinics",
          "Field Operations Coordinator inside NGOs, Charity foundations, and developmental ministries",
          "Social Policy Planner and statistical researcher in municipal boards",
          "Family counselor & relationship mediator in private advisory centers"
        ]
      },
      levels: {
        ar: [
          { name: "الفرقة الأولى (التأسيس)", courses: ["مقدمة الخدمة الاجتماعية", "علم النفس التنموي للطفل", "علم الاجتماع العام", "اللغة الأجنبية والمصطلحات"] },
          { name: "الفرقة الثانية (القواعد)", courses: ["طرق الخدمة الاجتماعية (فرد)", "مدخل التدخل المهني بالخدمة", "قوانين ونظم اجتماعية", "التدريب الميداني المبتدئ"] },
          { name: "الفرقة الثالثة (التطبيق والأقسام)", courses: ["طرق الخدمة الاجتماعية (جماعة)", "الإحصاء الاجتماعي والبحوث", "علم النفس الاجتماعي للأسرة", "التدريب الميداني التخصصي"] },
          { name: "الفرقة الرابعة (التخرج والتمهيد)", courses: ["طرق الخدمة الاجتماعية (تنظيم وتخطيط)", "الخدمة الاجتماعية في المجال الطبي", "مناهج البحث العلمي بالخدمات", "التدريب الميداني المستمر"] }
        ],
        en: [
          { name: "Level 1 (Foundations)", courses: ["Introduction to Social Work", "Child Developmental Psychology", "General Sociology Principles", "English Terminology"] },
          { name: "Level 2 (Core Practices)", courses: ["Casework Methods", "Introduction to Intervention", "Social Systems & Legislations", "Introductory Fieldwork"] },
          { name: "Level 3 (Specializations)", courses: ["Groupwork Methods", "Social Statistics & Research", "Family Social Psychology", "Specialized On-field Placement"] },
          { name: "Level 4 (Pragmatic Mastery)", courses: ["Community Organization & Planning", "Medical Social Work", "Scientific Research Methodologies", "Continuous Field Internship"] }
        ]
      }
    }
  ];

  return (
    <section className="py-16 bg-slate-50 px-4 md:px-8 border-b border-gray-100/90" id="educational-programs">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* العناوين والترويسة والزخرفة */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-black">
            <Layers className="w-3.5 h-3.5 text-accent animate-spin" />
            <span>{isAr ? "الدليل والبرنامج المعتمد" : "Accredited Syllabus"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isAr ? "برنامج بكالوريوس الخدمة الاجتماعية المعتمد 🎓" : "Accredited Bachelor of Social Work Program 🎓"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
            {isAr
              ? "نقدم البرنامج الأكاديمي المعتمد من وزارة التعليم العالي والبحث العلمي لإرساء مبادئ الخدمة الاجتماعية والبحث العلمي وبناء المهارات الميدانية المؤهلة للتوظيف الفوري."
              : "Discover the professional curriculum certified by the Ministry of Higher Education, bridging scientific theories with pragmatic Aswan field internships."}
          </p>
        </div>

        {/* عرض البرنامج التعليمي الأكاديمي */}
        <div className="flex justify-center">
          {programs.map((program) => {
            const IconComponent = program.icon;
            return (
              <div
                key={program.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 hover:border-accent hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden w-full max-w-2xl shadow-sm"
              >
                {/* خلفية جمالية خفيفة */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>

                <div className="space-y-5 relative z-10 text-right">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-primary text-white group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] bg-accent text-white px-3 py-1 rounded-full font-black animate-pulse">
                      {isAr ? program.badge.ar : program.badge.en}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 group-hover:text-primary transition-colors leading-normal">
                      {isAr ? program.title : program.englishTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                      {isAr ? program.shortDesc.ar : program.shortDesc.en}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100 text-[11px] sm:text-xs font-bold text-slate-400 justify-end">
                    <div className="text-right">
                      <span className="text-slate-600 block">{isAr ? "مدة الدراسة:" : "Duration:"}</span>
                      <span className="text-slate-800 font-black">{isAr ? program.duration.ar : program.duration.en}</span>
                    </div>
                    <div className="border-r border-slate-200"></div>
                    <div className="text-right">
                      <span className="text-slate-600 block">{isAr ? "لغة التدريس:" : "Language:"}</span>
                      <span className="text-slate-800 font-black">{isAr ? program.language.ar : program.language.en}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <button
                    onClick={() => {
                      setSelectedProgram(program);
                    }}
                    className="w-full bg-slate-50 hover:bg-primary text-center hover:text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white cursor-pointer hover:shadow-md"
                  >
                    <span>{isAr ? "تصفح تفاصيل ومواد البرنامج والتحق الآن 🔍" : "View Curriculum & Register Now 🔍"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* المودال التفاعلي الأنيق لعرض تفاصيل البرنامج والخدمة الاجتماعية */}
        {selectedProgram && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-gray-150 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ترويسة المودال */}
              <div className="bg-gradient-to-r from-primary via-blue-950 to-primary p-6 sm:p-8 text-white flex items-center justify-between shrink-0 border-b-4 border-accent">
                <div className="flex items-center gap-4 text-right">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                    {React.createElement(selectedProgram.icon, { className: "w-6 h-6 text-accent" })}
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-xs text-yellow-300 font-black tracking-wider block uppercase">
                      {isAr ? "منهجية معتمدة ورسمية بوزارة التعليم العالي" : "Certified Syllabus & Accredited Methodology"}
                    </span>
                    <h4 className="text-lg sm:text-xl font-black">{isAr ? selectedProgram.title : selectedProgram.englishTitle}</h4>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all border border-white/10 cursor-pointer"
                >
                  {isAr ? "إغلاق ✕" : "Close ✕"}
                </button>
              </div>

              {/* جسم التمرير للمودال */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-right flex-grow">
                {/* نبذة تفصيلية */}
                <div className="space-y-2">
                  <h5 className="font-extrabold text-base text-slate-900 border-r-4 border-primary pr-3">
                    {isAr ? "حول البرنامج:" : "About the Program:"}
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
                    {isAr ? selectedProgram.longDesc.ar : selectedProgram.longDesc.en}
                  </p>
                </div>

                {/* التفاصيل الأساسية (المدة واللغة والاعتماد) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-200">
                  <div className="text-center sm:text-right">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? "طبيعة الدراسة والشهادة" : "Degree Qualification"}</span>
                    <span className="text-xs font-black text-slate-800">{isAr ? "درجة البكالوريوس الرسمية" : "Official BSW Degree"}</span>
                  </div>
                  <div className="text-center sm:text-right border-r border-slate-200 pr-4">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? "مدة البرنامج الأكاديمية" : "Program Academic Duration"}</span>
                    <span className="text-xs font-black text-slate-800">{isAr ? selectedProgram.duration.ar : selectedProgram.duration.en}</span>
                  </div>
                  <div className="text-center sm:text-right border-r border-slate-200 pr-4 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-bold text-slate-400 block">{isAr ? "لغات ومناهج التدريس" : "Instruction Language"}</span>
                    <span className="text-xs font-black text-slate-800">{isAr ? selectedProgram.language.ar : selectedProgram.language.en}</span>
                  </div>
                </div>

                {/* الأهداف والمهارات المكتسبة */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-base text-slate-900 border-r-4 border-accent pr-3">
                    {isAr ? "الأهداف والمخرجات الدراسية المكتسبة:" : "Key Learning Objectives & Competencies:"}
                  </h5>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-bold">
                    {(isAr ? selectedProgram.objectives.ar : selectedProgram.objectives.en).map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* المواد والمسيرة الدراسية لكل مستوى بالتفصيل */}
                <div className="space-y-4">
                  <h5 className="font-extrabold text-base text-slate-900 border-r-4 border-primary pr-3">
                    {isAr ? "المسارات ومقررات الخطط الدراسية الفنية والميدانية:" : "Study Plans, Credit Modules & Levels:"}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(isAr ? selectedProgram.levels.ar : selectedProgram.levels.en).map((level, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-gray-150 space-y-2 shadow-sm">
                        <span className="text-xs font-black text-primary block border-b border-primary/10 pb-1.5">{level.name}</span>
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {level.courses.map((course, idx) => (
                            <span key={idx} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* مجالات العمل المهنية والتوظيف الفوري بعد التخرج */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-base text-slate-900 border-r-4 border-emerald-600 pr-3">
                    {isAr ? "مجالات العمل التوظيفية المتوقعة للخريجين بأسوان ومصر:" : "Potential Placement & Career Paths:"}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-bold bg-emerald-50/20 border border-emerald-100 p-4 rounded-2xl">
                    {(isAr ? selectedProgram.careers.ar : selectedProgram.careers.en).map((career, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{career}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* أزرار الإجراء السريعة بالأسفل للاشتراك والفرز */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end shrink-0">
                <button
                  onClick={() => {
                    setSelectedProgram(null);
                    setTab("portal");
                    // التمرير المباشر لنموذج التسجيل لسهولة الاستجابة الكلية
                    setTimeout(() => {
                      const signupElement = document.getElementById("student-portal");
                      if (signupElement) signupElement.scrollIntoView({ behavior: "smooth" });
                    }, 350);
                  }}
                  className="bg-accent hover:bg-slate-900 text-white font-black text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-accent/30 transition-all cursor-pointer"
                >
                  <span>{isAr ? "سجل وقدم الآن للبرنامج إلكترونياً ✉️" : "Register and Apply Online ✉️"}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4 shrink-0" /> : <ArrowRight className="w-4 h-4 shrink-0" />}
                </button>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="px-6 border border-gray-300 text-slate-700 hover:bg-slate-200 font-extrabold text-xs rounded-xl py-3 transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء وتصفح المعهد" : "Cancel & Keep Browsing"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
