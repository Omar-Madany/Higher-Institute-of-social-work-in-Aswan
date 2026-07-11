import React, { useState } from "react";
import { UNITS, Department } from "../data";
import { 
  ShieldAlert, 
  Search, 
  BookOpen, 
  Heart, 
  BarChart3, 
  Users, 
  Monitor, 
  Eye, 
  Lightbulb, 
  Award, 
  Languages, 
  Shield, 
  CheckCircle2, 
  ChevronDown, 
  User, 
  CheckCircle,
  FileText,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// خريطة لتحديد الأيقونات لكل وحدة برمجياً لرفع المستوى البصري
const UNIT_ICONS: Record<string, React.ComponentType<any>> = {
  unit1: ShieldAlert,      // وحدة الأزمات والكوارث
  unit2: Search,           // وحدة البحث العلمي
  unit3: BookOpen,         // وحدة التدريب
  unit4: Heart,            // وحدة الدعم النفسي والإرشاد الأسري
  unit5: BarChart3,        // وحدة القياس والتقويم
  unit6: Users,            // وحدة المشاركة المجتمعية
  unit7: Monitor,          // وحدة (IT) تكنولوجيا المعلومات
  unit8: Eye,              // وحدة رصد المشكلات المجتمعية
  unit9: Lightbulb,        // وحدة ريادة الأعمال
  unit10: Award,           // وحدة متابعة الخريجين
  unit11: Languages,       // وحدة محو الأمية وتعليم الكبار
  unit12: Shield,          // وحدة مناهضة العنف ضد المرأة
  unit13: CheckCircle2     // وحدة ضمان جودة التعليم والاعتماد
};

export default function UnitsGrid() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  
  // تتبع وحدة النشطة الحالية
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>("unit1");

  React.useEffect(() => {
    const handleSelectUnit = (e: Event) => {
      const customEvent = e as CustomEvent<{ unitId: string }>;
      if (customEvent.detail && customEvent.detail.unitId) {
        setSelectedUnitId(customEvent.detail.unitId);
        
        setTimeout(() => {
          const element = document.getElementById("units-section");
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    };

    window.addEventListener("select-unit", handleSelectUnit);
    return () => {
      window.removeEventListener("select-unit", handleSelectUnit);
    };
  }, []);

  const getLocalizedUnit = (unit: Department) => {
    if (lang === "ar") return unit;

    // ترجمة حصرية متميزة للغة الإنجليزية لضمان تطابق عالي الدقة
    const enLookup: Record<string, { name: string; head: string; description: string; objectives: string[] }> = {
      unit1: {
        name: "Crisis & Disaster Management Unit",
        head: "Dr. Hany Mamdouh Abdel-Latif",
        description: "Establishes preemptive crisis mitigation procedures, occupational health regulations, and ensures overall campus building and community safety guidelines.",
        objectives: [
          "Ensure safe hazard-free campus grounds for students, academics, and employees.",
          "Perform regular training on swift emergency evacuations, fire drills, and first aid.",
          "Audit and maintain fire alert systems and emergency tools across all facilities."
        ]
      },
      unit2: {
        name: "Scientific Research Support Unit",
        head: "Prof. Abdel-Majeed Rashwan",
        description: "Fosters academic and field research productivity, supporting high-quality scientific publishing regarding social development in Upper Egypt.",
        objectives: [
          "Inspire faculty and researchers to create impactful applied studies for development.",
          "Organize annual conferences, specialized seminars, and research panels.",
          "Deliver statistical analyses, expert consultations, and peer review publication channels."
        ]
      },
      unit3: {
        name: "Professional Training Unit",
        head: "Dr. Abdel-Ati El-Najjar",
        description: "Develops vocational and professional skill-sets for students, alumni, and local social workers through certified practical workshops.",
        objectives: [
          "Design robust training syllabi aligning with modern market requirements.",
          "Level up student proficiency in computer tools, foreign languages, and communication.",
          "Uplift and train personnel working in partner welfare organizations across Aswan."
        ]
      },
      unit4: {
        name: "Psychological Support & Family Counseling",
        head: "Prof. Salah El-Din Metwally",
        description: "Offers direct clinical, psychological, and social counseling to students and local families to sustain mental wellness and domestic stability.",
        objectives: [
          "Provide confidential individual sessions for students addressing mental and study challenges.",
          "Run recurring workshops on self-care, mindfulness, and mitigating exam stress.",
          "Deliver free family consultations to limit domestic disputes and bolster family cohesion."
        ]
      },
      unit5: {
        name: "Measurement & Evaluation Unit",
        head: "Dr. Iman El-Sherif",
        description: "Focuses on updating exam methodologies, grading standards, and implementing objective metrics to audit student learning outcomes accurately.",
        objectives: [
          "Introduce smart digital assessment patterns and certified questions banks.",
          "Perform deep statistical grade analysis to feed constructive curriculum reviews.",
          "Train faculty members on modern objective evaluation tools and test frameworks."
        ]
      },
      unit6: {
        name: "Community Participation Desk",
        head: "Prof. Marwa El-Shimi",
        description: "Acts as an active bridge between the institute and Aswan local communities, launching welfare caravans and public NGO partnerships.",
        objectives: [
          "Deploy social and medical caravans supporting the 'Decent Life' presidential initiative villages.",
          "Draft partnerships with civic societies to broaden student training and job pathways.",
          "Mobilize student contributions in environmental preservation and public volunteering."
        ]
      },
      unit7: {
        name: "IT & Information Technology Unit",
        head: "Eng. Ahmed Mostafa Rashwan",
        description: "Administers campus digital assets, maintains high-performance network grids, and handles web portals, online systems, and tech support.",
        objectives: [
          "Manage and upgrade the official portal, electronic exam setups, and results gateways.",
          "Deploy periodic hardware maintenance and optimize campus computer labs.",
          "Train students and staff on digital transformation workflows and artificial intelligence tools."
        ]
      },
      unit8: {
        name: "Community Problems Monitoring Unit",
        head: "Dr. Yasmin Hassanin",
        description: "Conducts field surveys and statistical tracking to spot emergent social behaviors and issues in Aswan, suggesting viable academic remedies.",
        objectives: [
          "Compile complete and updated databases of localized social and cultural issues.",
          "Publish research on women rights, unemployment, school dropouts, and youth migration.",
          "Submit empirical insights to governorate decision-makers and Ministry of Solidarity."
        ]
      },
      unit9: {
        name: "Entrepreneurship & Innovation Unit",
        head: "Mr. Ahmed Abdel-Wahab",
        description: "Promotes start-up cultures, freelance workflows, and provides coaching for students establishing micro-businesses or social enterprises.",
        objectives: [
          "Instruct students on financial plans, business canvas layouts, and pitching strategies.",
          "Connect innovative student teams with state funding bodies like MSMEDA.",
          "Establish a campus-based incubator to accelerate student-led economic initiatives."
        ]
      },
      unit10: {
        name: "Alumni Follow-up & Career Center",
        head: "Ms. Laila Hassan Farrag",
        description: "Builds a lifetime connection with institute graduates, aiding them in landing job roles and supplying ongoing education programs.",
        objectives: [
          "Maintain a detailed alumni database tracking careers and professional paths.",
          "Coordinate the annual Employment Fair with major regional companies and NGOs.",
          "Deliver free professional updates introducing modern casework theories to graduates."
        ]
      },
      unit11: {
        name: "Literacy & Continuing Education Unit",
        head: "Dr. Hany El-Sadany",
        description: "Contributes to the national strategy declaring Egypt illiteracy-free, by training and routing students to host classes in Aswan villages.",
        objectives: [
          "Supervise student execution of the graduation-requisite community literacy project.",
          "Supply pedagogical kits teaching students adult psychology and teaching tricks.",
          "Liaise with Aswan Public Literacy Board to register classes and endorse results."
        ]
      },
      unit12: {
        name: "Anti-Violence Against Women Unit",
        head: "Dr. Iman El-Sherif",
        description: "Defends equal opportunity principles, secures safe educational environments, and hosts empowerment campaigns for female students in Aswan.",
        objectives: [
          "Host seminars on gender equality, women rights, and tackling harmful traditions.",
          "Provide secure, highly confidential channels to report campus-related female issues.",
          "Empower girls through targeted vocational tracks and decision-making programs."
        ]
      },
      unit13: {
        name: "Education Quality Assurance & Accreditation",
        head: "Prof. Salah El-Din Metwally",
        description: "Drives academic excellence and institutional development to fulfill national standard quality criteria for official program accreditation.",
        objectives: [
          "Adopt quality regulations from the National Authority for Quality Assurance (NAQAAE).",
          "Oversee yearly self-evaluation files and update academic course specifications.",
          "Build institutional capacities by holding professional training for teaching staff."
        ]
      }
    };

    const enUnit = enLookup[unit.id];
    if (enUnit) {
      return {
        ...unit,
        name: enUnit.name,
        head: enUnit.head,
        description: enUnit.description,
        objectives: enUnit.objectives
      };
    }
    return unit;
  };

  const currentUnit = UNITS.find(u => u.id === selectedUnitId) || UNITS[0];
  const localizedUnit = getLocalizedUnit(currentUnit);

  return (
    <section className="py-16 bg-white px-4 md:px-8 border-b border-gray-100" id="units-section">
      <div className="max-w-7xl mx-auto">
        
        {/* العناوين والريادة الأكاديمية والتنظيمية */}
        <div className="text-center mb-10">
          <span className="text-xs bg-accent/10 text-accent border border-accent/20 font-extrabold px-3.5 py-1 rounded-full uppercase">
            {isAr ? "الوحدات والمراكز التخصصية" : "Specialized Units & Centers"}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 relative inline-block">
            {isAr ? "الوحدات الاستشارية والتنموية" : "Consultancy & Development Units"}
            <span className="block w-20 h-1.5 bg-accent mx-auto mt-2 rounded"></span>
          </h2>
          <p className="text-slate-500 font-bold text-xs sm:text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
            {isAr 
              ? "يضم المعهد ١٣ وحدة ومركزاً تخصصياً لتقديم الدعم المجتمعي والبحثي والتقني، مكملة للهيكل التعليمي ومؤسسة لريادة الخدمات بالصعيد."
              : "The institute hosts 13 specialized units and centers that provide exceptional community, research, and IT consulting services."
            }
          </p>
        </div>

        {/* عرض تفاعلي: الوحدات في اليمين كأزرار، والتفاصيل على اليسار لتجربة مستخدم مدهشة */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* الجانب الأيمن: قائمة الوحدات */}
          <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto pr-1 border-r border-slate-100 scrollbar-thin">
            <h3 className="text-slate-800 font-extrabold text-[11px] sm:text-xs md:text-sm mb-4 px-2 uppercase tracking-wider text-slate-500 sticky top-0 bg-white py-1">
              {isAr 
                ? "اختر الوحدة لمعاينة تفاصيلها وأهدافها:"
                : "Select unit to explore detailed objectives:"
              }
            </h3>
            
            {UNITS.map((unit) => {
              const isSelected = unit.id === selectedUnitId;
              const IconComp = UNIT_ICONS[unit.id] || BookOpen;
              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`w-full text-right p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/10 scale-[1.01]"
                      : "bg-slate-50 text-slate-800 border-gray-100 hover:border-gray-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-accent text-white" : "bg-slate-200 text-slate-700"}`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="block font-black text-xs sm:text-sm leading-snug">{unit.name}</span>
                      <span className={`text-[9px] block ${isSelected ? "text-slate-300" : "text-slate-500 font-sans"}`}>
                        {unit.englishName}
                      </span>
                    </div>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSelected ? "rotate-180 text-accent" : "text-slate-500"}`} />
                </button>
              );
            })}
          </div>

          {/* الجانب الأيسر: لوحة عرض تفاصيل الوحدة المختارة بدقة عالية */}
          <div className="lg:col-span-7">
            {localizedUnit ? (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 md:p-8 border border-gray-200/50 shadow-md space-y-6">
                
                {/* رأس الوحدة المختار */}
                <div className="border-b border-gray-200 pb-4 space-y-2">
                   <div className="flex items-center gap-2 text-accent font-black text-xs">
                    <Award className="w-4 h-4 text-accent" />
                    <span>
                      {isAr ? "وحدة تخصصية هيكلية معتمدة بالمعهد" : "Accredited Specialized Institutional Unit"}
                    </span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-950">{localizedUnit.name}</h4>
                  <p className="font-sans font-medium text-xs sm:text-sm text-slate-500">{localizedUnit.englishName}</p>
                </div>

                {/* مسئول الوحدة */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold">
                      {isAr ? "رئيس مجلس إدارة الوحدة / المدير المسئول" : "Head / Director of the Unit"}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-primary">{localizedUnit.head}</span>
                  </div>
                </div>

                {/* الوصف والنشاط التنموي */}
                <div className="space-y-2">
                   <h5 className="font-extrabold text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider">
                    {isAr ? "التعريف بالوحدة والدور الاستشاري والتنموي:" : "Definition & Strategic Support Scope:"}
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
                    {localizedUnit.description}
                  </p>
                </div>

                {/* خطة الإخلاء وإدارة الأزمات كملف PDF - حصري لوحدة الأزمات والكوارث */}
                {currentUnit.id === "unit1" && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 md:p-5 text-right space-y-3 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h6 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                          {isAr 
                            ? "خطة الإخلاء وإدارة الأزمات والكوارث المعتمدة (2025 / 2026م) 📄" 
                            : "Approved Crisis & Evacuation Plan (2025 / 2026) 📄"}
                        </h6>
                        <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-bold">
                          {isAr
                            ? "الخطة الشاملة المعتمدة من مجلس إدارة الجودة لإجراءات الأمن والسلامة والصحة المهنية بالمعهد."
                            : "The comprehensive quality board approved plan for institutional safety and occupational health."}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="/disaster.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] sm:text-xs px-4 py-2.5 rounded-xl transition-all shadow hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? "عرض أو تحميل خطة الإخلاء بالكامل (PDF) 🔗" : "View/Download Evacuation Plan (PDF) 🔗"}</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* أهداف الوحدة */}
                <div className="space-y-3 pt-2">
                   <h5 className="font-extrabold text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider">
                    {isAr ? "أهداف الوحدة التنفيذية ومهام العمل:" : "Core Strategic Objectives & Operations:"}
                  </h5>
                  <ul className="grid grid-cols-1 gap-2.5">
                    {localizedUnit.objectives.map((obj, i) => (
                      <li key={i} className="flex gap-2.5 items-start bg-white p-3 rounded-lg border border-gray-100 transition-all hover:border-gray-200">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-slate-400 text-sm">
                الرجاء اختيار وحدة من القائمة لاستعراض التفاصيل بالكامل.
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
