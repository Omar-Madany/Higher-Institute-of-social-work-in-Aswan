import React, { useState } from "react";
import { DEPARTMENTS, ADMIN_DEPARTMENTS, Department } from "../data";
import { BookOpen, User, CheckCircle, ChevronDown, Award, Building, Briefcase } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function DepartmentsGrid() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  
  // تتبع الفئة النشطة: أكاديمي/علمي أم إداري
  const [activeCategory, setActiveCategory] = useState<"academic" | "administrative">("academic");
  
  // تتبع أي الأقسام مفتوح لمعاينة بياناته بكفاءة
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>("dep1");

  React.useEffect(() => {
    const handleSelectDept = (e: Event) => {
      const customEvent = e as CustomEvent<{ category: "academic" | "administrative"; deptId: string }>;
      if (customEvent.detail) {
        setActiveCategory(customEvent.detail.category);
        setSelectedDeptId(customEvent.detail.deptId);
        
        setTimeout(() => {
          const element = document.getElementById("departments");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    };

    window.addEventListener("select-department", handleSelectDept);
    return () => {
      window.removeEventListener("select-department", handleSelectDept);
    };
  }, []);

  const getLocalizedDept = (dept: any) => {
    if (lang === "ar") return dept;

    const enLookup: Record<string, { name: string, head: string, description: string, objectives: string[] }> = {
      dep1: {
        name: "Social Case Work Department",
        head: "Prof. Salah Metwally",
        description: "Focuses on training students in utilizing casework methodologies to assist individuals and families in overcoming psycho-social problems and enhancing personal wellbeing.",
        objectives: [
          "Equipping students with casework interviewing, diagnosis, and intervention planning.",
          "Advancing psycho-social support approaches tailored for clinical and individual care.",
          "Promoting field training competence within social institutions and psychiatric health facilities."
        ]
      },
      dep2: {
        name: "Social Group Work Department",
        head: "Prof. Marwa El-Shimi",
        description: "Specializes in assessing group behaviors, communication networks, and training community leaders through structured group work, behavioral development, and interactive social learning.",
        objectives: [
          "Instilling leadership and interactive social skills within smaller groups.",
          "Channeling student activities and group programs to upgrade values and behavior standards.",
          "Curating youth care courses, citizenship principles, and community involvement."
        ]
      },
      dep3: {
        name: "Community Organization Department",
        head: "Prof. Ahmed Fouad",
        description: "Focuses on studying methods for organizing local neighborhoods, civic alliances, and constructing community advocacy campaigns to empower public service programs.",
        objectives: [
          "Enabling local communities to identify shared needs and mobilize indigenous resources.",
          "Supervising social developmental projects and educating grass-roots municipal leaders.",
          "Partnering with non-governmental associations for comprehensive sustainable development."
        ]
      },
      dep4: {
        name: "Social Planning Department",
        head: "Prof. Abdel-Majeed Rashwan",
        description: "Centers on social policy-making, strategy drafting, and evaluating social impacts of macro-economic welfare programs and national projects.",
        objectives: [
          "Teaching structural planning tools, needs assessment surveys, and project evaluation.",
          "Analyzing national social and educational policies implemented by service ministries.",
          "Promoting quantitative modeling, research methods, and statistics in master plans."
        ]
      },
      dep5: {
        name: "Fields of Social Work Department",
        head: "Dr. Yasmin Hassanin",
        description: "Emphasizes professional practice across vital social sectors, including primary education, clinical healthcare, juvenile behavior, and elderly welfare.",
        objectives: [
          "Investigating real-world field problems regarding families, child safety, and youth.",
          "Preparing active counsellors to operate within medical, educational, and industrial projects.",
          "Conducting field research and surveys to bridge the gap between academia and public centers."
        ]
      },
      dep6: {
        name: "Foundation & Supporting Sciences Department",
        head: "Dr. Hany El-Sadany",
        description: "Integrates supportive core sciences—including legislative law, developmental psychology, sociology, biostatistics, and welfare economics to broaden student knowledge.",
        objectives: [
          "Providing legal, psychological, and behavioral background aiding in clinical and community services.",
          "Fostering logical deduction methods, research design, and qualitative statistical analysis.",
          "Expanding educational tracks to include technology, digital records, and secure computer interfaces."
        ]
      },
      dep7: {
        name: "Field Training Department",
        head: "Dr. Abdel-Ati El-Najjar",
        description: "The primary link between academic theory and practical field experience. Coordinates extended practical internships/practicums in Aswan villages, hospitals, and welfare centers.",
        objectives: [
          "Monitoring student performance and ethics inside partner social organizations.",
          "Facilitating weekly clinical case discussions, field site supervisor visits, and logs reviews.",
          "Evaluating actual student competencies to guarantee elite ready-to-serve graduates."
        ]
      },
      admin1: {
        name: "General Secretary Office",
        head: "Mr. Ahmed Abdel-Wahab (General Secretary)",
        description: "Oversees all administrative, financial, and logistics desks of the institute, serving as the link between departments and the Dean's Council.",
        objectives: [
          "Structuring and auditing day-to-day work flows inside administrative and finance rooms.",
          "Ensuring staff performance and legal compliance to civil service regulations.",
          "Streamlining internal office notes and implementing administrative policies."
        ]
      },
      admin2: {
        name: "Personnel & HR Affairs Department",
        head: "Ms. Mona Abdel-Barr (HR Director)",
        description: "Manages personnel affairs, faculty records, staff salaries, promotions, and payroll compliance schemes.",
        objectives: [
          "Supervising employment records, vacation requests, and onboarding documentation.",
          "Calculating payrolls, bonuses, and social insurance contributions.",
          "Fostering professional development, work reviews, and administrative training courses."
        ]
      },
      admin3: {
        name: "Student Affairs & Registration Office",
        head: "Mr. Mahmoud El-Gendey (Director)",
        description: "The central core for student services, managing registration certificates, transcripts, courses allocation registers, and grades verification.",
        objectives: [
          "Processing student registrations, transfers, and file documentation.",
          "Issuing certified academic transcripts, graduation scrolls, and enrollment statements.",
          "Coordinating with the Control Board to publish student grade sheets securely."
        ]
      },
      admin4: {
        name: "Youth Care & Student Welfare",
        head: "Coach Sherif Abdel-Latif (Coordinator)",
        description: "Manages extracurricular activities including sports tournaments, theatre groups, student unions, and community service camps.",
        objectives: [
          "Organizing student tournaments, art fairs, public speaking, and theater plays.",
          "Supervising Student Union elections and budgeting student clubs.",
          "Directing summer youth camps, scout outings, and volunteer community projects."
        ]
      },
      admin5: {
        name: "Financial & Accounts Control Department",
        head: "Mr. Essam Shawky (Finance Manager)",
        description: "Handles budgeting, collection of study fees/textbooks, supplier invoicing, and student smart card payment gateways.",
        objectives: [
          "Managing tuition collections and processing online bank payments via Fawry.",
          "Formulating fiscal budgets, financial reports, and auditing records.",
          "Supervising purchase orders, inventory checks, and accounts payable."
        ]
      },
      admin6: {
        name: "Information Technology & Media Center",
        head: "Eng. Ahmed Maher (IT Webmaster)",
        description: "Maintains web presence, databases, computer labs, student portal servers, and digital news channels.",
        objectives: [
          "Ensuring server uptime, student database integrity, and cybersecurity protocols.",
          "Providing maintenance for computer labs, networks, and smart cards scanners.",
          "Broadcasting online news announcements, timetable updates, and academic bulletins."
        ]
      },
      admin7: {
        name: "Public Relations & International Cooperation Desk",
        head: "Ms. Doaa Soliman (PR Coordinator)",
        description: "Handles external relations, delegations, media press releases, and coordinate collaborative field programs.",
        objectives: [
          "Curating official media announcements and local news press releases.",
          "Welcoming international visitors, academic guests, and university panels.",
          "Organizing academic conferences, community development forums, and webinars."
        ]
      }
    };

    const enDept = enLookup[dept.id];
    if (enDept) {
      return {
        ...dept,
        name: enDept.name,
        head: enDept.head,
        description: enDept.description,
        objectives: enDept.objectives
      };
    }
    return dept;
  };

  const currentList = activeCategory === "academic" ? DEPARTMENTS : ADMIN_DEPARTMENTS;
  const mappedList = currentList.map(getLocalizedDept);

  return (
    <section className="py-16 bg-white px-4 md:px-8 border-b border-gray-100" id="departments">
      <div className="max-w-7xl mx-auto">
        
        {/* العناوين والريادة الأكاديمية والتنظيمية */}
        <div className="text-center mb-10">
          <span className="text-xs bg-accent/10 text-accent border border-accent/20 font-extrabold px-3.5 py-1 rounded-full uppercase">
            {isAr ? "الهيكل التنظيمي والأكاديمي" : "Academic & Support Staff Structure"}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 relative inline-block">
            {isAr ? "الأقسام العلمية والإدارية بالمعهد" : "Scientific & Support Departments"}
            <span className="block w-20 h-1.5 bg-accent mx-auto mt-2 rounded"></span>
          </h2>
          <p className="text-slate-500 font-bold text-xs sm:text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? "تتوزع ريادة المعهد بأسوان بين سبعة أقسام علمية وتدريبية لتأهيل الطلاب، وسبعة أقسام ووحدات إدارية لتسيير وتنظيم الخدمات الطلابية والوظيفية."
              : "Aswan Institute integrates 7 modern scientific academic departments and 7 executive admin desks to assist and empower student services."
            }
          </p>
        </div>

        {/* المبدل الفرعي: للتنقل بين الأقسام العلمية والأقسام الإدارية بسلاسة تامة */}
        <div className="flex justify-center max-w-md mx-auto mb-12 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              setActiveCategory("academic");
              setSelectedDeptId("dep1");
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeCategory === "academic"
                ? "bg-primary text-white shadow shadow-primary/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isAr ? "الأقسام العلمية (٧)" : "Academic Depts (7)"}</span>
          </button>
          <button
            onClick={() => {
              setActiveCategory("administrative");
              setSelectedDeptId("admin1");
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeCategory === "administrative"
                ? "bg-primary text-white shadow shadow-primary/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{isAr ? "الأقسام الإدارية (٧)" : "Admin Desks (7)"}</span>
          </button>
        </div>

        {/* عرض تفاعلي: الأقسام في اليمين كأزرار، والتفاصيل على اليسار لتجربة مستخدم مدهشة */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* الجانب الأيمن: قائمة الأقسام مع لوحات تنبيهية مميزة */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-slate-800 font-extrabold text-[11px] sm:text-xs md:text-sm mb-4 px-2 uppercase tracking-wider text-slate-500">
              {isAr 
                ? (activeCategory === "academic" ? "اختر القسم العلمي لمعاينة أهدافه الأكاديمية:" : "اختر الإدارة لمعاينة أهدافها التنظيمية:")
                : (activeCategory === "academic" ? "Select Academic Department to explore details:" : "Select Admin Desk to explore duties:")
              }
            </h3>
            
            {mappedList.map((dept) => {
              const isSelected = dept.id === selectedDeptId;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`w-full text-right p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/10 scale-[1.01]"
                      : "bg-slate-50 text-slate-800 border-gray-100 hover:border-gray-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-accent text-white" : "bg-slate-200 text-slate-700"}`}>
                      {activeCategory === "academic" ? <BookOpen className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="block font-black text-sm">{dept.name}</span>
                      <span className={`text-[10px] block ${isSelected ? "text-slate-300" : "text-slate-500 font-sans"}`}>
                        {dept.englishName}
                      </span>
                    </div>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSelected ? "rotate-180 text-accent" : "text-slate-500"}`} />
                </button>
              );
            })}
          </div>

          {/* الجانب الأيسر: لوحة عرض تفاصيل القسم المختار بدقة عالية */}
          <div className="lg:col-span-7">
            {selectedDeptId ? (
              (() => {
                const dept = mappedList.find((d) => d.id === selectedDeptId);
                if (!dept) return null;
                return (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 md:p-8 border border-gray-200/50 shadow-md animate-in fade-in slide-in-from-left-6 duration-300 space-y-6">
                    
                    {/* رأس القسم المختار */}
                    <div className="border-b border-gray-200 pb-4 space-y-2">
                       <div className="flex items-center gap-2 text-accent font-black text-xs">
                        <Award className="w-4 h-4 text-accent" />
                        <span>
                          {isAr 
                            ? (activeCategory === "academic" ? "القسم العلمي المعتمد بوزارة التعليم العالي" : "القسم والوحدة الإدارية المعتمدة الهيكلية")
                            : (activeCategory === "academic" ? "Fully Accredited Academic Division" : "Official Executive Administration Desk")
                          }
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-950">{dept.name}</h4>
                      <p className="font-sans font-medium text-xs sm:text-sm text-slate-500">{dept.englishName}</p>
                    </div>

                    {/* أستاذ ورئيس القسم / المسئول */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold">
                          {isAr
                            ? (activeCategory === "academic" ? "رئيس مجلس القسم الأكاديمي" : "المسئول والمدير المالي أو الإداري")
                            : (activeCategory === "academic" ? "Chairman of the Department" : "Division Director / Manager Office")
                          }
                        </span>
                        <span className="text-xs sm:text-sm font-black text-primary">{dept.head}</span>
                      </div>
                    </div>

                    {/* الوصف والمسؤولية البحثية بالصعيد */}
                    <div className="space-y-2">
                       <h5 className="font-extrabold text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider">
                        {isAr
                          ? (activeCategory === "academic" ? "وصف القسم والدور المعرفي والبحثي:" : "طبيعة عمل القسم والدور الإداري اللوجستي:")
                          : (activeCategory === "academic" ? "Strategic Academic Focus & Research Scope:" : "Administrative Focus & Operations duties:")
                        }
                      </h5>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
                        {dept.description}
                      </p>
                    </div>

                    {/* الأهداف التعليمية للقسم */}
                    <div className="space-y-3 pt-2">
                       <h5 className="font-extrabold text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider">
                        {isAr
                          ? (activeCategory === "academic" ? "الأهداف التعليمية والمهارات المكتسبة للطلاب:" : "الأهداف التنظيمية والمستندات المسئول عنها القسم:")
                          : (activeCategory === "academic" ? "Learning Outcomes & Student Competencies acquired:" : "Operational Goals & Core Documentations:")
                        }
                      </h5>
                      <ul className="grid grid-cols-1 gap-2.5">
                        {dept.objectives.map((obj, i) => (
                          <li key={i} className="flex gap-2.5 items-start bg-white p-3 rounded-lg border border-gray-100 animate-in fade-in duration-200">
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-relaxed">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-slate-400 text-sm">
                الرجاء اختيار قسم من القائمة لاستعراض التفاصيل بالكامل.
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
