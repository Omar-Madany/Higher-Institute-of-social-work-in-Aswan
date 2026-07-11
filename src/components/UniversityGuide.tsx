import React, { useState } from "react";
import { BookOpen, GraduationCap, MapPin, Award, CheckCircle2, ChevronLeft, ShieldAlert, Users, PhoneCall, Globe, Building } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function UniversityGuide() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [activeTab, setActiveTab] = useState("admissions");

  const tabs = isAr
    ? [
        { id: "admissions", label: "شروط الالتحاق والأوراق 📜", icon: GraduationCap },
        { id: "training", label: "دليل التدريب الميداني 🏫", icon: MapPin },
        { id: "activities", label: "الأنشطة ورعاية الشباب 🏆", icon: Users },
        { id: "charter", label: "الميثاق الأخلاقي للأخصائي 🎓", icon: Award }
      ]
    : [
        { id: "admissions", label: "Admission & Documents 📜", icon: GraduationCap },
        { id: "training", label: "Field Training Manual 🏫", icon: MapPin },
        { id: "activities", label: "Youth Activities & Clubs 🏆", icon: Users },
        { id: "charter", label: "Ethical & Academic Code 🎓", icon: Award }
      ];

  return (
    <section className="py-12 bg-slate-50 min-h-screen px-4 md:px-8 border-b border-gray-100" id="university-guide">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
        
        {/* رأس القسم الفاخر */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-black">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>{isAr ? "دليل الطالب والزائر المتكامل" : "Student & Visitor Handbook"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-normal tracking-tight">
            {isAr ? "دليل المعهد العالي للخدمة الاجتماعية بأسوان 📖" : "General Institute Directory & Handbook 📖"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
            {isAr 
              ? "مرحبا بك في دليلك الشامل لمعرفة شروط القبول، تفاصيل التدريب العملي الميداني، مكاتب شئون الطلاب ورعاية الشباب، وميثاق الخدمة الاجتماعية المعتمد." 
              : "Explore admission requirements, field training placement rosters, student sports/cultural welfare programs, and accredited professional codes."}
          </p>
        </div>

        {/* التبويبات العلوية الأنيقة */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-gray-200 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/15 scale-102"
                    : "bg-white text-slate-700 border border-gray-200 hover:bg-slate-50 hover:text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* عرض المحتوى حسب التبويب النشط */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-150/70 shadow-lg transition-all duration-300">
          
          {/* 1. القبول والتقديم والشروط */}
          {activeTab === "admissions" && (
            <div className="space-y-8 text-right">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-primary border-b border-primary/10 pb-2">
                  {isAr ? "شروط القبول والأوراق المطلوبة للالتحاق 📜" : "Admission Criteria & Required Documents 📜"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                  {isAr 
                    ? "يقبل المعهد الطلاب الحاصلين على شهادة الثانوية العامة (أدبي / علمي) وما يعادلها من شهادات عربية وأجنبية، بالإضافة إلى الدبلومات الفنية عن طريق مكتب التنسيق الإلكتروني." 
                    : "The institute accepts high school graduates (literary/scientific streams) and equivalent technical/vocational certificates through the official ministry web coordinator."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* شروط الالتحاق */}
                <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-extrabold text-sm text-slate-900 border-r-4 border-accent pr-2.5">
                    {isAr ? "شروط التقديم الأساسية:" : "Primary Prerequisites:"}
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold leading-relaxed">
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{isAr ? "الحصول على الحد الأدنى لدرجات القبول المعلن من مكتب التنسيق المصري." : "Meet the minimum grade threshold specified by the Egyptian Ministry of Education."}</span>
                    </li>
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{isAr ? "اجتياز المقابلة الشخصية اللياقة المهنية التي يعقدها المعهد بأسوان." : "Pass the character, medical, and professional fitness interview held inside Aswan campus."}</span>
                    </li>
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{isAr ? "ألا يكون الطالب قد فصل سابقاً من جامعة أو معهد آخر لأسباب تأديبية." : "Must not have been previously dismissed from any academy or university for disciplinary actions."}</span>
                    </li>
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{isAr ? "الالتزام بسداد الرسوم والاشتراكات المقررة من وزارة التعليم العالي." : "Commitment to settle the annual academic and activities fees set by governmental boards."}</span>
                    </li>
                  </ul>
                </div>

                {/* أوراق ملف الطالب */}
                <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-extrabold text-sm text-slate-900 border-r-4 border-primary pr-2.5">
                    {isAr ? "الأوراق والمستندات الرسمية المطلوبة للتقديم:" : "Required Supporting Credentials:"}
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-600 font-semibold leading-relaxed">
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{isAr ? "أصل شهادة الثانوية العامة أو بيان درجات النجاح المعتمد." : "Original High School/Diploma Certificate or authenticated transcript copy."}</span>
                    </li>
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{isAr ? "أصل شهادة الميلاد الكمبيوتر الحديثة + ٣ صور منها." : "Original Computerized Birth Certificate + 3 photocopies."}</span>
                    </li>
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{isAr ? "عدد ٦ صور شخصية حديثة مقاس ٤*٦ خلفية بيضاء." : "6 passport-sized photographs (4x6, clear white background)."}</span>
                    </li>
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{isAr ? "بطاقة الترشيح الرسمية الصادرة لمكتب التنسيق الإلكتروني." : "Official Nomination Slip (بطاقة الترشيح) issued by online coordinator."}</span>
                    </li>
                    <li className="flex items-start gap-2 justify-start">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{isAr ? "نموذج ٢ جند للطلاب الذكور + نموذج ٦ أو ٧ جند لتأجيل الخدمة." : "Form 2 Gond (and 6/7 Gond for deferrals) for Egyptian male candidates."}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3 justify-start">
                <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary font-bold leading-relaxed">
                  {isAr 
                    ? "ملحوظة هامة: لتقديم طلب أولي سريع للتقديم، يمكنك ملء البيانات الشخصية في 'بوابة الطالب' على الفور وحفظ رقم طلبك للرجوع إليه عند زيارة شئون الطلاب بميدان الإشارة بأسوان." 
                    : "Tip: For fast processing, submit your preliminary online application through the 'Student Portal' now and save your tracking application code before visiting Aswan headquarters."}
                </p>
              </div>
            </div>
          )}

          {/* 2. التدريب الميداني وأماكنه */}
          {activeTab === "training" && (
            <div className="space-y-8 text-right">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-emerald-800 border-b border-emerald-800/10 pb-2">
                  {isAr ? "دليل وبروتوكولات التدريب الميداني والخدمات 🏫" : "Field Training Manual & Protocols 🏫"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                  {isAr 
                    ? "التدريب الميداني هو عصب بكالوريوس الخدمة الاجتماعية؛ حيث ينخرط الطلاب عملياً طوال الفرقتين الثالثة والرابعة في مؤسسات التدريب بأسوان تحت إشراف نخبة من موجهي التدريب وهيئة التدريس." 
                    : "Practical field training is the core of the B.S.W. degree. Students are placed inside Aswan medical, educational, and welfare structures during their junior and senior years."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* التدريب المدرسي */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                  <span className="text-2xl">🏫</span>
                  <h4 className="font-extrabold text-sm text-slate-900">{isAr ? "مجال التدريب التعليمي والمدارس" : "School Counseling Sector"}</h4>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    {isAr 
                      ? "يتدرب الطلاب في مدارس التربية والتعليم بأسوان على دور الأخصائي المدرسي، توجيه السلوك، المساعدة النفسية، وتعديل عادات التحصيل والتعلم للطلبة." 
                      : "Placed inside state schools to understand school counseling, student mentoring, behavior correction, and social-emotional guidance."}
                  </p>
                </div>

                {/* التدريب الطبي والصحي */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                  <span className="text-2xl">🏥</span>
                  <h4 className="font-extrabold text-sm text-slate-900">{isAr ? "المجال الطبي والمستشفيات" : "Medical & Health Care Sector"}</h4>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    {isAr 
                      ? "التدريب بمراكز الأورام، مستشفيات الشفاء، ووحدات الصحة النفسية لمساعدة المرضى وأسرهم على التكيف النفسي مع فترات العلاج وصرف المساعدات." 
                      : "Training inside public oncology hospitals, rehab centers, and mental health clinics supporting patients' clinical adjustment."}
                  </p>
                </div>

                {/* التدريب التنموي والجمعيات الأهلية */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                  <span className="text-2xl">🤝</span>
                  <h4 className="font-extrabold text-sm text-slate-900">{isAr ? "مؤسسات التكافل والجمعيات الأهلية" : "Civil & NGOs Sector"}</h4>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    {isAr 
                      ? "العمل جنباً إلى جنب مع مؤسسات المجتمع المدني بأسوان في تنظيم القوافل، دراسة احتياجات القرى الأكثر احتياجاً، وتصميم حملات التوعية البيئية والمجتمعية." 
                      : "Working inside Aswan non-profits to design developmental caravans, survey village needs, and execute environmental awareness."}
                  </p>
                </div>

              </div>

              <div className="bg-emerald-50 text-emerald-950 p-5 rounded-2xl border border-emerald-100 space-y-2 text-xs font-bold leading-relaxed">
                <p className="font-extrabold text-sm flex items-center gap-1.5"><Building className="w-4 h-4 text-emerald-800" /> {isAr ? "إحصائيات التدريب العملي المعتمد:" : "Placement Coverage Stats:"}</p>
                <p className="opacity-90 leading-relaxed font-semibold">
                  {isAr 
                    ? "نملك بروتوكولات حصرية ومباشرة مع أكثر من ٨٥ مؤسسة شريكة بأسوان. يقضي كل طالب ٢٤٠ ساعة تدريب عملي مسجل سنوياً كشرط للتخرج ومعادلة شهادة البكالوريوس." 
                    : "We maintain direct placement protocols with over 85 local bodies in Aswan. Each undergraduate completes 240 hours of supervised field work annually to qualify for syndicate registration."}
                </p>
              </div>
            </div>
          )}

          {/* 3. رعاية الشباب والأنشطة */}
          {activeTab === "activities" && (
            <div className="space-y-8 text-right">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-amber-600 border-b border-amber-500/10 pb-2">
                  {isAr ? "رعاية الشباب ولجان الأنشطة الطلابية 🏆" : "Youth Care & Student Life Committee 🏆"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                  {isAr 
                    ? "تسعى إدارة رعاية الشباب بالمعهد إلى اكتشاف مواهب الطلاب وتنميتها من خلال باقة متنوعة من اللجان الرياضية، الفنية، الكشفية، والاجتماعية التي تضفي حيوية للعام الدراسي." 
                    : "The Youth Care Department uncovers student potential and supports sports, cultural, artistic, and social welfare groups that enrich life inside the campus."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex items-start gap-4">
                  <span className="text-2xl bg-amber-100 p-2.5 rounded-xl">⚽</span>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900">{isAr ? "اللجنة الرياضية ودوري الكليات" : "Sports & Athletics League"}</h4>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      {isAr 
                        ? "تنظيم دوري معهد أسوان لكرة القدم، كرة السلة، تنس الطاولة، والماراثون السنوي بمشاركة كافة الفرق." 
                        : "Arranges internal soccer tournaments, table tennis leagues, and cross-governorate runs for all batches."}
                    </p>
                  </div>
                </div>

                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex items-start gap-4">
                  <span className="text-2xl bg-amber-100 p-2.5 rounded-xl">🎭</span>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900">{isAr ? "النشاط الثقافي والفني والمسرح" : "Art, Drama & Music Club"}</h4>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      {isAr 
                        ? "فرقة مسرح معهد أسوان الحائزة على جوائز جامعية، ومعارض الفنون التشكيلية والموسيقى السنوية." 
                        : "Includes the institute's award-winning drama troupe, photography exhibitions, and music competitions."}
                    </p>
                  </div>
                </div>

                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex items-start gap-4">
                  <span className="text-2xl bg-amber-100 p-2.5 rounded-xl">⛺</span>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900">{isAr ? "لجنة الجوالة والخدمة العامة" : "Scouting & Volunteerism Group"}</h4>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      {isAr 
                        ? "معسكرات الخدمة العامة لتجميل أسوان، والأنشطة الكشفية والرحلات البرية لسانت كاترين وسيناء." 
                        : "Organizes campus clean-up campaigns in Aswan, outdoor scouting camps, and winter trips to Dahab & Sinai."}
                    </p>
                  </div>
                </div>

                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex items-start gap-4">
                  <span className="text-2xl bg-amber-100 p-2.5 rounded-xl">💬</span>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900">{isAr ? "اللجنة الاجتماعية ومجلس الطلاب" : "Student Union & Counseling"}</h4>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">
                      {isAr 
                        ? "تنظيم رحلات ترفيهية للأقصر ودهب، وتمثيل صوت الطلاب عبر انتخابات اتحاد الطلبة السنوية." 
                        : "Oversees the Student Union election, social trips, and student solidarity fund support for tuition aid."}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 4. الميثاق الأخلاقي للأخصائي */}
          {activeTab === "charter" && (
            <div className="space-y-8 text-right">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-primary border-b border-primary/10 pb-2">
                  {isAr ? "الميثاق الأخلاقي والدستور المهني للأخصائي الاجتماعي 🎓" : "Professional & Ethical Code for Social Workers 🎓"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">
                  {isAr 
                    ? "يتعهد خريج معهد أسوان بالعمل وفق المبادئ والأسس الأخلاقية والقيم الإنسانية السامية التي تضمن الحفاظ على كرامة العملاء وسرية بياناتهم." 
                    : "Graduates of the Aswan Institute pledge to perform welfare duties under rigid social codes securing client privacy and human dignity."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-4">
                  <h4 className="font-black text-sm text-slate-900 border-r-4 border-accent pr-2.5">{isAr ? "مبادئ الميثاق الأساسية:" : "Core Ethical Tenets:"}</h4>
                  <div className="space-y-3 text-xs text-slate-600 font-semibold leading-relaxed">
                    <p className="p-3 bg-slate-50 rounded-xl">
                      <strong>{isAr ? "١. السرية التامة (Confidentiality):" : "1. Confidentiality:"}</strong> {isAr ? " كتمان كافة أسرار العميل وبياناته الشخصية وعائلته ولا تباح إلا بتصريح قضائي رسمي." : " Keeping client cases and therapeutic files strictly confidential, unless court-ordered."}
                    </p>
                    <p className="p-3 bg-slate-50 rounded-xl">
                      <strong>{isAr ? "٢. حق تقرير المصير (Self-Determination):" : "2. Self-Determination:"}</strong> {isAr ? " إتاحة كامل الحرية للعميل لاختيار طرق التدخل والمشاركة الفعالة في خطة العلاج والتطوير." : " Allowing clients the freedom to participate in selecting treatment routes and interventions."}
                    </p>
                    <p className="p-3 bg-slate-50 rounded-xl">
                      <strong>{isAr ? "٣. القبول المهني (Professional Acceptance):" : "3. Professional Acceptance:"}</strong> {isAr ? " تقبل العميل كما هو دون إبداء أي أحكام مسبقة أو تحيز ديني، جنسي، جغرافي، أو عرقي." : " Accepting clients without bias concerning religion, gender, geography, or origin."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-black text-sm text-slate-900 border-r-4 border-primary pr-2.5">{isAr ? "القسم المهني للأخصائي الاجتماعي:" : "The Welfare Professional Oath:"}</h4>
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative overflow-hidden">
                    <span className="absolute top-2 left-3 text-5xl text-primary/10 font-serif font-bold">“</span>
                    <p className="text-xs sm:text-sm text-primary font-bold italic leading-relaxed text-justify pr-2">
                      {isAr 
                        ? "«أقسم بالله العظيم أن أؤدي رسالتي المهنية بأمانة وشرف، وأن أحترم قوانين الدولة ومبادئ الميثاق الأخلاقي للخدمة الاجتماعية، وأن أحافظ على أسرار العملاء وأصون كرامتهم الإنسانية، متفانياً في خدمة التكافل والتنمية الاجتماعية والوطنية بالصعيد ومصر الحبيبة، والله على ما أقول شهيد»" 
                        : "'I swear by Almighty God to perform my welfare duties with absolute honor, to respect the state laws and the ethical code of social work, and to protect the secrets and human dignity of my clients, dedicating my effort to regional and national development. God is witness to my oath.'"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* صندوق المساعدة السريعة */}
        <div className="bg-white rounded-3xl p-6 border border-gray-150/70 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md">
          <div className="space-y-1 text-right">
            <h4 className="font-extrabold text-sm text-slate-900">{isAr ? "هل لديك استفسار إداري أو مالي؟" : "Do you have any administrative questions?"}</h4>
            <p className="text-xs text-slate-500 font-bold leading-normal">
              {isAr 
                ? "مكتب الأمين العام ورعاية الشباب بالمعهد مستعد للإجابة على اتصالاتكم واستفساراتكم طوال ساعات العمل الرسمية." 
                : "The Office of the General Secretary and student services are ready to answer your inquiries during working hours."}
            </p>
          </div>
          <a
            href="tel:0972457032"
            className="bg-accent hover:bg-accent-hover text-white text-xs font-black px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>097 2457032</span>
          </a>
        </div>

      </div>
    </section>
  );
}
