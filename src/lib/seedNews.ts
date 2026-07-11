import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { isQuotaError } from "./firebase-error";

export const defaultArticles = [
  {
    id: "news1",
    title_ar: "اعتماد جداول امتحانات الفصل الدراسي الحالي لجميع الفرق الأربعة بأسوان",
    title_en: "Semester Exam Schedules Approved for All Academic Levels",
    summary_ar: "أعلنت الإدارة الأكاديمية بالمعهد العالي للخدمة الاجتماعية بأسوان عن الجداول التفصيلية والنهائية لامتحانات نهاية الفصل الدراسي.",
    summary_en: "Aswan Institute Academic Affairs has disclosed the definitive timetable schedules for final term sessions.",
    content_ar: "أعلنت الإدارة الأكاديمية وشئون الطلاب برعاية الأستاذ الدكتور عميد المعهد اليوم، الجداول الرسمية المفصلة والنهائية لامتحانات نهاية الفصل الدراسي الحالي لجميع الفرق الدراسية الأربعة (الأولى، الثانية، الثالثة، والرابعة بكالوريوس).\n\nوتهيب إدارة المعهد بجميع الطلاب ضرورة تسوية الرسوم الدراسية وتحصيل الكود التعريفي، والالتزام الكامل بالتواجد داخل قاعات الامتحانات قبل بدء اللجان بنصف ساعة على الأقل مع إحضار بطاقة الرقم القومي وكارت الطالب المالي الذكي.",
    content_en: "Official academic boards and student desks under the Dean's purview have released finalized, structured timetables for all four undergraduate batches (Level 1, 2, 3, and 4).\n\nAll current cohorts are advised to settle tuition balances, obtain personal exam codes, and arrive at examination halls at least thirty minutes prior to test times, carrying their National ID and smart student cards.",
    date: "2026-06-18",
    category: "إعلانات",
    image: "/assets/images/academic_hall_1783237406652.jpg",
    views: 1240,
    createdAt: new Date("2026-06-18T10:00:00.000Z").toISOString()
  },
  {
    id: "news2",
    title_ar: "بدء برامج التدريب الميداني والزيارات الخارجية لطلاب الفرقتين الثالثة والرابعة",
    title_en: "Field Internships & Placement Planners Activated",
    summary_ar: "انطلاق فعاليات التدريب العملي المبرم بأكثر من 85 مؤسسة حكومية وأهلية في نطاق المحافظة.",
    summary_en: "Practical field training kicks off inside over 85 governmental and civil bodies across Aswan.",
    content_ar: "انطلقت اليوم الاثنين تحت إشراف قسم التدريب الميداني برئاسة رئيس القسم، المجموعات التخصصية لطلاب الفرقتين الثالثة والرابعة لتنفيذ خطة الزيارات والتدريبات العملية في المدارس ومستشفيات الشفاء والطب النفسي والمنظمات الأهلية بمدينة أسوان.\n\nتستهدف المبادرة تدريب الطلاب عملياً على دراسة الحالات الفردية، وتصميم المبادرات الجماعية وتنظيم البرامج المجتمعية التي تلبي تطلعات التنمية الوطنية الشاملة بالصعيد.",
    content_en: "Under direct supervision of the Practical Internship Department, senior batches (Levels 3 and 4) started their physical allocation rosters inside certified state schools, El-Shefaa medical centers, psychiatric wards, and Aswan NGOs.\n\nThe curriculum focuses on active diagnostic interviews, counseling processes, and community integration to bolster sustainable regional evolution inside Upper Egypt.",
    date: "2026-06-15",
    category: "فعاليات",
    image: "/assets/images/studying.jpg",
    views: 980,
    createdAt: new Date("2026-06-15T10:00:00.000Z").toISOString()
  },
  {
    id: "news3",
    title_ar: "انعقاد المؤتمر العلمي بأسوان لمناقشة أبعاد التغير المناخي والبيئي بالصعيد",
    title_en: "Annual Scientific Meeting Set to Explore Ecological Concerns in Upper Egypt",
    summary_ar: "ناقش نخبة من الأكاديميين دور الأخصائيين الاجتماعيين في توجيه المجتمعات لمواجهة الأزمات البيئية والتغير المناخي.",
    summary_en: "Elite researchers discuss the role of social counseling and active welfare in mitigating climate changes.",
    content_ar: "وسط حضور ومشاركة كبيرة من السادة الأكاديميين والمتخصصين بجامعات الصعيد، اختتمت بنجاح أعمال الملتقى السنوي المشترك للمعهد العالي بأسوان لمناقشة 'الأثر الاجتماعي والميداني للتغيرات المناخية بقرى الصعيد'.\n\nتطرق المؤتمر إلى عدة توصيات هامة، أبرزها دور البحث الاجتماعي وتثقيف المجتمعات في حماية التراث الطبيعي لمحافظة أسوان وتدريب قادة التنمية الأهلية وتوجيه برامج خدمة الجماعة للعمل التطوعي البيئي.",
    content_en: "Gathering academic figures and research chairs from local universities, Aswan's Annual Forum has successfully concluded its research debate focusing on 'The Socio-environmental Impact of Eco-shifts in Upper Egypt.'\n\nKey policy outputs highlighted social awareness frameworks, voluntary ecological groups, and training community leaders to safeguard Aswan's natural heritage.",
    date: "2026-06-10",
    category: "أخبار",
    image: "/assets/images/nile_view_1783237363654.jpg",
    views: 1550,
    createdAt: new Date("2026-06-10T10:00:00.000Z").toISOString()
  },
  {
    id: "news4",
    title_ar: "تنظيم معسكر رعاية الشباب الصيفي في مدينة دهب وسانت كاترين لأوائل الفرق",
    title_en: "Annual Youth Leadership Summer Camp Arranged",
    summary_ar: "تأكيداً على دور الترفيه الإيجابي، رعاية الشباب تعلن رحلة ترفيهية استثنائية لأوائل الدفعة والأنشطة الطلابية.",
    summary_en: "Youth desks announce a merit-based summer camp in Dahab and St. Catherine for high-achieving student groups.",
    content_ar: "أعلنت إدارة رعاية الشباب بالمعهد العالي للخدمة الاجتماعية بأسوان عن تنظيم المعسكر الرياضي والترفيهي السنوي الموجه للطلبة المتفوقين دراسياً وأوائل الأنشطة (المسرحية، الرياضية، الكشفية، والاجتماعية).\n\nينطلق المعسكر في رحلة لمدينتي دهب وسانت كاترين، ممتدة لخمسة أيام، ويهدف لتطوير الوعي والقيادة الفردية وتعميق روابط الود والاحترام بين أوائل الكادر الطلابي بالمعهد.",
    content_en: "Empowering sportsmanship and collaborative work, the Youth Care Department has arranged its annual leadership camp for academic top-scorers and key student activity representatives.\n\nTraveling to Dahab and St. Catherine for five days, the itinerary aims to build leadership qualities and mutual academic esteem amongst the institute's representatives.",
    date: "2026-06-05",
    category: "فعاليات",
    image: "/assets/images/aswan_landscape_1783237391699.jpg",
    views: 810,
    createdAt: new Date("2026-06-05T10:00:00.000Z").toISOString()
  },
  {
    id: "news5",
    title_ar: "إطلاق كارت الطالب البنكي الذكي لتيسير تحصيل الرسوم واستخراج كارنيه المعهد",
    title_en: "Smart Institutional Payment Cards Released",
    summary_ar: "خطوة متطورة في مسيرة التحول الرقمي تتيح للطالب الاستفادة من الخدمات المالية المتكاملة والدفع الذكي.",
    summary_en: "Furthering our computerized transition, smart payment cards simplify tuition collections and access gates.",
    content_ar: "بالتنسيق مع المجلس الأعلى للجامعات ووزارة التعليم العالي، أتمت إدارة الحسابات والاتصالات بمعهد أسوان تسليم الدفعة الأولى من كروت الطلاب البنكية والخدمية الذكية.\n\nيسهل الكارت عملية تسديد المصروفات السنوية ومصروفات الكتب الدراسية عبر منافذ فوري وبوابات الدفع الإلكترونية، مع استخدامه كبطاقة تعريفية لدخول بوابات المعهد والاستعلام عن النتائج على بوابة الطالب الإلكترونية.",
    content_en: "Partnering with Higher Education bodies, Aswan Administration has finalized distributing the first cohort of student debit and services cards.\n\nThe smart cards ease annual tuition payments and reference materials purchases through Fawry networks, whilst doubling as secure pass-keys to access smart gates and exam rosters online.",
    date: "2026-05-30",
    category: "أخبار",
    image: "/assets/images/regenerated_image_1781987718184.png",
    views: 1890,
    createdAt: new Date("2026-05-30T10:00:00.000Z").toISOString()
  },
  {
    id: "news6",
    title_ar: "فتح باب الالتماسات وإجراء المراجعات لنتائج النقل للفصل الدراسي الأول",
    title_en: "Electronic Petitions Activated for First-Term Exam Reviews",
    summary_ar: "شئون الطلاب تعلن تفعيل آليات تقديم الطلبات إلكترونياً لضمان الدقة والشفافية التامة وعرض النتائج.",
    summary_en: "Student desks allow digital submission of scores reviews to preserve complete objectivity.",
    content_ar: "أعلنت إدارة الكنترول بصفة رسمية فتح باب تلقي مذكرات المراجعة وطلبات الالتماسات بخصوص نتائج امتحانات الفصل الدراسي لجميع مستويات الفرق الدراسية الأربعة.\n\nيتم تقديم الطلبات بالكامل رقمياً عبر نموذج الاتصال والشكاوى بالموقع دون الحاجة للحضور الشخصي، حيث يتم فحص التظلم يدوياً وإعادة رصد وتجميع الدرجات وإخطار الطالب بالقرار في غضون عشرة أيام من تاريخ تقديم المذكرة.",
    content_en: "The grading control boards have officially greenlit petition submittals for final term results across all cohorts.\n\nStudents can apply fully online through our contact portals without coming in person. Control agents will retrieve exam materials, re-verify cumulative sums, and dispatch formal reports back to the applicant within ten days.",
    date: "2026-05-25",
    category: "إعلانات",
    image: "/assets/images/2secondview.jpg",
    views: 1110,
    createdAt: new Date("2026-05-25T10:00:00.000Z").toISOString()
  },
  {
    id: "timeline-event-1",
    title_ar: "ورشة عمل عن حل وتطبيق خوارزميات ذكاء الاعمال واستخراج البيانات",
    title_en: "Workshop on Solving and Applying Business Intelligence and Data Mining Algorithms",
    summary_ar: "في إطار حرص إدارة شئون الطلاب بالكلية المستمر على تنمية قدرات طلابها وتأهيلهم لسوق العمل، وفي ضوء مواكبة التكنولوجيا الحديثة ونظم ذكاء الأعمال وتعدين البيانات...",
    summary_en: "Within the framework of student affairs department continuous keenness to develop student capabilities and prepare them for the labor market...",
    content_ar: "في إطار حرص إدارة شئون الطلاب بالكلية المستمر على تنمية قدرات طلابها وتأهيلهم لسوق العمل، وفي ضوء مواكبة التكنولوجيا الحديثة ونظم ذكاء الأعمال، عقدت اليوم ورشة عمل تفاعلية متكاملة حول حل وتطبيق خوارزميات ذكاء الأعمال وتعدين البيانات واستخراج الأنماط المفيدة لدعم اتخاذ القرارات الأكاديمية والمؤسسية.",
    content_en: "Within the framework of student affairs department continuous keenness to develop student capabilities and prepare them for the labor market, and in light of keeping pace with modern technology and business intelligence systems, an interactive workshop was held today to train students on solving and applying BI algorithms and data mining processes to support academic and institutional decision-making.",
    date: "2026-06-13",
    category: "فعاليات",
    image: "/assets/images/campus_library_1783237377602.jpg",
    views: 240,
    createdAt: new Date("2026-06-13T10:00:00.000Z").toISOString()
  },
  {
    id: "timeline-event-2",
    title_ar: "ورشة عمل...مبادرة مودة للحفاظ على الاسرة المصرية",
    title_en: "Workshop... Mawada Initiative for Preserving the Egyptian Family",
    summary_ar: "في إطار حرص إدارة شئون الطلاب بالكلية المستمر على تنمية قدرات طلابها وتأهيلهم لسوق العمل، وفي ضوء المبادرة الرئاسية 'مودة' للحفاظ على كيان الأسرة المصرية وتأهيل الشباب...",
    summary_en: "Within the framework of student affairs department continuous keenness to develop student capabilities and prepare them for the labor market...",
    content_ar: "في إطار حرص إدارة شئون الطلاب بالكلية المستمر على تنمية قدرات طلابها وتأهيلهم لسوق العمل، وفي ضوء أهمية تأهيل الكوادر الشابة والطلاب المقبلين على الزواج لبناء أسرة سليمة، أقيمت اليوم ورشة عمل لمبادرة مودة للحفاظ على الأسرة المصرية والتوعية بأسس الاختيار السليم والتخطيط الأسري الناجح.",
    content_en: "Within the framework of student affairs department continuous keenness to develop student capabilities and prepare them for the labor market, and in light of the 'Mawada' Presidential Initiative to protect the Egyptian family structure, a seminar was organized today to raise students' awareness of successful family planning and marriage criteria.",
    date: "2026-06-13",
    category: "فعاليات",
    image: "/assets/images/2secondview.jpg",
    views: 185,
    createdAt: new Date("2026-06-13T09:00:00.000Z").toISOString()
  },
  {
    id: "timeline-event-3",
    title_ar: "ورشة عمل ..... مبادرة مودة الرئاسية للحفاظ على الاسرة المصرية",
    title_en: "Workshop... Presidential Mawada Initiative for Preserving the Egyptian Family",
    summary_ar: "في إطار حرص إدارة شئون الطلاب بالكلية المستمر على تنمية قدرات طلابها وتأهيلهم لسوق العمل، وفي ضوء التوسع في تقديم برامج الدعم الأسري والتربوي للطلاب والطالبات بالمعهد العالي للخدمة الاجتماعية بأسوان...",
    summary_en: "Within the framework of student affairs department continuous keenness to develop student capabilities and prepare them for the labor market...",
    content_ar: "في إطار حرص إدارة شئون الطلاب بالكلية المستمر على تنمية قدرات طلابها وتأهيلهم لسوق العمل، وفي ضوء مبادرة مودة الرئاسية للحفاظ على الأسرة المصرية، نظمت إدارة رعاية الشباب بالتعاون مع كبار الأخصائيين الاجتماعيين ورشة عمل تدريبية وتفاعلية موسعة لتزويد الطلاب بمهارات حل النزاعات الأسرية وبناء ركائز المجتمع القوي.",
    content_en: "Within the framework of student affairs department continuous keenness to develop student capabilities and prepare them for the labor market, and in light of the Presidential Mawada Initiative and raising family awareness, Aswan Higher Institute for Social Work organized an expansive interactive training workshop on family dispute resolution and community resilience.",
    date: "2026-06-13",
    category: "فعاليات",
    image: "/assets/images/academic_hall_1783237406652.jpg",
    views: 150,
    createdAt: new Date("2026-06-13T08:00:00.000Z").toISOString()
  }
];

export async function seedDefaultNews() {
  try {
    const seedDocRef = doc(db, "news_articles", "_seed_flag");
    const seedDocSnap = await getDoc(seedDocRef);

    if (!seedDocSnap.exists() || !seedDocSnap.data().seeded_v1) {
      console.log("Seeding default news articles into Firestore...");

      for (const art of defaultArticles) {
        await setDoc(doc(db, "news_articles", art.id), {
          title_ar: art.title_ar,
          title_en: art.title_en,
          summary_ar: art.summary_ar,
          summary_en: art.summary_en,
          content_ar: art.content_ar,
          content_en: art.content_en,
          date: art.date,
          category: art.category,
          image: art.image,
          views: art.views,
          createdAt: art.createdAt
        });
      }

      await setDoc(seedDocRef, { seeded_v1: true });
      console.log("Default news successfully seeded into Firestore!");
    }
  } catch (err) {
    if (isQuotaError(err)) {
      console.warn("Seeding news skipped due to Firestore Quota Exceeded.");
      try {
        sessionStorage.setItem("aswan_inst_firestore_quota_exceeded", "true");
      } catch (e) {}
    } else {
      console.error("Error in seeding news: ", err);
    }
  }
}

