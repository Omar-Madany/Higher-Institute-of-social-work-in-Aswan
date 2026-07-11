import React, { useState } from "react";
import { Mail, Phone, MapPin, Building, Clock, Stamp, Send, HelpCircle, CheckCircle, MessagesSquare, Facebook } from "lucide-react";
import { INST_INFO } from "../data";
import MapLocation from "./MapLocation";
import { useLanguage } from "../context/LanguageContext";

const COMPLAINT_PHONE = "PUT_PHONE_NUMBER_HERE";

export default function ContactUs() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  
  // حالات الرسالة والشكاوى
  const [formState, setFormState] = useState({
    senderName: "",
    senderEmail: "",
    subject: "",
    message: ""
  });
  const [isSent, setIsSent] = useState(false);

  const tContact = {
    ar: {
      badge: "قنوات الاتصال المباشرة",
      title: "راسل إدارة المعهد بأسوان",
      desc: "نحن هنا للإجابة على استفساراتكم المتعلقة بالقبول والتسجيل، أو تلقي شكاوى واقتراحات أولياء الأمور والطلاب على مدار الساعة.",
      infoTitle: "بيانات وتفاصيل الاتصال الرسمية",
      addrLabel: "مقر المعهد الجغرافي:",
      telLabel: "التليفون الأرضي المباشر والفاكس:",
      telWord: "تليفون:",
      faxWord: "فاكس:",
      emailLabel: "البريد الإلكتروني للأمانة العامة وشئون الطلاب:",
      clockLabel: "ساعات ومواعيد العمل الأسبوعية:",
      clockText: "يومياً من الأحد إلى الخميس (ساعة 8:00 صباحاً حتى 2:30 ظهراً)",
      welfareTip: "فريق شئون الطلاب والدعم الأكاديمي جاهز للرد على استمارات تظلم المواد أيضاً.",
      formHeading: "أرسل رسالة فورية إلى السادة وكلاء المعهد:",
      successTitle: "تم إرسال رسالتك بنجاح وسنقوم بالرد في أقرب وقت.",
      successDesc: "شكراً لتواصلك مع أمانة عميد المعهد بأسوان.",
      sendAnother: "إرسال رسالة أخرى ✉️",
      nameLabel: "الاسم الكامل (مطلوب):",
      namePlace: "نموذج: عمر المحلاوي",
      emailLabelInput: "البريد الإلكتروني للتواصل (مطلوب):",
      messageLabel: "نص الرسالة أو الشكوى أو المقترح (مطلوب):",
      messagePlace: "يرجى كتابة كافة تفاصيل طلبكم بوضوح لضمان سرعة رد الإدارة الأكاديمية...",
      submitBtn: "أرسل المذكرة والشكوى الآن",
      notesTip: "❓ هل تريد رعاية الشباب والأنشطة المدرسية؟ يمكنك التواصل فورا على الرقم الداخلي بمقر المعهد بمحافظة أسوان أو زيارة وحدة رعاية الطلاب بالمبنى الرئيسى للمعهد بالطابق الثانى.",
      errorAlert: "يرجى ملء كافة الخانات الإلزامية بنجاح."
    },
    en: {
      badge: "Official Communication Channels",
      title: "Direct Dean & Registration Desk Office",
      desc: "We are fully available to answer your questions regarding student admissions, tuition inquiries, or field training feedback.",
      infoTitle: "Official Office Contact Details",
      addrLabel: "Campus Location Address:",
      telLabel: "Administrative Phone & Fax Line:",
      telWord: "Tel:",
      faxWord: "Fax:",
      emailLabel: "Academic Board & Admissions Email:",
      clockLabel: "Weekly Work Schedules & Timetable:",
      clockText: "Saturday to Wednesday (8:30 AM to 2:00 PM)",
      welfareTip: "Student Welfare team and general support assistants are fully equipped to assist you on-site or via web feedback.",
      formHeading: "Send an Instant Inquiry Node directly to the Dean Council:",
      successTitle: "Your inquiry message has been delivered successfully!",
      successDesc: "Thank you for connecting with the Aswan Social Work Academic Office.",
      sendAnother: "Send Another Message ✉️",
      nameLabel: "Full Legal Name (Required):",
      namePlace: "e.g., John Miller",
      emailLabelInput: "Active Return Email Address (Required):",
      messageLabel: "Message, Suggestion or Complaint text (Required):",
      messagePlace: "Please provide a granular overview representing your request to help us reply efficiently...",
      submitBtn: "Submit Inquiry Form Now",
      notesTip: "❓ Need to reach the student activities coordinator? You can consult directly at Aswan campus main building, student affairs desk located on the second floor.",
      errorAlert: "Please fill out all mandatory form fields correctly."
    }
  };

  const active = isAr ? tContact.ar : tContact.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.senderName || !formState.senderEmail || !formState.message) {
      alert(active.errorAlert);
      return;
    }
    setIsSent(true);
    setFormState({
      senderName: "",
      senderEmail: "",
      subject: "",
      message: ""
    });
  };

  return (
    <section className="py-16 bg-white px-4 md:px-8 border-b border-gray-100" id="contact">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* العناوين والزخرفة */}
        <div className="text-center">
          <span className="text-xs bg-accent/10 text-accent border border-accent/20 font-extrabold px-3.5 py-1 rounded-full uppercase">
            {active.badge}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 relative inline-block">
            {active.title}
            <span className="block w-20 h-1.5 bg-accent mx-auto mt-2 rounded"></span>
          </h2>
          <p className="text-slate-500 font-bold text-xs sm:text-sm mt-3 max-w-2xl mx-auto leading-relaxed">
            {active.desc}
          </p>
        </div>

        {/* شبكة العرض لبيانات الاتصال والخريطة مع فورم الشكاوى */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* الجانب الأيمن: بيانات الاتصال والمواعيد الرسمية والدليل */}
          <div className="lg:col-span-5 bg-gradient-to-br from-primary to-navy-dark text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-8 border border-white/5">
            
            <div className="space-y-6">
              <h3 className="text-lg font-black border-b border-white/20 pb-2 text-accent">{active.infoTitle}</h3>
              
              {/* العنوان */}
              <div className="flex gap-3.5 items-start">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                <div>
                   <span className="block text-xs font-bold text-slate-300">{active.addrLabel}</span>
                  <p className="text-xs sm:text-sm font-bold leading-relaxed mt-0.5">
                    {isAr ? INST_INFO.address : "Kasr El-Hagar Street, El-Ishara Square, Aswan, Egypt"}
                  </p>
                </div>
              </div>

              {/* التليفون والفاكس */}
              <div className="flex gap-3.5 items-start">
                <Phone className="w-5 h-5 text-accent shrink-0 mt-1" />
                <div>
                  <span className="block text-xs font-bold text-slate-300">{active.telLabel}</span>
                  <p className="text-xs sm:text-sm font-bold mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>{active.telWord}</span>
                    <span dir="ltr" className="font-mono font-bold text-accent">+20 {INST_INFO.phoneDisplay}</span>
                  </p>
                  <p className="text-xs sm:text-sm font-bold mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>{active.faxWord}</span>
                    <span dir="ltr" className="font-mono font-bold text-accent">+20 {INST_INFO.fax}</span>
                  </p>
                </div>
              </div>

              {/* رقم هاتف الشكاوى */}
              <div className="flex gap-3.5 items-start border-t border-white/10 pt-4">
                <Phone className="w-5 h-5 text-red-400 shrink-0 mt-1 animate-pulse" />
                <div>
                  <span className="block text-xs font-bold text-slate-300">
                    {isAr ? "رقم الهاتف الخاص بالشكاوى:" : "Complaints Phone Number:"}
                  </span>
                  <p className="text-xs sm:text-sm font-bold mt-1 flex items-center gap-1.5 flex-wrap">
                    <span dir="ltr" className="font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-800/30">
                      {COMPLAINT_PHONE}
                    </span>
                  </p>
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div className="flex gap-3.5 items-start">
                <Mail className="w-5 h-5 text-accent shrink-0 mt-1" />
                <div>
                   <span className="block text-xs font-bold text-slate-300">{active.emailLabel}</span>
                  <a href={`mailto:${INST_INFO.email}`} className="text-xs sm:text-sm font-bold text-accent underline hover:text-white block mt-0.5">
                    {INST_INFO.email}
                  </a>
                </div>
              </div>

              {/* صفحة فيسبوك */}
              {INST_INFO.facebook && (
                <div className="flex gap-3.5 items-start">
                  <Facebook className="w-5 h-5 text-accent shrink-0 mt-1" />
                  <div>
                    <span className="block text-xs font-bold text-slate-300">
                      {isAr ? "الصفحة الرسمية على فيسبوك:" : "Official Facebook Page:"}
                    </span>
                    <a 
                      href={INST_INFO.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-bold text-accent underline hover:text-white block mt-0.5"
                    >
                      {isAr ? "المعهد العالي للخدمة الاجتماعية بأسوان 🔗" : "Aswan Higher Institute for Social Work 🔗"}
                    </a>
                  </div>
                </div>
              )}

              {/* مواعيد العمل */}
              <div className="flex gap-3.5 items-start">
                <Clock className="w-5 h-5 text-accent shrink-0 mt-1" />
                <div>
                   <span className="block text-xs font-bold text-slate-300">{active.clockLabel}</span>
                  <p className="text-xs text-slate-200 mt-0.5 font-bold">
                    {active.clockText}
                  </p>
                </div>
              </div>
            </div>

            {/* بطاقة الرعاية الاجتماعية والاتصال السريع بأسوان */}
            <div className="bg-white/10 p-4 rounded-xl border border-white/15 text-xs text-blue-100 flex items-center gap-2.5">
              <MessagesSquare className="w-6 h-6 text-accent shrink-0" />
              <span>{active.welfareTip}</span>
            </div>

          </div>

          {/* الجانب الأيسر: فورم التواصل الذكي والخرائط التوضيحية */}
          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-gray-200/60 shadow-md space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b border-gray-200 pb-3 flex items-center gap-2">
              <span>{active.formHeading}</span>
            </h3>

            {isSent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-center space-y-4 animate-in scale-in duration-200">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-sm">{active.successTitle}</h4>
                <p className="text-[11px] text-slate-500 font-bold">{active.successDesc}</p>
                <button
                  onClick={() => setIsSent(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-4 rounded cursor-pointer"
                >
                  {active.sendAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{active.nameLabel}</label>
                    <input
                      type="text"
                      required
                      value={formState.senderName}
                      onChange={(e) => setFormState({ ...formState, senderName: e.target.value })}
                      placeholder={active.namePlace}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{active.emailLabelInput}</label>
                    <input
                      type="email"
                      required
                      value={formState.senderEmail}
                      onChange={(e) => setFormState({ ...formState, senderEmail: e.target.value })}
                      placeholder="name@domain.com"
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">{active.messageLabel}</label>
                  <textarea
                    rows={4}
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder={active.messagePlace}
                    className="w-full p-2.5 rounded-lg border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white align-top"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-slate-900 text-white font-black text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{active.submitBtn}</span>
                </button>

              </form>
            )}

            {/* صندوق معلومات بديل ورش رعاية الشباب والأنشطة */}
            <div className="bg-accent/10 border-r-4 border-accent p-3.5 rounded text-xs text-accent-hover font-bold leading-relaxed">
              {active.notesTip}
            </div>

          </div>

        </div>

        {/* موقع المعهد على الخريطة التفاعلية */}
        <MapLocation />

      </div>
    </section>
  );
}
