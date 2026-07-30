import React from "react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { 
  Quote, 
  Users, 
  BookOpen, 
  Award, 
  Building2, 
  Hotel, 
  GraduationCap, 
  BookmarkCheck, 
  Sparkles,
  Heart,
  Calendar
} from "lucide-react";

export default function DeanMessage() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  return (
    <section className="py-12 md:py-16 bg-slate-50/30 min-h-screen" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-12">
        
        {/* Page Title & Header Banner */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{isAr ? "رسالة ترحيبية وتوجيهية" : "Welcoming Address"}</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight"
          >
            كلمة عميد المعهد
          </motion.h2>
          <div className="h-1 w-20 bg-accent mx-auto rounded-full" />
        </div>

        {/* Dean Welcome Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Side Panel: Dean Photo and Main Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl text-center space-y-5 sticky top-24">
              
              {/* Dean Image */}
              <div className="relative group w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-md border-4 border-slate-50">
                <img 
                  src="/dean_pic.png" 
                  alt="أ.د/ مصطفى محمود مصطفى" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 duration-300 transition-transform"
                />
              </div>

              {/* Dean Info */}
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-lg">أ.د/عبدالله علي عبدالله</h3>
                <p className="text-xs text-slate-400 font-extrabold">عميد المعهد ورئيس قسم المجالات</p>
                <div className="inline-block bg-accent/15 text-accent font-black text-[10px] px-2.5 py-1 rounded-full mt-1">
                  المعهد العالي للخدمة الاجتماعية بأسوان
                </div>
              </div>

              {/* Quick Info Badges */}
              <div className="pt-4 border-t border-slate-100 text-right space-y-3">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <BookmarkCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-bold">معادلة المجلس الأعلى للجامعات</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Award className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-bold">بموجب قرار وزارة التعليم العالي لعام ١٩٧٥</span>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Main Message Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-8 space-y-8"
          >
            
            {/* The Main Welcome Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-8 text-right">
              
              {/* Opener quote block */}
              <div className="relative bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 rounded-2xl border border-primary/5">
                <Quote className="absolute -top-3 right-4 w-7 h-7 text-accent/20 rotate-180" />
                <p className="text-slate-800 text-sm md:text-base font-bold leading-relaxed pr-6">
                  السادة الزملاء والزميلات، السادة الوكلاء، السادة رؤساء الأقسام، السادة أعضاء هيئة التدريس، السادة العاملين، والسادة الزوار...
                  <br />
                  <span className="block mt-2 text-primary font-black">
                    يسرني أن أرحب بكم في أروقة المعهد العالي للخدمة الاجتماعية بأسوان.
                  </span>
                </p>
              </div>

              {/* Students section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-black text-base border-r-4 border-accent pr-3 py-0.5">
                  <Users className="w-5 h-5 text-accent" />
                  <h4>أبنائي طلاب وطالبات المعهد</h4>
                </div>
                <div className="text-slate-700 text-sm leading-relaxed space-y-4 font-semibold">
                  <p>
                    يسعدني أن أرحب بكم في رحاب المعهد العالي للخدمة الاجتماعية بأسوان، وأتوجه إلى الطلاب الجدد بخالص التهنئة القلبية للالتحاق بالمعهد، كما أهنئ أبناءنا الطلاب القدامى بمناسبة بدء العام الدراسي الجديد.
                  </p>
                  <p>
                    وآمل منكم جميعًا المشاركة في حياة جامعية حافلة بالتقدم والنجاح، وبذل أقصى الجهد في الدراسة، والمشاركة الإيجابية في مختلف الأنشطة الطلابية، والعمل بروح الفريق؛ لنصل معًا إلى هدفنا المنشود، وهو إعداد <strong className="text-primary font-extrabold">طالب متفوق ومواطن صالح</strong>.
                  </p>
                  <p>
                    إن الطالب هو محور العملية التعليمية، ويتم إعداده لمواجهة تحديات الحاضر والمستقبل، وهو الهدف الأساسي الذي يسعى إليه المعهد.
                  </p>
                  <p>
                    وانطلاقًا من ذلك، يعمل المعهد على إعداد خريج مزود بالمعارف النظرية والخبرات العلمية والسلوكيات الإيجابية، قادر على توظيفها في بناء ذاته وتنمية مجتمعه، من خلال تقديم تعليم عالي الجودة وفقًا للمعايير الأكاديمية، مع التطوير المستمر للخدمات التعليمية بما يتوافق مع احتياجات سوق العمل.
                  </p>
                </div>
              </div>

            </div>

            {/* Scientific Departments Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6 text-right">
              
              <div className="flex items-center gap-2 text-primary font-black text-lg border-r-4 border-primary pr-3 py-0.5 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h4>أعضاء هيئة التدريس بالأقسام العلمية</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* قسم خدمة الفرد */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <h5 className="font-extrabold text-sm text-primary border-b border-primary/10 pb-2 mb-3">قسم خدمة الفرد</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                      <span>أ.د/ عبد المنصف حسن علي رشوان — رئيس القسم</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
                      <span>أ.م.د/ منى سيد عبد الحميد</span>
                    </li>
                  </ul>
                </div>

                {/* قسم خدمة الجماعة */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <h5 className="font-extrabold text-sm text-primary border-b border-primary/10 pb-2 mb-3">قسم خدمة الجماعة</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                      <span>أ.د/ عماد ثروت شرقاوي — رئيس القسم</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
                      <span>أ.د/ أمل محمد منصور</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
                      <span>أ.م.د/ أمل جابر عوض</span>
                    </li>
                  </ul>
                </div>

                {/* قسم تنظيم المجتمع */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <h5 className="font-extrabold text-sm text-primary border-b border-primary/10 pb-2 mb-3">قسم تنظيم المجتمع</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                      <span>أ.د/ عبد الله علي عبد الله — رئيس القسم</span>
                    </li>
                  </ul>
                </div>

                {/* قسم المجالات */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <h5 className="font-extrabold text-sm text-primary border-b border-primary/10 pb-2 mb-3">قسم المجالات</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    {/* <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                      <span>أ.د/ مصطفى محمود مصطفى — رئيس القسم وعميد المعهد</span>
                    </li>  */}
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
                      <span>أ.م.د/ أحمد محمد عبد العزيز</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
                      <span>أ.م.د/ نجوى محمد محمد</span>
                    </li>
                  </ul>
                </div>

                {/* قسم التخطيط */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <h5 className="font-extrabold text-sm text-primary border-b border-primary/10 pb-2 mb-3">قسم التخطيط</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                      <span>أ.د/ فوزي محمد حسني — رئيس القسم</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
                      <span>د/ حسن عبد الوهاب</span>
                    </li>
                  </ul>
                </div>

                {/* قسم العلوم التأسيسية */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <h5 className="font-extrabold text-sm text-primary border-b border-primary/10 pb-2 mb-3">قسم العلوم التأسيسية</h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                      <span>أ.د/ زينب سيد عبد الحميد — رئيس القسم</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
                      <span>د/ بهاء رزيقي علي حسانين</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0" />
                      <span>د/ عبد الحافظ أحمد عبد اللطيف</span>
                    </li>
                  </ul>
                </div>

              </div>

            </div>

            {/* Institute Facilities Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6 text-right">
              
              <div className="flex items-center gap-2 text-primary font-black text-lg border-r-4 border-primary pr-3 py-0.5 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h4>إمكانيات المعهد البنيوية واللوجستية</h4>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-bold">
                يضم المعهد العديد من المباني والمدرجات المجهزة على أعلى مستوى لخدمة العملية التعليمية والبحثية وتحقيق أعلى مستويات الجودة:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
                  <span className="text-primary font-black text-xl">١١ مدرجًا</span>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1">سعة ٧٠٠ طالب لكل مدرج</span>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
                  <span className="text-primary font-black text-xl">١ مدرج</span>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1">سعة ١٥٠٠ طالب</span>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
                  <span className="text-primary font-black text-xl">٢ مدرج</span>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1">سعة ٥٠٠ طالب لكل مدرج</span>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
                  <span className="text-primary font-black text-xl">٤ قاعات</span>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1">سعة ٣٠٠ طالب لكل قاعة</span>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
                  <span className="text-primary font-black text-xl">٩ قاعات</span>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1">قاعات سكاشن سعة ١٥٠ طالبًا</span>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
                  <span className="text-primary font-black text-xl">قاعة مؤتمرات</span>
                  <span className="text-[11px] text-slate-500 font-semibold mt-1">مجهزة على أعلى مستوى تقني</span>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                
                <div className="flex items-start gap-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100/30">
                  <Hotel className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h6 className="font-extrabold text-sm text-slate-900">فندق مجهز بالكامل</h6>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                      فندق خاص بالمدينة والزوار مجهز على أعلى مستوى فندقي لخدمة ضيوف المعهد والفعاليات.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-amber-50/30 p-4 rounded-xl border border-amber-100/30">
                  <GraduationCap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h6 className="font-extrabold text-sm text-slate-900">قسم الدراسات العليا والبحوث</h6>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                      يقدم برامج الدبلوم المهني في الخدمة الاجتماعية بنظام العام الواحد والعامين لخدمة المسيرة البحثية والأكاديمية.
                    </p>
                  </div>
                </div>

              </div>

              <p className="text-[11px] text-slate-400 font-bold leading-relaxed text-center pt-2">
                وتمثل هذه الإمكانات، إلى جانب الكوادر البشرية المتميزة، منظومة متكاملة لخدمة العملية التعليمية والبحثية وتحقيق أعلى مستويات الجودة.
              </p>

            </div>

            {/* Closing Note Card */}
            <div className="bg-gradient-to-br from-primary to-blue-950 text-white rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-12 -translate-y-12" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-16 translate-y-16" />
              
              <div className="space-y-4 relative z-10">
                <Heart className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
                <h4 className="font-black text-lg">وفي الختام</h4>
                <p className="text-blue-100 text-sm max-w-2xl mx-auto leading-relaxed font-semibold">
                  أسأل الله أن يوفقنا جميعًا لما فيه الخير لوطننا الحبيب مصر، وأن يكلل جهودنا جميعًا بالتوفيق والنجاح.
                </p>
                <div className="h-[1px] w-24 bg-white/20 mx-auto my-4" />
                <p className="text-yellow-400 font-extrabold text-xs">مع خالص تمنياتي لكم بدوام التقدم والتميز.</p>
                
                <div className="pt-2 text-right inline-block">
                  <p className="font-black text-sm text-white">أ.د/ عبدالله علي عبدالله</p>
                  <p className="text-[11px] text-blue-200 font-bold mt-0.5">عميد المعهد العالي للخدمة الاجتماعية بأسوان</p>
                </div>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
