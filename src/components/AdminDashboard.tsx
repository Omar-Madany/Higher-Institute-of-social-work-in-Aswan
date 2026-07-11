import React, { useState, useEffect } from "react";
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDoc, where, setDoc, writeBatch
} from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import { handleFirestoreError, OperationType, isQuotaError } from "../lib/firebase-error";
import { 
  Lock, LayoutDashboard, Newspaper, GraduationCap, Calendar, Check, X, Trash2, Plus, 
  Users, BarChart2, CheckCircle, ShieldAlert, Sparkles, Send, Globe, RefreshCw, Eye,
  Upload, Pencil, Download, CheckCircle2
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { PRELOADED_STUDENTS } from "../data/preloaded_students";
import * as XLSX from "xlsx";
import * as pdfjs from "pdfjs-dist";

interface Application {
  id: string;
  appId: string;
  fullName: string;
  phone: string;
  highSchoolGrad: string;
  nationalId: string;
  notes: string;
  status: string;
  address?: string;
  receiptCode?: string;
  paymentCycle?: string;
  academicEmail?: string;
  academicPassword?: string;
  generatedStudentId?: string;
  createdAt: any;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  date: string;
  image?: string;
  views: number;
}

interface ScheduleItem {
  id: string;
  academicYear: string;
  subject: string;
  date: string;
  time: string;
  hall: string;
}

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  // مصادقة بسيطة ومريحة للموظفين غير المبرمجين
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Check if there is an active logged-in admin session to bypass passcode entry
  const isSimulatedAdminActive = (() => {
    try {
      const saved = localStorage.getItem("aswan_simulated_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.profile?.role === "admin";
      }
    } catch (e) {}
    return false;
  })();

  const [isUnlocked, setIsUnlocked] = useState(isSimulatedAdminActive || false);
  const [authError, setAuthError] = useState("");

  // Brute force protection states
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem("admin_failed_attempts") || "0", 10);
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    return parseInt(localStorage.getItem("admin_lockout_until") || "0", 10);
  });

  const [activeTab, setActiveTab] = useState("analytics");
  
  // Seeding/Bulk Import states
  const [isSeedingActive, setIsSeedingActive] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState(0);
  const [seedingCurrent, setSeedingCurrent] = useState(0);
  const [seedingTotal, setSeedingTotal] = useState(0);
  const [csvTextInput, setCsvTextInput] = useState("");
  const [showSeedingSuccess, setShowSeedingSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // Excel grades import states
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadAcademicYear, setUploadAcademicYear] = useState("الفرقة الأولى");
  const [parsedGrades, setParsedGrades] = useState<any[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [isSavingExcelGrades, setIsSavingExcelGrades] = useState(false);
  const [excelGradesProgress, setExcelGradesProgress] = useState(0);
  const [excelGradesCurrent, setExcelGradesCurrent] = useState(0);
  const [excelGradesTotal, setExcelGradesTotal] = useState(0);
  const [excelImportError, setExcelImportError] = useState<string | null>(null);
  const [excelImportSuccess, setExcelImportSuccess] = useState(false);
  const [excelImportedCount, setExcelImportedCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const [adminStudents, setAdminStudents] = useState<any[]>([]);
  const [adminPayments, setAdminPayments] = useState<any[]>([]);

  // بيانات التحليلات والإحصائيات
  const [liveStats, setLiveStats] = useState({ today: 0, month: 0, total: 0, activeNow: 0 });
  const [applications, setApplications] = useState<Application[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // فورم إضافة خبر جديد
  const [newsForm, setNewsForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "أخبار",
    image: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [newsSuccess, setNewsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const startEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsForm({
      title: item.title,
      summary: item.summary,
      content: item.content || "",
      category: item.category,
      image: item.image || "",
      date: item.date
    });
    // Scroll smoothly to form
    const formElement = document.getElementById("news-form-container");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const cancelEditNews = () => {
    setEditingNewsId(null);
    setNewsForm({
      title: "",
      summary: "",
      content: "",
      category: "أخبار",
      image: "",
      date: new Date().toISOString().split("T")[0]
    });
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(isAr ? "برجاء اختيار ملف صورة صالح!" : "Please choose a valid image file!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(isAr ? "حجم الصورة كبير جداً! الحد الأقصى 5 ميجابايت." : "Image size is too large! Max 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          setNewsForm(prev => ({ ...prev, image: compressedBase64 }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // فورم إضافة جدول امتحان
  const [scheduleForm, setScheduleForm] = useState({
    academicYear: "الفرقة الأولى",
    subject: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00 - 11:00",
    hall: "مدرج أ - الطابق الأول"
  });
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // يتحقق هذا من أن المستخدم الحالي مسجل دخوله فعلياً عبر Firebase Auth
  // وأن له وثيقة مطابقة في مجموعة admins/{uid} (تُنشأ فقط عبر سكربت الإعداد
  // أو Firebase Console — لا يمكن لأي متصفح إنشاءها بنفسه).
  const checkIsRegisteredAdmin = async (uid: string): Promise<boolean> => {
    try {
      const adminDoc = await getDoc(doc(db, "admins", uid));
      return adminDoc.exists();
    } catch (err) {
      console.error("Failed to verify admin status:", err);
      return false;
    }
  };

  const signAsAdmin = async (adminEmail: string, adminPassword: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      const isRegisteredAdmin = await checkIsRegisteredAdmin(cred.user.uid);
      if (!isRegisteredAdmin) {
        // Real account, but not authorized as staff — sign them back out.
        await auth.signOut();
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn("Firebase Auth sign-in failed:", err?.code || err);
      return false;
    }
  };

  // تصدير البيانات كنسخة احتياطية كاملة JSON
  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        institution: "Higher Institute for Social Work, Aswan",
        applications: applications,
        students: adminStudents,
        payments: adminPayments,
        exams: schedules,
        news: news
      };
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `aswan_institute_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Export backup failed:", err);
    }
  };

  // تصدير بيانات التبويب الحالي كملف CSV يدعم اللغة العربية بالكامل في إكسل
  const handleExportTabCSV = () => {
    try {
      let headers: string[] = [];
      let rows: string[][] = [];
      let fileName = "";

      if (activeTab === "applications") {
        headers = [
          isAr ? "رقم الطلب" : "App ID",
          isAr ? "الاسم الكامل" : "Full Name",
          isAr ? "الهاتف" : "Phone",
          isAr ? "الرقم القومي" : "National ID",
          isAr ? "الحالة" : "Status",
          isAr ? "كود الإيصال" : "Receipt Code",
          isAr ? "العنوان" : "Address",
          isAr ? "تاريخ التقديم" : "Submission Date"
        ];
        rows = applications.map(app => [
          app.appId || app.id,
          `"${app.fullName.replace(/"/g, '""')}"`,
          app.phone,
          `'${app.nationalId}`,
          app.status,
          app.receiptCode || "",
          `"${(app.address || "").replace(/"/g, '""')}"`,
          app.createdAt || ""
        ]);
        fileName = "admission_applications";
      } else if (activeTab === "students") {
        headers = [
          isAr ? "كود الطالب" : "Student ID",
          isAr ? "الاسم الكامل" : "Full Name",
          isAr ? "البريد الأكاديمي" : "Academic Email",
          isAr ? "الدور" : "Role",
          isAr ? "تاريخ التسجيل" : "Registration Date"
        ];
        rows = adminStudents.map(student => [
          student.uid || student.id,
          `"${student.fullName.replace(/"/g, '""')}"`,
          student.email,
          student.role,
          student.createdAt || ""
        ]);
        fileName = "enrolled_students";
      } else if (activeTab === "exams") {
        headers = [
          isAr ? "السنة الدراسية" : "Academic Year",
          isAr ? "المادة" : "Subject",
          isAr ? "التاريخ" : "Date",
          isAr ? "التوقيت" : "Time",
          isAr ? "القاعة/المدرج" : "Hall/Classroom"
        ];
        rows = schedules.map(item => [
          `"${item.academicYear.replace(/"/g, '""')}"`,
          `"${item.subject.replace(/"/g, '""')}"`,
          item.date,
          item.time,
          `"${item.hall.replace(/"/g, '""')}"`
        ]);
        fileName = "exam_schedules";
      } else if (activeTab === "news") {
        headers = [
          isAr ? "العنوان" : "Title",
          isAr ? "التصنيف" : "Category",
          isAr ? "التاريخ" : "Date",
          isAr ? "المشاهدات" : "Views"
        ];
        rows = news.map(item => [
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.category.replace(/"/g, '""')}"`,
          item.date,
          item.views ? item.views.toString() : "0"
        ]);
        fileName = "news_articles";
      } else {
        return; // لا يدعم التحليلات بشكل مباشر كجدول بسيط
      }

      // إضافة BOM لـ UTF-8 حتى يتعرف Excel على الحروف العربية بشكل صحيح
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export CSV failed:", err);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if currently locked out
    const now = Date.now();
    if (now < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - now) / 1000);
      const remainingMins = Math.ceil(remainingSecs / 60);
      setAuthError(isAr 
        ? `النظام مغلق مؤقتاً لحمايته. يرجى الانتظار ${remainingMins} دقيقة والمحاولة مجدداً.`
        : `System is locked out for security. Please wait ${remainingMins} minutes and try again.`
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const signInSucceeded = await signAsAdmin(normalizedEmail, password);

    if (signInSucceeded) {
      setIsUnlocked(true);
      setAuthError("");
      setFailedAttempts(0);
      setLockoutUntil(0);
      localStorage.removeItem("admin_failed_attempts");
      localStorage.removeItem("admin_lockout_until");
      localStorage.setItem("aswan_admin_unlocked", "true");
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      localStorage.setItem("admin_failed_attempts", nextAttempts.toString());

      if (nextAttempts >= 5) {
        const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 mins lockout
        setLockoutUntil(lockoutTime);
        localStorage.setItem("admin_lockout_until", lockoutTime.toString());
        setAuthError(isAr 
          ? "تم قفل لوحة التحكم لمدة 15 دقيقة بعد 5 محاولات خاطئة لحماية النظام."
          : "Admin panel locked for 15 minutes after 5 failed attempts to protect the system."
        );
      } else {
        const remaining = 5 - nextAttempts;
        setAuthError(isAr 
          ? `رمز المرور غير صحيح! يتبقى لك ${remaining} محاولات قبل إغلاق النظام.`
          : `Incorrect passkey! You have ${remaining} attempts remaining before system lockout.`
        );
      }
    }
  };

  useEffect(() => {
    // نعيد التحقق من جلسة Firebase Auth الحقيقية عند إعادة تحميل الصفحة، بدلاً
    // من الوثوق بعلامة محلية يمكن لأي شخص تزويرها من أدوات المطوّر.
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const isRegisteredAdmin = await checkIsRegisteredAdmin(user.uid);
        setIsUnlocked(isRegisteredAdmin);
        if (!isRegisteredAdmin) {
          localStorage.removeItem("aswan_admin_unlocked");
        }
      } else {
        setIsUnlocked(false);
        localStorage.removeItem("aswan_admin_unlocked");
      }
    });
    return () => unsubscribe();
  }, []);

  // دالة استيراد وتعبئة نتائج الطلاب جماعياً
  const handleImportStudentsList = async (studentsToImport: { seatNumber: string; fullName: string; status: string }[]) => {
    if (studentsToImport.length === 0) {
      alert(isAr ? "لا توجد بيانات للاستيراد." : "No data to import.");
      return;
    }

    setIsSeedingActive(true);
    setSeedingProgress(0);
    setSeedingCurrent(0);
    setSeedingTotal(studentsToImport.length);
    setShowSeedingSuccess(false);

    try {
      let count = 0;
      let batch = writeBatch(db);

      for (let i = 0; i < studentsToImport.length; i++) {
        const student = studentsToImport[i];
        const docId = `seat_${student.seatNumber}`;
        const docRef = doc(db, "student_results_by_seat", docId);

        // كائن النتيجة المعتمد المطابق للمخطط
        const resultObj = {
          seatNumber: student.seatNumber,
          fullName: student.fullName,
          academicYear: student.seatNumber.startsWith("5") ? "الفرقة الأولى" : (student.seatNumber.startsWith("6") ? "الفرقة الرابعة" : "الفرقة الأولى"),
          department: "شعبة الخدمة الاجتماعية",
          percentage: 0,
          status: student.status, // e.g. "منقول", "باقي"
          grades: [
            { subject: "طرق الخدمة الاجتماعية", passingScore: 50, scoreText: "قيد الرصد", maxScore: 100 },
            { subject: "التنمية الاجتماعية", passingScore: 50, scoreText: "امتياز", maxScore: 100, isSpecial: true },
            { subject: "السلوك الإنساني والبيئة", passingScore: 50, scoreText: "قيد الرصد", maxScore: 100 },
            { subject: "الرعاية الاجتماعية", passingScore: 50, scoreText: "قيد الرصد", maxScore: 100 },
            { subject: "الاتصال والعمل الجماعي", passingScore: 50, scoreText: "قيد الرصد", maxScore: 100 }
          ]
        };

        batch.set(docRef, resultObj);
        count++;

        // نقوم بالكتابة على دفعات لتحديث الـ UI باستمرار ليرى المستخدم التقدم بدقة
        if (count % 40 === 0 || i === studentsToImport.length - 1) {
          await batch.commit();
          batch = writeBatch(db);
          setSeedingCurrent(i + 1);
          setSeedingProgress(Math.round(((i + 1) / studentsToImport.length) * 100));
          // تأخير طفيف لتحديث واجهة المستخدم بسلاسة
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      setImportedCount(studentsToImport.length);
      setShowSeedingSuccess(true);
    } catch (err: any) {
      console.error("Failed to seed students:", err);
      alert(isAr ? `فشل عملية الاستيراد: ${err.message}` : `Import failed: ${err.message}`);
    } finally {
      setIsSeedingActive(false);
    }
  };

  // معالجة استيراد النص الملصوق
  const handlePastedCsvImport = () => {
    const lines = csvTextInput.trim().split("\n");
    const parsedStudents: { seatNumber: string; fullName: string; status: string }[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      // تقسيم السطر بالفاصلة أو المسافة الجدولة
      const parts = line.includes(",") ? line.split(",") : line.split("\t");
      if (parts.length < 2) continue;
      
      const seat = parts[0].trim();
      const name = parts[1].trim();
      const status = parts[2] ? parts[2].trim() : (isAr ? "منقول" : "Transferred");

      if (seat && name) {
        parsedStudents.push({ seatNumber: seat, fullName: name, status });
      }
    }

    if (parsedStudents.length === 0) {
      alert(isAr ? "صيغة البيانات الملصقة غير صالحة. يرجى إدخال: رقم الجلوس,الاسم" : "Invalid pasted format. Please enter: SeatNumber,Name");
      return;
    }

    handleImportStudentsList(parsedStudents);
    setCsvTextInput("");
  };

  // معالجة السحب والإفلات لملفات إكسل
  const handleExcelDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleExcelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "xlsx" || extension === "xls" || extension === "csv") {
        setExcelFile(file);
        parseExcelFile(file);
      } else if (extension === "pdf") {
        setExcelFile(file);
        parsePdfFile(file);
      } else {
        setExcelImportError(isAr ? "نوع الملف غير مدعوم. يرجى اختيار ملف Excel أو PDF (.xlsx, .xls, .csv, .pdf)" : "Unsupported file type. Please select an Excel or PDF file (.xlsx, .xls, .csv, .pdf)");
      }
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split(".").pop()?.toLowerCase();
      setExcelFile(file);
      if (extension === "pdf") {
        parsePdfFile(file);
      } else {
        parseExcelFile(file);
      }
    }
  };

  // تحليل ملف PDF واستخراج الدرجات وربطها بالأسماء
  const parsePdfFile = async (file: File) => {
    setIsParsingExcel(true);
    setExcelImportError(null);
    setExcelImportSuccess(false);
    setParsedGrades([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // تهيئة PDF.js worker بشكل آمن ومتوافق
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const allRows: string[][] = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // تجميع العناصر بناءً على إحداثي Y مع سماحية تفاوت معينة لتحديد الصفوف
        const items = textContent.items as any[];
        if (items.length === 0) continue;
        
        const rowsMap: { [y: number]: any[] } = {};
        const tolerance = 6;
        
        items.forEach(item => {
          if (!item.str || item.str.trim() === "") return;
          
          // إحداثيات العنصر: transform يحتوي على [scaleX, skewY, skewX, scaleY, translateX, translateY]
          const y = item.transform[5];
          const x = item.transform[4];
          
          // التحقق من وجود صف قريب على نفس المحور الرأسي Y
          const foundY = Object.keys(rowsMap).find(existingY => Math.abs(Number(existingY) - y) < tolerance);
          
          if (foundY) {
            rowsMap[Number(foundY)].push({ x, str: item.str });
          } else {
            rowsMap[y] = [{ x, str: item.str }];
          }
        });
        
        // ترتيب الصفوف من الأعلى لأسفل (Y تنازلي)
        const sortedYKeys = Object.keys(rowsMap).map(Number).sort((a, b) => b - a);
        
        sortedYKeys.forEach(y => {
          const rowItems = rowsMap[y];
          // ترتيب العناصر داخل الصف الواحد من اليمين لليسار أو العكس (X تصاعدي)
          rowItems.sort((a, b) => a.x - b.x);
          
          const cells = rowItems.map(item => item.str.trim());
          allRows.push(cells);
        });
      }
      
      console.log("Parsed PDF rows:", allRows);
      
      // استخراج البيانات من الصفوف المهيكلة
      let headerRowIndex = -1;
      for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i];
        const hasSeat = row.some(cell => cell.includes("جلوس") || cell.includes("seat") || cell.toLowerCase() === "id");
        const hasName = row.some(cell => cell.includes("اسم") || cell.includes("name") || cell.includes("الكامل"));
        if (hasSeat && hasName) {
          headerRowIndex = i;
          break;
        }
      }
      
      let subjects: string[] = [];
      let seatColIndex = -1;
      let nameColIndex = -1;
      let totalColIndex = -1;
      let pctColIndex = -1;
      let gradeColIndex = -1;
      let rankColIndex = -1;
      let notesColIndex = -1;
      
      let headerRow: string[] = [];
      if (headerRowIndex !== -1) {
        headerRow = allRows[headerRowIndex];
        seatColIndex = headerRow.findIndex(cell => cell.includes("جلوس") || cell.includes("seat") || cell.toLowerCase() === "id");
        nameColIndex = headerRow.findIndex(cell => cell.includes("اسم") || cell.includes("name") || cell.includes("الكامل"));
        totalColIndex = headerRow.findIndex(cell => cell.includes("مجموع") || cell.includes("total") || cell.includes("المجموع"));
        pctColIndex = headerRow.findIndex(cell => cell.includes("نسبة") || cell.includes("percentage") || cell.includes("%") || cell.includes("النسبة"));
        gradeColIndex = headerRow.findIndex(cell => cell.includes("تقدير") || cell.includes("grade") || cell.includes("التقدير"));
        rankColIndex = headerRow.findIndex(cell => cell.includes("ترتيب") || cell.includes("rank") || cell.includes("الترتيب"));
        notesColIndex = headerRow.findIndex(cell => cell.includes("ملاحظات") || cell.includes("notes") || cell.includes("ملاحظة"));
        
        headerRow.forEach((cell, idx) => {
          if (
            idx !== seatColIndex &&
            idx !== nameColIndex &&
            idx !== totalColIndex &&
            idx !== pctColIndex &&
            idx !== gradeColIndex &&
            idx !== rankColIndex &&
            idx !== notesColIndex &&
            cell.trim() !== ""
          ) {
            subjects.push(cell.trim());
          }
        });
      }
      
      const results: any[] = [];
      const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 0;
      
      for (let i = startIndex; i < allRows.length; i++) {
        const row = allRows[i];
        if (row.length === 0) continue;
        
        let seatNumber = "";
        if (seatColIndex !== -1 && seatColIndex < row.length) {
          seatNumber = row[seatColIndex].trim();
        } else {
          const numberCell = row.find(cell => /^\d{4,6}$/.test(cell.trim()));
          if (numberCell) {
            seatNumber = numberCell.trim();
          }
        }
        
        if (seatNumber.includes(".")) {
          seatNumber = seatNumber.split(".")[0];
        }
        
        if (!seatNumber || isNaN(Number(seatNumber))) continue;
        
        let fullName = "";
        let status = "";
        const matchedStudent = PRELOADED_STUDENTS.find(s => s.seatNumber === seatNumber);
        
        if (matchedStudent) {
          fullName = matchedStudent.fullName;
          status = matchedStudent.status;
        } else if (nameColIndex !== -1 && nameColIndex < row.length) {
          fullName = row[nameColIndex].trim();
        } else {
          const textCell = row.find(cell => 
            cell.trim().length > 5 && 
            !cell.includes("جلوس") && 
            !cell.includes("اسم") && 
            !cell.includes("التقدير") && 
            !/^\d+$/.test(cell.trim())
          );
          fullName = textCell ? textCell.trim() : "";
        }
        
        let totalScoreVal = 0;
        if (totalColIndex !== -1 && totalColIndex < row.length) {
          totalScoreVal = Number(row[totalColIndex]) || 0;
        }
        
        let pctVal = 0;
        if (pctColIndex !== -1 && pctColIndex < row.length) {
          const pctStr = row[pctColIndex].replace("%", "").trim();
          pctVal = Number(pctStr) || 0;
        }
        
        let generalGrade = "";
        if (gradeColIndex !== -1 && gradeColIndex < row.length) {
          generalGrade = row[gradeColIndex].trim();
        }
        
        let rankVal = "";
        if (rankColIndex !== -1 && rankColIndex < row.length) {
          rankVal = row[rankColIndex].trim();
        }
        
        let notesVal = "";
        if (notesColIndex !== -1 && notesColIndex < row.length) {
          notesVal = row[notesColIndex].trim();
        }
        
        const subjectGrades: any[] = [];
        if (headerRowIndex !== -1) {
          headerRow.forEach((cell, idx) => {
            if (
              idx !== seatColIndex &&
              idx !== nameColIndex &&
              idx !== totalColIndex &&
              idx !== pctColIndex &&
              idx !== gradeColIndex &&
              idx !== rankColIndex &&
              idx !== notesColIndex &&
              cell.trim() !== ""
            ) {
              const scoreText = idx < row.length ? row[idx].trim() : "";
              subjectGrades.push({
                subject: cell.trim(),
                passingScore: 50,
                maxScore: 100,
                scoreText: scoreText
              });
            }
          });
        } else {
          row.forEach((cell, idx) => {
            if (idx !== seatColIndex && idx !== nameColIndex) {
              subjectGrades.push({
                subject: isAr ? `مادة ${idx + 1}` : `Subject ${idx + 1}`,
                passingScore: 50,
                maxScore: 100,
                scoreText: cell.trim()
              });
            }
          });
        }
        
        results.push({
          seatNumber,
          fullName: fullName, // نتركها فارغة تماماً إذا لم توجد
          academicYear: uploadAcademicYear,
          department: isAr ? "شعبة الخدمة الاجتماعية" : "Social Work Division",
          percentage: pctVal || 0,
          totalScore: totalScoreVal || 0,
          generalGrade: generalGrade,
          rank: rankVal,
          notes: notesVal,
          status: status || generalGrade || "",
          grades: subjectGrades
        });
      }
      
      // في حال لم نجد صفوفاً مهيكلة، نحاول قراءة الأسطر كبديل مرن
      if (results.length === 0) {
        const fullText = allRows.map(r => r.join(" ")).join("\n");
        const lines = fullText.split("\n");
        
        for (const line of lines) {
          const seatMatch = line.match(/\b(5\d{3}|6\d{3})\b/);
          if (seatMatch) {
            const seat = seatMatch[1];
            const matchedStudent = PRELOADED_STUDENTS.find(s => s.seatNumber === seat);
            let name = matchedStudent ? matchedStudent.fullName : "";
            if (!name) {
              const nameMatch = line.match(/[\u0600-\u06FF]{3,10}(?:\s+[\u0600-\u06FF]{3,10}){2,4}/);
              if (nameMatch) name = nameMatch[0];
            }
            
            results.push({
              seatNumber: seat,
              fullName: name, // نتركها فارغة إذا لم تكن موجودة
              academicYear: uploadAcademicYear,
              department: isAr ? "شعبة الخدمة الاجتماعية" : "Social Work Division",
              percentage: 0,
              totalScore: 0,
              generalGrade: "",
              rank: "",
              notes: "",
              status: "",
              grades: []
            });
          }
        }
      }
      
      if (results.length === 0) {
        throw new Error(isAr ? "لم نتمكن من استخراج أي أرقام جلوس أو درجات صالحة من ملف PDF." : "No valid student seat numbers or grades extracted from the PDF file.");
      }
      
      setParsedGrades(results);
    } catch (err: any) {
      console.error("PDF parse error:", err);
      setExcelImportError(err.message || (isAr ? "حدث خطأ أثناء تحليل ملف PDF. يرجى التحقق من صياغة الملف." : "Failed to parse PDF file. Please verify file format."));
    } finally {
      setIsParsingExcel(false);
    }
  };

  // تحليل ملف Excel واستخراج الدرجات وربطها بالأسماء
  const parseExcelFile = (file: File) => {
    setIsParsingExcel(true);
    setExcelImportError(null);
    setExcelImportSuccess(false);
    setParsedGrades([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const rawRowsArray = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        
        let isAswanCustomFormat = false;
        for (let i = 0; i < Math.min(10, rawRowsArray.length); i++) {
          const row = rawRowsArray[i];
          if (Array.isArray(row)) {
            const rowStr = row.map(cell => String(cell || "")).join(" ");
            if (rowStr.includes("رقم الجلوس") && (rowStr.includes("التدريب") || rowStr.includes("الميدانى") || rowStr.includes("الممارسة"))) {
              isAswanCustomFormat = true;
              break;
            }
          }
        }

        const results: any[] = [];

        if (isAswanCustomFormat) {
          for (let i = 0; i < rawRowsArray.length; i++) {
            const row = rawRowsArray[i];
            if (!Array.isArray(row) || row.length < 5) continue;
            
            // رقم الجلوس في العمود الثاني (index 1)
            const seatNumber = String(row[1] || "").trim().split(".")[0];
            if (!seatNumber || isNaN(Number(seatNumber)) || seatNumber.length < 4 || seatNumber.length > 6) {
              continue; // تخطي الصفوف غير الصالحة كأرقام جلوس
            }
            
            const fullName = String(row[2] || "").trim();
            
            const subjectNames = [
              "التدريب الميدانى",
              "حلقات البحث",
              "الممارسة المهنية في العمل مع الافراد",
              "الممارسة المهنية في العمل مع الجماعات",
              "الممارسة المهنية في العمل مع المجتمعات",
              "سياسة الرعاية الاجتماعية",
              "الخدمة الاجتماعية في المجال الطبي",
              "إدارة المؤسسات الاجتماعية",
              "الخدمة الاجتماعية الدولية",
              "الخدمة الاجتماعية فى مجال رعاية الشباب",
              "الخدمة الاجتماعية فى مجال الدفاع الاجتماعى",
              "اخلاقيات الممارسة المهنية للخدمة الاجتماعية",
              "التربية العسكرية"
            ];
            
            const subjectGrades = subjectNames.map((subject, idx) => {
              const val = String(row[3 + idx] || "").trim();
              return {
                subject,
                passingScore: 50,
                maxScore: 100,
                scoreText: val
              };
            });
            
            // مواد التخلف (مادة 1 وتقديرها، ومادة 2 وتقديرها) في الأعمدة 16، 17، 18، 19
            const backlogSubjects: any[] = [];
            const backlog1Subject = String(row[16] || "").trim();
            const backlog1Score = String(row[17] || "").trim();
            const backlog2Subject = String(row[18] || "").trim();
            const backlog2Score = String(row[19] || "").trim();
            
            const isValidBacklog = (sub: string, score: string) => {
              if (!sub || sub === "0" || sub === "-" || sub === "/ /" || sub.toLowerCase() === "empty") return false;
              if (!score || score === "0" || score === "-" || score === "/ /" || score.toLowerCase() === "empty") return false;
              return true;
            };

            if (isValidBacklog(backlog1Subject, backlog1Score)) {
              backlogSubjects.push({ subject: backlog1Subject, scoreText: backlog1Score });
            }
            if (isValidBacklog(backlog2Subject, backlog2Score)) {
              backlogSubjects.push({ subject: backlog2Subject, scoreText: backlog2Score });
            }
            
            // المجاميع الكلية والتراكمية بدءاً من العمود 20
            const totalScore = String(row[20] || "").trim();
            const percentage = String(row[21] || "").trim();
            const gradeYear4 = String(row[22] || "").trim();
            const totalYear1 = String(row[23] || "").trim();
            const totalYear2 = String(row[24] || "").trim();
            const totalYear3 = String(row[25] || "").trim();
            const cumulativeTotal = String(row[26] || "").trim();
            const cumulativePercentage = String(row[27] || "").trim();
            const generalGrade = String(row[28] || "").trim();
            
            const addedDegrees = String(row[29] || "").trim();
            const socialDevelopment = String(row[30] || "").trim();
            const economicDevelopment = String(row[31] || "").trim();
            const communicationMeans = String(row[32] || "").trim();
            
            // حالة الطالب وتوصيات لجنة الكنترول
            const notes = String(row[33] || "").trim().replace("/ /", "").trim();
            const failedSubjects = String(row[34] || "").trim();
            const studentStatus = String(row[35] || "").trim();
            const studentOpportunities = String(row[36] || "").trim();
            
            results.push({
              seatNumber,
              fullName,
              academicYear: uploadAcademicYear,
              department: isAr ? "شعبة الخدمة الاجتماعية" : "Social Work Division",
              grades: subjectGrades,
              backlogSubjects,
              
              totalScore: totalScore && totalScore !== "0" ? totalScore : "",
              percentage: percentage && percentage !== "0" && percentage !== "0.00" ? percentage : "",
              gradeYear4,
              totalYear1: totalYear1 && totalYear1 !== "0" ? totalYear1 : "",
              totalYear2: totalYear2 && totalYear2 !== "0" ? totalYear2 : "",
              totalYear3: totalYear3 && totalYear3 !== "0" ? totalYear3 : "",
              cumulativeTotal,
              cumulativePercentage,
              generalGrade,
              socialDevelopment: socialDevelopment && socialDevelopment !== "0" ? socialDevelopment : "",
              economicDevelopment: economicDevelopment && economicDevelopment !== "0" ? economicDevelopment : "",
              communicationMeans: communicationMeans && communicationMeans !== "0" ? communicationMeans : "",
              addedDegrees: addedDegrees && addedDegrees !== "0" ? addedDegrees : "",
              carriedSubjects: "",
              
              notes,
              failedSubjects: failedSubjects && failedSubjects !== "0" && failedSubjects !== "/ /" ? failedSubjects : "",
              studentStatus,
              studentOpportunities,
              
              status: studentStatus || generalGrade || "",
              rank: cumulativeTotal ? `${cumulativeTotal}` : ""
            });
          }
        } else {
          // تحويل شيت الإكسل إلى مصفوفة كائنات JSON بالصيغة القديمة البسيطة
          const rawRows = XLSX.utils.sheet_to_json<any>(sheet);
          
          if (rawRows.length === 0) {
            throw new Error(isAr ? "الملف فارغ ولا يحتوي على أي صفوف." : "The Excel file is empty.");
          }
          
          for (const row of rawRows) {
            let seatNumber = "";
            let fullName = "";
            let status = "";
            
            const keys = Object.keys(row);
            if (keys.length === 0) continue;

            const seatKey = keys.find(k => 
              k.includes("جلوس") || 
              k.includes("seat") || 
              k.includes("الرقم") || 
              k.includes("رقم") ||
              k.toLowerCase() === "id"
            ) || keys[0];

            if (seatKey) {
              seatNumber = String(row[seatKey]).trim();
            }

            if (seatNumber.includes(".")) {
              seatNumber = seatNumber.split(".")[0];
            }

            if (!seatNumber || isNaN(Number(seatNumber))) continue;

            const matchedStudent = PRELOADED_STUDENTS.find(s => s.seatNumber === seatNumber);
            if (matchedStudent) {
              fullName = matchedStudent.fullName;
              status = matchedStudent.status;
            } else {
              const nameKey = keys.find(k => 
                k.includes("اسم") || 
                k.includes("name") || 
                k.includes("الكامل") ||
                k.includes("طالب")
              );
              if (nameKey && row[nameKey] !== undefined && row[nameKey] !== null) {
                fullName = String(row[nameKey]).trim();
              } else {
                fullName = "";
              }

              const statusKey = keys.find(k => 
                k.includes("حالة") || 
                k.includes("status") || 
                k.includes("الحالة")
              );
              if (statusKey && row[statusKey] !== undefined && row[statusKey] !== null) {
                status = String(row[statusKey]).trim();
              } else {
                status = "";
              }
            }

            const totalKey = keys.find(k => k.includes("مجموع") || k.includes("total") || k.includes("المجموع"));
            const pctKey = keys.find(k => k.includes("نسبة") || k.includes("percentage") || k.includes("%") || k.includes("النسبة"));
            const gradeKey = keys.find(k => k.includes("تقدير") || k.includes("grade") || k.includes("التقدير"));
            const rankKey = keys.find(k => k.includes("ترتيب") || k.includes("rank") || k.includes("الترتيب"));
            const notesKey = keys.find(k => k.includes("ملاحظات") || k.includes("notes") || k.includes("ملاحظة"));
            const serialKey = keys.find(k => k.toLowerCase() === "m" || k.includes("مسلسل") || k === "م" || k === "س");

            const excludedKeys = [
              seatKey,
              keys.find(k => k.includes("اسم") || k.includes("name") || k.includes("الكامل") || k.includes("طالب")),
              totalKey, pctKey, gradeKey, rankKey, notesKey, serialKey,
              keys.find(k => k.includes("حالة") || k.includes("status") || k.includes("الحالة")),
              "__rowNum__"
            ].filter(Boolean) as string[];

            const subjectKeys = keys.filter(k => 
              !excludedKeys.some(ek => ek.toLowerCase() === k.toLowerCase()) && 
              k.trim() !== ""
            );

            const subjectGrades = subjectKeys.map(subKey => {
              const rawVal = row[subKey];
              const valStr = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : "";
              return {
                subject: subKey.trim(),
                passingScore: 50,
                maxScore: 100,
                scoreText: valStr
              };
            });

            let totalScoreVal = 0;
            if (totalKey && row[totalKey] !== undefined) {
              totalScoreVal = Number(row[totalKey]) || 0;
            }
            
            let pctVal = 0;
            if (pctKey && row[pctKey] !== undefined) {
              let rawPct = Number(row[pctKey]) || 0;
              if (rawPct > 0 && rawPct < 1) {
                pctVal = Math.round(rawPct * 10000) / 100;
              } else {
                pctVal = rawPct;
              }
            }

            let generalGrade = "";
            if (gradeKey && row[gradeKey] !== undefined && row[gradeKey] !== null) {
              generalGrade = String(row[gradeKey]).trim();
            }

            let rankVal = "";
            if (rankKey && row[rankKey] !== undefined && row[rankKey] !== null) {
              rankVal = String(row[rankKey]).trim();
            }

            let notesVal = "";
            if (notesKey && row[notesKey] !== undefined && row[notesKey] !== null) {
              notesVal = String(row[notesKey]).trim();
            }

            results.push({
              seatNumber,
              fullName,
              academicYear: uploadAcademicYear,
              department: isAr ? "شعبة الخدمة الاجتماعية" : "Social Work Division",
              percentage: pctVal,
              totalScore: totalScoreVal,
              generalGrade: generalGrade,
              rank: rankVal,
              notes: notesVal,
              status: status || generalGrade || "",
              grades: subjectGrades
            });
          }
        }

        if (results.length === 0) {
          throw new Error(isAr ? "لم نتمكن من استخراج أي أرقام جلوس أو درجات صالحة من الملف." : "No valid student seat numbers or grades extracted from the file.");
        }

        setParsedGrades(results);
      } catch (err: any) {
        console.error("Excel parse error:", err);
        setExcelImportError(err.message || (isAr ? "حدث خطأ أثناء تحليل ملف Excel. يرجى التحقق من صياغة الملف." : "Failed to parse Excel file. Please verify file format."));
      } finally {
        setIsParsingExcel(false);
      }
    };

    reader.onerror = () => {
      setExcelImportError(isAr ? "فشلت قراءة الملف." : "Failed to read file.");
      setIsParsingExcel(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // معالجة تخزين درجات إكسل في Firestore
  const handleSaveExcelGrades = async () => {
    if (parsedGrades.length === 0) return;

    setIsSavingExcelGrades(true);
    setExcelGradesProgress(0);
    setExcelGradesCurrent(0);
    setExcelGradesTotal(parsedGrades.length);
    setExcelImportError(null);
    setExcelImportSuccess(false);

    try {
      let count = 0;
      let batch = writeBatch(db);

      for (let i = 0; i < parsedGrades.length; i++) {
        const studentResult = parsedGrades[i];
        const docId = `seat_${studentResult.seatNumber}`;
        const docRef = doc(db, "student_results_by_seat", docId);

        batch.set(docRef, studentResult);
        count++;

        // التخزين على دفعات مكونة من 40 وثيقة لضمان أداء مستقر ومقيد بالـ UI
        if (count % 40 === 0 || i === parsedGrades.length - 1) {
          await batch.commit();
          batch = writeBatch(db);
          setExcelGradesCurrent(i + 1);
          setExcelGradesProgress(Math.round(((i + 1) / parsedGrades.length) * 100));
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      setExcelImportedCount(parsedGrades.length);
      setExcelImportSuccess(true);
      setExcelFile(null);
      setParsedGrades([]);
    } catch (err: any) {
      console.error("Failed to save excel grades:", err);
      setExcelImportError(isAr ? `فشل تخزين الدرجات في Firestore: ${err.message}` : `Failed to save grades in Firestore: ${err.message}`);
    } finally {
      setIsSavingExcelGrades(false);
    }
  };

  // جلب كافة البيانات في لوحة الإدارة
  const fetchAdminData = async () => {
    if (!isUnlocked) return;
    setLoading(true);

    // افتراض إحصائيات افتراضية أولاً وتحديثها تدريجياً
    let stats = { today: 120, month: 450, total: 3100, activeNow: 4 };

    // جلب الإحصائيات المخزنة محلياً كاحتياط
    const cachedStats = localStorage.getItem("aswan_inst_last_known_stats");
    if (cachedStats) {
      try {
        const parsed = JSON.parse(cachedStats);
        stats.today = parsed.today || stats.today;
        stats.month = parsed.month || stats.month;
        stats.total = parsed.total || stats.total;
      } catch (e) {}
    }

    // 1. جلب إحصائيات الزوار من Firestore
    try {
      const visitorDocRef = doc(db, "visitor_stats", "global");
      const visitorSnap = await getDoc(visitorDocRef);
      if (visitorSnap.exists()) {
        const data = visitorSnap.data();
        stats.today = data.today || 0;
        stats.month = data.month || 0;
        stats.total = data.total || 0;

        // تحديث التخزين المحلي الاحتياطي
        localStorage.setItem("aswan_inst_last_known_stats", JSON.stringify({
          today: stats.today,
          month: stats.month,
          total: stats.total
        }));
      }
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn("Error loading visitor stats in admin (Quota Exceeded):", err);
      } else {
        console.error("Error loading visitor stats in admin:", err);
      }
      // لا نقطع العملية هنا لحماية اللوحة من الانهيار عند نفاد الحصة (Quota Exceeded)
    }
    
    // جلب عدد الجلسات النشطة حاليا
    try {
      const sessionSnap = await getDocs(collection(db, "active_sessions"));
      stats.activeNow = sessionSnap.size > 0 ? sessionSnap.size : stats.activeNow;
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn("Error loading active sessions in admin (Quota Exceeded):", err);
      } else {
        console.error("Error loading active sessions in admin:", err);
      }
    }
    setLiveStats(stats);

    // 2. جلب طلبات الالتحاق والتقديم
    try {
      const appsQuery = query(collection(db, "admission_applications"), orderBy("createdAt", "desc"));
      const appsSnap = await getDocs(appsQuery);
      const appsList: Application[] = [];
      appsSnap.forEach((d) => {
        const dData = d.data();
        appsList.push({
          id: d.id,
          appId: dData.appId,
          fullName: dData.fullName,
          phone: dData.phone,
          highSchoolGrad: dData.highSchoolGrad,
          nationalId: dData.nationalId,
          notes: dData.notes || "",
          status: dData.status,
          address: dData.address || "",
          receiptCode: dData.receiptCode || "",
          paymentCycle: dData.paymentCycle || "annual",
          academicEmail: dData.academicEmail || "",
          academicPassword: dData.academicPassword || "",
          generatedStudentId: dData.generatedStudentId || "",
          createdAt: dData.createdAt
        });
      });
      setApplications(appsList);
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn("Error loading admission applications in admin (Quota Exceeded):", err);
      } else {
        console.error("Error loading admission applications in admin:", err);
      }
      handleFirestoreError(err, OperationType.GET, "admission_applications");
    }

    // 3. جلب الأخبار المخصصة المضافة
    try {
      const newsQuery = query(collection(db, "news_articles"), orderBy("createdAt", "desc"));
      const newsSnap = await getDocs(newsQuery);
      const newsList: NewsItem[] = [];
      newsSnap.forEach((d) => {
        if (d.id === "_seed_flag") return; // Skip seed flag
        const dData = d.data();
        const title = isAr ? (dData.title_ar || dData.title) : (dData.title_en || dData.title);
        const summary = isAr ? (dData.summary_ar || dData.summary) : (dData.summary_en || dData.summary);
        const content = isAr ? (dData.content_ar || dData.content) : (dData.content_en || dData.content);

        newsList.push({
          id: d.id,
          title: title || "",
          summary: summary || "",
          content: content || "",
          category: dData.category,
          date: dData.date,
          image: dData.image,
          views: dData.views || 0
        });
      });
      setNews(newsList);
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn("Error loading news in admin (Quota Exceeded):", err);
      } else {
        console.error("Error loading news in admin:", err);
      }
      handleFirestoreError(err, OperationType.GET, "news_articles");
    }

    // 4. جلب جداول الامتحانات المخصصة
    try {
      const schedQuery = query(collection(db, "exam_schedules"), orderBy("createdAt", "desc"));
      const schedSnap = await getDocs(schedQuery);
      const schedList: ScheduleItem[] = [];
      schedSnap.forEach((d) => {
        const dData = d.data();
        schedList.push({
          id: d.id,
          academicYear: dData.academicYear,
          subject: dData.subject,
          date: dData.date,
          time: dData.time,
          hall: dData.hall
        });
      });
      setSchedules(schedList);
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn("Error loading schedules in admin (Quota Exceeded):", err);
      } else {
        console.error("Error loading schedules in admin:", err);
      }
      handleFirestoreError(err, OperationType.GET, "exam_schedules");
    }

    // 5. جلب الطلاب المسجلين بالكامل للرقابة والمتابعة من الأدمن
    try {
      const studentsSnap = await getDocs(query(collection(db, "user_profiles"), where("role", "==", "student")));
      const studsList: any[] = [];
      studentsSnap.forEach((doc) => {
        studsList.push({ id: doc.id, ...doc.data() });
      });
      setAdminStudents(studsList);
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn("Error loading user profiles in admin (Quota Exceeded):", err);
      } else {
        console.error("Error loading user profiles in admin:", err);
      }
      handleFirestoreError(err, OperationType.GET, "user_profiles");
    }

    // 6. جلب مصروفات وحالات دفع الطلاب لمراقبة المدفوعات والرسوم
    try {
      const paySnap = await getDocs(collection(db, "student_payments"));
      const payList: any[] = [];
      paySnap.forEach((doc) => {
        payList.push({ id: doc.id, ...doc.data() });
      });
      setAdminPayments(payList);
    } catch (err) {
      if (isQuotaError(err)) {
        console.warn("Error loading payments in admin (Quota Exceeded):", err);
      } else {
        console.error("Error loading payments in admin:", err);
      }
      handleFirestoreError(err, OperationType.GET, "student_payments");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, [isUnlocked]);

  // إدارة طلبات الالتحاق: قبول / رفض / حذف
  const updateApplicationStatus = async (appDocId: string, newStatus: "approved" | "rejected") => {
    try {
      const docRef = doc(db, "admission_applications", appDocId);
      
      if (newStatus === "approved") {
        const appSnap = await getDoc(docRef);
        if (appSnap.exists()) {
          const appData = appSnap.data();
          
          // Generate student credentials
          const studentIdNum = Math.floor(1000 + Math.random() * 9000);
          const studentId = `ST-2026-${studentIdNum}`;
          const academicEmail = `std.2026.${studentIdNum}@aswan.edu`;
          // كلمة مرور عشوائية لكل طالب بدلاً من كلمة مرور واحدة مشتركة للجميع
          const academicPassword = Math.random().toString(36).slice(-6) + Math.floor(Math.random() * 90 + 10);
          const simulatedUid = "std_" + Math.random().toString(36).substr(2, 9);
          
          // Check if profile already exists for this nationalId
          const profileQuery = query(collection(db, "user_profiles"), where("nationalId", "==", appData.nationalId));
          const profileSnap = await getDocs(profileQuery);
          
          if (profileSnap.empty) {
            // Create user profile in Firestore user_profiles
            await setDoc(doc(db, "user_profiles", simulatedUid), {
              uid: simulatedUid,
              fullName: appData.fullName,
              email: academicEmail,
              role: "student",
              academicYear: "الفرقة الأولى",
              department: "شعبة الخدمة الاجتماعية",
              studentId: studentId,
              nationalId: appData.nationalId,
              phone: appData.phone,
              address: appData.address || "",
              highSchoolGrad: appData.highSchoolGrad,
              tempPass: academicPassword,
              createdAt: new Date().toISOString()
            });

            // Create default student payments in student_payments
            // 1. Tuition Fees (مصروفات دراسية)
            await addDoc(collection(db, "student_payments"), {
              userId: simulatedUid,
              titleAr: "المصروفات الدراسية السنوية - الفرقة الأولى",
              titleEn: "Annual Tuition Fees - 1st Year",
              amount: 1850,
              paid: false,
              dueDate: "2026-06-30",
              paidDate: "",
              createdAt: new Date().toISOString()
            });

            // 2. Student Card and Activities Fees (كارنيه المعهد والأنشطة)
            await addDoc(collection(db, "student_payments"), {
              userId: simulatedUid,
              titleAr: "رسوم الكارنيه والأنشطة الطلابية",
              titleEn: "Student Card & Activities Fee",
              amount: 150,
              paid: false,
              dueDate: "2026-06-30",
              paidDate: "",
              createdAt: new Date().toISOString()
            });
          }

          // Update application with the status and credentials
          await updateDoc(docRef, { 
            status: "approved",
            academicEmail: academicEmail,
            academicPassword: academicPassword,
            generatedStudentId: studentId
          });

          alert(isAr 
            ? `تم قبول الطالب بنجاح وتوليد حسابه الأكاديمي!\nالحساب الأكاديمي: ${academicEmail}\nكلمة المرور: ${academicPassword}\nكود الطالب: ${studentId}` 
            : `Student approved and academic account generated!\nEmail: ${academicEmail}\nPassword: ${academicPassword}\nStudent ID: ${studentId}`
          );
        }
      } else {
        await updateDoc(docRef, { status: newStatus });
      }
      
      // تحديث الحالة محلياً فورياً للسرعة والراحة
      setApplications(prev => prev.map(app => app.id === appDocId ? { ...app, status: newStatus } : app));
      fetchAdminData();
    } catch (err) {
      alert(isAr ? "حدث خطأ أثناء تحديث حالة الطلب!" : "Error updating request status.");
      handleFirestoreError(err, OperationType.UPDATE, `admission_applications/${appDocId}`);
    }
  };

  const deleteApplication = async (appDocId: string) => {
    if (!window.confirm(isAr ? "هل أنت متأكد من حذف هذا الطلب نهائياً من النظام؟" : "Are you sure you want to delete this application?")) return;
    try {
      await deleteDoc(doc(db, "admission_applications", appDocId));
      setApplications(prev => prev.filter(app => app.id !== appDocId));
    } catch (err) {
      alert("Error deleting application.");
      handleFirestoreError(err, OperationType.DELETE, `admission_applications/${appDocId}`);
    }
  };

  // نشر أو تعديل مقال/خبر في قاعدة البيانات
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.summary || !newsForm.content) {
      alert(isAr ? "يرجى تعبئة كافة حقول الخبر الأساسية." : "Please fill in all core fields.");
      return;
    }

    try {
      if (editingNewsId) {
        // تحديث الخبر الحالي
        await updateDoc(doc(db, "news_articles", editingNewsId), {
          ...newsForm,
          // تصفير أو تحديث اللغات للحقول المعدلة لضمان ظهور التحديث في الواجهتين
          title_ar: newsForm.title,
          title_en: newsForm.title,
          summary_ar: newsForm.summary,
          summary_en: newsForm.summary,
          content_ar: newsForm.content,
          content_en: newsForm.content,
          updatedAt: new Date().toISOString()
        });
        setNewsSuccess(true);
        setEditingNewsId(null);
      } else {
        // إضافة خبر جديد
        await addDoc(collection(db, "news_articles"), {
          ...newsForm,
          views: Math.floor(100 + Math.random() * 400), // مشاهدات عشوائية للواقعية
          createdAt: new Date().toISOString()
        });
        setNewsSuccess(true);
      }

      setNewsForm({
        title: "",
        summary: "",
        content: "",
        category: "أخبار",
        image: "",
        date: new Date().toISOString().split("T")[0]
      });
      fetchAdminData(); // إعادة التحميل

      setTimeout(() => setNewsSuccess(false), 4000);
    } catch (err) {
      alert(editingNewsId ? "Error updating news article." : "Error saving news article.");
      handleFirestoreError(
        err, 
        editingNewsId ? OperationType.UPDATE : OperationType.CREATE, 
        editingNewsId ? `news_articles/${editingNewsId}` : "news_articles"
      );
    }
  };

  const deleteNewsItem = async (newsId: string) => {
    if (!window.confirm(isAr ? "هل تود حذف هذا الخبر المنشور نهائياً؟" : "Delete this article?")) return;
    try {
      await deleteDoc(doc(db, "news_articles", newsId));
      setNews(prev => prev.filter(item => item.id !== newsId));
    } catch (err) {
      alert("Error deleting news.");
      handleFirestoreError(err, OperationType.DELETE, `news_articles/${newsId}`);
    }
  };

  // إضافة جدول امتحان جديد
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.subject || !scheduleForm.time) {
      alert(isAr ? "يرجى كتابة اسم المادة الدراسية وفترة الاختبار." : "Fill subject & exam time.");
      return;
    }

    try {
      await addDoc(collection(db, "exam_schedules"), {
        ...scheduleForm,
        createdAt: new Date().toISOString()
      });

      setScheduleSuccess(true);
      setScheduleForm({
        academicYear: "الفرقة الأولى",
        subject: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00 - 11:00",
        hall: "مدرج أ - الطابق الأول"
      });
      fetchAdminData(); // إعادة التحميل

      setTimeout(() => setScheduleSuccess(false), 4000);
    } catch (err) {
      alert("Error adding exam schedule.");
      handleFirestoreError(err, OperationType.CREATE, "exam_schedules");
    }
  };

  const deleteScheduleItem = async (schedId: string) => {
    if (!window.confirm(isAr ? "هل أنت متأكد من إلغاء وحذف جدول مادة الامتحان هذه؟" : "Delete this exam schedule?")) return;
    try {
      await deleteDoc(doc(db, "exam_schedules", schedId));
      setSchedules(prev => prev.filter(item => item.id !== schedId));
    } catch (err) {
      alert("Error deleting schedule.");
      handleFirestoreError(err, OperationType.DELETE, `exam_schedules/${schedId}`);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("aswan_admin_unlocked");
    setIsUnlocked(false);
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // -------------------------------------------------------------
  // شاشة تسجيل الدخول المقفلة للأدمن
  // -------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-16 text-right" dir={isAr ? "rtl" : "ltr"}>
        <div className="bg-white rounded-3xl p-6 sm:p-10 w-full max-w-md shadow-2xl border border-slate-800 space-y-8 animate-in zoom-in-95 duration-200">
          
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow border border-red-100">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{isAr ? "لوحة الإدارة الأكاديمية المقفلة 🔐" : "Academic Control Panel Locked 🔐"}</h2>
            <p className="text-xs text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">
              {isAr 
                ? "هذه الصفحة مخصصة لعمادة المعهد ومسؤولي العلاقات العامة لتحديث جداول الامتحانات والطلبات والأخبار." 
                : "This section is restricted for administrative staff to publish events, schedules, and monitor admissions."}
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-3 text-right">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "البريد الإلكتروني للأدمن:" : "Admin Email:"}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aswan.edu"
                  className="w-full text-right p-3 rounded-xl border border-gray-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "كلمة المرور:" : "Password:"}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-right p-3 rounded-xl border border-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-100 text-red-900 text-xs font-bold rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow active:scale-95 cursor-pointer"
            >
              {isAr ? "دخول إلى لوحة التحكم" : "Log In to Dashboard"}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // لوحة الإدارة الكاملة بعد فك القفل
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 mr-0 ml-0 flex flex-col md:flex-row text-right" dir={isAr ? "rtl" : "ltr"}>
      
      {/* القائمة الجانبية للوحة التحكم */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 p-6 flex flex-col justify-between border-l border-slate-800">
        <div className="space-y-8">
          
          {/* ترويسة اللوحة */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl text-yellow-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-black text-yellow-400">{isAr ? "لوحة الإدارة الذكية" : "Smart Management"}</span>
              <span className="block text-[10px] font-bold text-slate-400">ASWAN HIGHER INST.</span>
            </div>
          </div>

          {/* روابط التبويبات الفنية */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === "analytics" ? "bg-primary text-white" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-accent" />
              <span>{isAr ? "تحليلات وإحصائيات الزوار" : "Visitor Analytics"}</span>
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === "applications" ? "bg-primary text-white" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-accent" />
              <span>{isAr ? "طلبات الالتحاق والتقديم" : "Admissions & Intake"}</span>
              {applications.filter(a => a.status === "pending").length > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center mr-auto">
                  {applications.filter(a => a.status === "pending").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("news")}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === "news" ? "bg-primary text-white" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Newspaper className="w-4 h-4 text-accent" />
              <span>{isAr ? "إدارة الأخبار والفعاليات" : "News & Events Manager"}</span>
            </button>

            <button
              onClick={() => setActiveTab("exams")}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === "exams" ? "bg-primary text-white" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4 h-4 text-accent" />
              <span>{isAr ? "إدارة جداول الامتحانات" : "Exam Schedule Planner"}</span>
            </button>

            <button
              onClick={() => setActiveTab("students")}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-black flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === "students" ? "bg-primary text-white" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4 text-accent" />
              <span>{isAr ? "شؤون الطلاب وحالة المصروفات" : "Enrolled Students & Tuition"}</span>
              {adminStudents.length > 0 && (
                <span className="bg-teal-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center mr-auto">
                  {adminStudents.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* زر الخروج وقفل الجلسة */}
        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full text-center bg-red-600 hover:bg-red-700 text-white text-xs font-black py-2.5 rounded-xl cursor-pointer transition-all"
          >
            {isAr ? "قفل لوحة التحكم والخروج" : "Logout & Lock Board"}
          </button>
        </div>
      </aside>

      {/* منطقة عرض المحتوى الأيمن */}
      <main className="flex-grow p-6 sm:p-8 space-y-8 overflow-y-auto max-h-screen">
        
        {/* شريط الإدارة العلوي السريع */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150/70 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {activeTab === "analytics" && (isAr ? "📊 تحليلات حركة الزوار والنشاط" : "📊 Traffic Analytics")}
              {activeTab === "applications" && (isAr ? "🎓 فرز وفحص طلبات الالتحاق بالمعهد" : "🎓 Manage Admission Applications")}
              {activeTab === "news" && (isAr ? "📰 نشر الأخبار والفعاليات والقرارات" : "📰 Manage News & Releases")}
              {activeTab === "exams" && (isAr ? "📝 صياغة جداول الامتحانات ومواقع القاعات" : "📝 Schedule Examination Dates")}
              {activeTab === "students" && (isAr ? "👥 إدارة شؤون الطلاب وحالة المصروفات" : "👥 Students & Tuition Board")}
            </h1>
            <p className="text-xs text-slate-400 font-bold mt-1"> Higher Institute for Social Work, Aswan — 2026 </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchAdminData}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-slate-200/50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? "تحديث البيانات" : "Refresh"}</span>
            </button>

            {activeTab !== "analytics" && (
              <button
                onClick={handleExportTabCSV}
                className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-teal-200/50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? "تصدير الجدول (CSV)" : "Export CSV"}</span>
              </button>
            )}

            <button
              onClick={handleExportBackup}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-indigo-200/50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? "نسخة احتياطية كاملة (JSON)" : "Backup DB (JSON)"}</span>
            </button>
          </div>
        </div>

        {/* 1. التبويب الأول: التحليلات والإحصائيات */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* كروت الإحصائيات الأربعة الساطعة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black opacity-90">{isAr ? "نشط الآن بالموقع" : "Active Users Now"}</span>
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-3xl font-mono font-black">{liveStats.activeNow}</span>
                  <span className="text-[10px] opacity-75">{isAr ? "جلسات نشطة ومراقبة في الوقت الفعلي" : "Real-time sessions tracking"}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black opacity-90">{isAr ? "زيارات اليوم الفريدة" : "Page Visits Today"}</span>
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-3xl font-mono font-black">{liveStats.today}</span>
                  <span className="text-[10px] opacity-75">{isAr ? "مقارنة بمتوسط 110 زيارات يومياً" : "Daily target reached"}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black opacity-90">{isAr ? "طلبات تقديم القبول الكلية" : "Total Applications"}</span>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-3xl font-mono font-black">{applications.length}</span>
                  <span className="text-[10px] opacity-75">{isAr ? `${applications.filter(a => a.status === "pending").length} طلبات قيد المراجعة والانتظار` : "Total student registries"}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black opacity-90">{isAr ? "جداول الامتحانات والأخبار" : "Custom News & Exams"}</span>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-3xl font-mono font-black">{news.length + schedules.length}</span>
                  <span className="text-[10px] opacity-75">{isAr ? `${news.length} أخبار مخصصة • ${schedules.length} جداول امتحانات` : "Custom records added"}</span>
                </div>
              </div>

            </div>

            {/* تفاصيل حركة الزوار الأسبوعية والقرارات التحريرية */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150/70 shadow-xs space-y-4 text-right">
              <h3 className="font-extrabold text-sm text-slate-800 border-r-4 border-primary pr-2.5">{isAr ? "إدارة التنمية المستدامة والتحول الرقمي:" : "Digitalization Summary:"}</h3>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                {isAr 
                  ? "تسعى إدارة تكنولوجيا المعلومات بمعهد أسوان إلى تعبيد كافة قنوات الاتصال للطلاب الجدد. بفضل التحول الرقمي المبتدئ، يستطيع الطلاب حالياً التقديم إلكترونياً وتوفر المنظومة لوحة مراقبة لمسؤولي رعاية الشباب لفحص الطلبات والرد السريع عليها دون تعقيد." 
                  : "Aswan IT office is committed to easing communication channels for freshmen. With these digital integrations, students can register online while youth welfare officers examine requests in real-time."}
              </p>
            </div>
          </div>
        )}

        {/* 2. التبويب الثاني: فحص طلبات الالتحاق والتقديم */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            
            {applications.length > 0 ? (
              <div className="bg-white rounded-3xl border border-gray-150/70 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-[11px] font-black text-slate-700 border-b border-gray-200">
                      <tr>
                        <th className="p-3 md:p-4 text-right">{isAr ? "بيانات الطالب" : "Student Details"}</th>
                        <th className="p-3 md:p-4 text-center">{isAr ? "الرقم القومي" : "National ID"}</th>
                        <th className="p-3 md:p-4 text-center">{isAr ? "العنوان بالتفصيل" : "Address"}</th>
                        <th className="p-3 md:p-4 text-center">{isAr ? "مجموع الثانوية" : "High School %"}</th>
                        <th className="p-3 md:p-4 text-center">{isAr ? "إثبات الدفع السنوي" : "Annual Fee Code"}</th>
                        <th className="p-3 md:p-4 text-center">{isAr ? "حالة الطلب" : "Status"}</th>
                        <th className="p-3 md:p-4 text-left">{isAr ? "إجراءات إدارية" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b last:border-none hover:bg-slate-50 transition-colors font-bold">
                          
                          {/* الاسم والهاتف */}
                          <td className="p-3 md:p-4 text-right">
                            <span className="block font-black text-slate-900">{app.fullName}</span>
                            <span className="block text-[11px] text-slate-400 font-mono mt-0.5" dir="ltr">{app.phone}</span>
                            {app.notes && <span className="block text-[10px] text-amber-600 font-semibold mt-1 leading-normal max-w-xs">{isAr ? "الرغبات/ملاحظات:" : "Pref:"} {app.notes}</span>}
                          </td>

                          {/* الرقم القومي */}
                          <td className="p-3 md:p-4 text-center font-mono text-xs text-slate-500">{app.nationalId}</td>

                          {/* العنوان بالتفصيل */}
                          <td className="p-3 md:p-4 text-center text-xs text-slate-600 max-w-[160px] truncate" title={app.address}>
                            {app.address || (isAr ? "غير محدد" : "N/A")}
                          </td>

                          {/* المجموع */}
                          <td className="p-3 md:p-4 text-center text-primary font-mono font-black">{app.highSchoolGrad}</td>

                          {/* الكود المالي السنوي */}
                          <td className="p-3 md:p-4 text-center">
                            <span className="inline-flex flex-col items-center">
                              <span className="font-mono text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                                {app.receiptCode || (isAr ? "بدون كود" : "No Code")}
                              </span>
                              <span className="text-[9px] text-emerald-500 font-black mt-0.5 uppercase">
                                {isAr ? "دفع سنوي 🔄" : "Annual Fee 🔄"}
                              </span>
                            </span>
                          </td>

                          {/* الحالة */}
                          <td className="p-3 md:p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                app.status === "approved" 
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                  : app.status === "rejected"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}>
                                {app.status === "approved" && (isAr ? "مقبول مبدئياً" : "Approved")}
                                {app.status === "rejected" && (isAr ? "مرفوض" : "Rejected")}
                                {app.status === "pending" && (isAr ? "قيد المراجعة" : "Pending")}
                              </span>
                              <span className="block text-[9px] text-slate-400 font-mono">{app.appId}</span>
                              
                              {app.status === "approved" && app.academicEmail && (
                                <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-right font-sans font-medium space-y-1 text-slate-700 max-w-[190px] shadow-xs">
                                  <p className="truncate"><span className="font-bold text-indigo-600">{isAr ? "الحساب:" : "Email:"}</span> <span className="font-mono font-bold select-all text-slate-900">{app.academicEmail}</span></p>
                                  <p><span className="font-bold text-emerald-600">{isAr ? "الرمز السري:" : "Pass:"}</span> <span className="font-mono font-bold select-all text-slate-900">{app.academicPassword || "aswan123456"}</span></p>
                                  <p className="truncate"><span className="font-bold text-purple-600">{isAr ? "كود الطالب:" : "ID:"}</span> <span className="font-mono font-bold select-all text-slate-900">{app.generatedStudentId}</span></p>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* الإجراءات */}
                          <td className="p-3 md:p-4 text-left">
                            <div className="inline-flex gap-1.5 items-center justify-end">
                              {app.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateApplicationStatus(app.id, "approved")}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                                    title={isAr ? "قبول مبدئي للالتحاق" : "Approve Application"}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => updateApplicationStatus(app.id, "rejected")}
                                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                                    title={isAr ? "رفض الطلب" : "Reject Application"}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteApplication(app.id)}
                                className="bg-slate-100 hover:bg-slate-200 text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title={isAr ? "حذف نهائي" : "Delete Record"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 space-y-4 shadow-sm">
                <span className="text-4xl">🎓</span>
                <h5 className="font-bold text-slate-700 text-sm">{isAr ? "لا توجد طلبات تقديم جديدة" : "No admissions requests found"}</h5>
                <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto">
                  {isAr 
                    ? "بمجرد قيام الطلاب بملء استمارات التقديم في بوابة الطالب، ستظهر جميع الطلبات والبيانات هنا للمراجعة الفورية." 
                    : "Once prospective students complete the Admissions Form in the Student Portal, requests will appear here."}
                </p>
              </div>
            )}

          </div>
        )}

        {/* 3. التبويب الثالث: إدارة الأخبار والفعاليات */}
        {activeTab === "news" && (
          <div className="space-y-8">
            
            {/* فورم إضافة خبر جديد */}
            <div id="news-form-container" className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150/70 shadow-sm space-y-6">
              <h3 className="font-black text-slate-900 border-r-4 border-accent pr-2.5 text-base sm:text-lg">
                {editingNewsId 
                  ? (isAr ? "تعديل الخبر أو الفعالية المنشورة ✏️" : "Edit News or Event ✏️")
                  : (isAr ? "نشر وتدوين خبر أو فعالية جديدة بالمعهد ➕" : "Publish News or Event ➕")}
              </h3>
              
              {newsSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{isAr ? "تم حفظ المقال الإخباري بنجاح في قاعدة البيانات!" : "News article successfully saved to the system!"}</span>
                </div>
              )}

              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "عنوان الخبر الرئيسي:" : "Article Title:"}</label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      placeholder={isAr ? "عنوان مميز وجاذب للطلاب..." : "Enter catchy title..."}
                      className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "تصنيف الخبر (Category):" : "Category:"}</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                      className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-800"
                    >
                      <option value="أخبار">{isAr ? "أخبار" : "News"}</option>
                      <option value="إعلانات">{isAr ? "إعلانات" : "Announcements"}</option>
                      <option value="فعاليات">{isAr ? "فعاليات" : "Events"}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 border border-slate-100 p-4 rounded-2xl bg-slate-50">
                    <label className="block text-xs font-black text-slate-800">
                      {isAr ? "صورة غلاف الخبر 🖼️" : "Cover Image 🖼️"}
                    </label>
                    
                    {newsForm.image ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white h-32 flex items-center justify-center group">
                        <img 
                          src={newsForm.image} 
                          alt="Cover Preview" 
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewsForm(prev => ({ ...prev, image: "" }))}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition-transform duration-200 hover:scale-110"
                          title={isAr ? "إزالة الصورة" : "Remove Image"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors duration-200 ${
                          isDragging ? "border-primary bg-primary/5" : "border-slate-300 bg-white hover:border-primary"
                        }`}
                        onClick={() => document.getElementById("news-image-upload")?.click()}
                      >
                        <Upload className="w-8 h-8 text-slate-400 mb-1" />
                        <p className="text-xs font-bold text-slate-700">
                          {isAr ? "اسحب وأسقط الصورة هنا أو اضغط للاختيار" : "Drag & drop image here, or click to browse"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isAr ? "يدعم JPG، PNG (الحد الأقصى 5 ميجا)" : "Supports JPG, PNG (Max 5MB)"}
                        </p>
                        <input
                          id="news-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500">{isAr ? "أو أدخل رابط صورة مباشر:" : "Or enter direct image URL:"}</span>
                      </div>
                      <input
                        type="url"
                        value={newsForm.image.startsWith("data:") ? "" : newsForm.image}
                        onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full text-left p-2 rounded-lg border border-gray-200 text-xs font-semibold mt-1 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "تاريخ النشر:" : "Publish Date:"}</label>
                    <input
                      type="date"
                      required
                      value={newsForm.date}
                      onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                      className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "ملخص الخبر القصير (Short Summary):" : "Short Summary:"}</label>
                  <input
                    type="text"
                    required
                    value={newsForm.summary}
                    onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                    placeholder={isAr ? "اكتب خلاصة في سطرين لغلاف الخبر..." : "Enter brief summary..."}
                    className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "تفاصيل الخبر الكاملة (Full Content):" : "Full Content:"}</label>
                  <textarea
                    rows={4}
                    required
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    placeholder={isAr ? "اكتب تفاصيل الإعلان أو البيان الرسمي بالكامل هنا للتوضيح..." : "Write full details of the article here..."}
                    className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-slate-900 text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                  >
                    {editingNewsId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>
                      {editingNewsId 
                        ? (isAr ? "حفظ التعديلات الآن" : "Save Changes Now") 
                        : (isAr ? "نشر وتوثيق الخبر الآن" : "Publish Article Now")}
                    </span>
                  </button>

                  {editingNewsId && (
                    <button
                      type="button"
                      onClick={cancelEditNews}
                      className="bg-slate-150 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      {isAr ? "إلغاء التعديل" : "Cancel Edit"}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* قائمة الأخبار المضافة مع إمكانية الحذف */}
            <div className="bg-white rounded-3xl p-6 border border-gray-150/70 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 border-r-4 border-primary pr-2.5 text-base">{isAr ? "إدارة وتعديل الأخبار المنشورة بالموقع" : "Manage Published Articles"}</h3>
              
              {news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {news.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl border border-gray-100 bg-slate-50 flex justify-between items-start gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {item.date}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 font-bold line-clamp-2 leading-relaxed">{item.summary}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEditNews(item)}
                          className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-xl transition-all cursor-pointer shadow-xs border border-primary/20"
                          title={isAr ? "تعديل الخبر" : "Edit Article"}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteNewsItem(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all cursor-pointer shadow-xs border border-red-100"
                          title={isAr ? "حذف الخبر" : "Delete Article"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-semibold text-center py-6">{isAr ? "لا توجد أخبار مخصصة في قاعدة البيانات حالياً (الموقع يقرأ الأخبار الافتراضية للجامعة)." : "No custom articles in Firestore. Default academic articles are loaded."}</p>
              )}
            </div>

          </div>
        )}

        {/* 4. التبويب الرابع: إدارة جداول الامتحانات */}
        {activeTab === "exams" && (
          <div className="space-y-8">
            
            {/* فورم إضافة مادة لجدول الامتحانات */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150/70 shadow-sm space-y-6">
              <h3 className="font-black text-slate-900 border-r-4 border-emerald-700 pr-2.5 text-base sm:text-lg">{isAr ? "إضافة مادة دراسية لجدول الامتحانات ➕" : "Schedule New Exam Subject ➕"}</h3>
              
              {scheduleSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{isAr ? "تم إدراج مادة الامتحان بنجاح وهي معلنة حالياً على جداول الطلاب!" : "Exam successfully scheduled!"}</span>
                </div>
              )}

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "الفرقة الدراسية الموجه لها الاختبار:" : "Academic Year / Level:"}</label>
                    <select
                      value={scheduleForm.academicYear}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, academicYear: e.target.value })}
                      className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-800"
                    >
                      <option value="الفرقة الأولى">{isAr ? "الفرقة الأولى" : "1st Year (Freshman)"}</option>
                      <option value="الفرقة الثانية">{isAr ? "الفرقة الثانية" : "2nd Year (Sophomore)"}</option>
                      <option value="الفرقة الثالثة">{isAr ? "الفرقة الثالثة" : "3rd Year (Junior)"}</option>
                      <option value="الفرقة الرابعة">{isAr ? "الفرقة الرابعة (بكالوريوس)" : "4th Year (Senior)"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "اسم المادة الدراسية (Subject):" : "Course / Subject:"}</label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.subject}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                      placeholder={isAr ? "نموذج: التخطيط الاجتماعي بأسوان..." : "e.g., Social Planning..."}
                      className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "تاريخ الامتحان:" : "Exam Date:"}</label>
                    <input
                      type="date"
                      required
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                      className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "الفترة الزمنية (Time):" : "Time/Period:"}</label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      placeholder="09:00 - 11:00"
                      className="w-full text-center p-2.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">{isAr ? "قاعة وموقع اللجان (Hall):" : "Exam Hall Location:"}</label>
                    <input
                      type="text"
                      required
                      value={scheduleForm.hall}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, hall: e.target.value })}
                      placeholder={isAr ? "نموذج: مدرج أ - الطابق الأول" : "e.g., Hall A"}
                      className="w-full text-right p-2.5 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? "إعلان مادة الامتحان الآن" : "Publish Exam Date"}</span>
                </button>
              </form>
            </div>

            {/* جداول الامتحانات المخصصة */}
            <div className="bg-white rounded-3xl p-6 border border-gray-150/70 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 border-r-4 border-emerald-700 pr-2.5 text-base">{isAr ? "الجداول الامتحانية واللجان المضافة" : "Review Scheduled Exams"}</h3>
              
              {schedules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl border border-gray-100 bg-slate-50 flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                          {item.academicYear}
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{item.subject}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          📅 {item.date} • ⏱️ {item.time} • 📍 {item.hall}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteScheduleItem(item.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all cursor-pointer shadow-xs border border-red-100 shrink-0"
                        title={isAr ? "إلغاء مادة الامتحان" : "Delete Exam Schedule"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-semibold text-center py-6">{isAr ? "لا توجد جداول امتحانات معلنة مخصصة حالياً (يتم عرض المواعيد الافتراضية للطلاب)." : "No custom exam schedules found. Default academic schedules are displayed."}</p>
              )}
            </div>

          </div>
        )}

        {/* 5. التبويب الخامس: إدارة الطلاب والرسوم المالية */}
        {activeTab === "students" && (
          <div className="space-y-6">
            
            {/* أداة الرفع الجماعي الذكي لنتائج الطلاب */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-right">
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>{isAr ? "رفع وتسكين قاعدة بيانات الطلاب جماعياً ⚡" : "Smart Bulk Student Database Seeding ⚡"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    {isAr ? "يمكنك استيراد كافة أرقام جلوس وأسماء وحالات الطلاب إلى النظام بلمسة واحدة أو عبر لصق قائمة CSV." : "Seed all seat numbers, names and academic status to Firestore with a single click or by pasting CSV lines."}
                  </p>
                </div>
              </div>

              {/* حالة الرفع النشطة */}
              {isSeedingActive && (
                <div className="p-5 bg-slate-950/80 rounded-2xl border border-indigo-500/20 space-y-4">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-indigo-400">{seedingProgress}% ({seedingCurrent} / {seedingTotal})</span>
                    <span className="text-slate-300">{isAr ? "جاري تعبئة وتسكين الطلاب بقاعدة البيانات..." : "Uploading students to database..."}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{ width: `${seedingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* نجاح الرفع */}
              {showSeedingSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-black">{isAr ? "تم إتمام عملية الاستيراد بنجاح! 🎉" : "Import Completed Successfully! 🎉"}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">{isAr ? `تم بنجاح رفع وتغذية ${importedCount} طالب بأرقام جلوسهم في قاعدة البيانات.` : `Successfully seeded ${importedCount} student records with their seat numbers.`}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* الخيار الأول: استيراد فوري لقائمة الطلاب المُعدة مسبقاً */}
                <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3 text-right">
                  <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                    {isAr ? "استيراد سريع ⚡" : "QUICK IMPORT ⚡"}
                  </span>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">
                    {isAr ? "استيراد القائمة الكاملة للطلاب المسجلين مسبقاً" : "Import the Full Preloaded Student List"}
                  </h4>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                      {isAr
                        ? "يقوم هذا الخيار باستيراد أرقام الجلوس والأسماء والحالات المُعدة مسبقاً في النظام، وتغذيتها فوراً بقاعدة بيانات Firestore."
                        : "This seeds the seat numbers, full names and status from the preloaded student list directly into Firestore."}
                    </p>
                  </div>
                  <button
                    disabled={isSeedingActive}
                    onClick={() => handleImportStudentsList(PRELOADED_STUDENTS)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? "ابدأ الاستيراد والتغذية الفورية الآن" : "Start Immediate Import Now"}</span>
                  </button>
                </div>

                {/* الخيار الثاني: لصق بيانات مخصصة */}
                <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3 text-right">
                  <span className="bg-indigo-400/10 text-indigo-400 border border-indigo-400/20 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                    {isAr ? "لصق يدوي مخصص 📝" : "CUSTOM CSV PASTE 📝"}
                  </span>
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">{isAr ? "لصق قائمة مخصصة (CSV / Tab)" : "Paste Custom CSV/Tab List"}</h4>
                  
                  <textarea
                    rows={3}
                    value={csvTextInput}
                    onChange={(e) => setCsvTextInput(e.target.value)}
                    placeholder={isAr ? "رقم الجلوس,الاسم,الحالة (كل طالب في سطر جديد)\nمثال:\n5001,محمد احمد محمود,منقول" : "SeatNumber,Name,Status (Each student on a new line)\ne.g.:\n5001,John Doe,Pass"}
                    className="w-full text-right p-3 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    dir="rtl"
                  />

                  <button
                    disabled={isSeedingActive || !csvTextInput.trim()}
                    onClick={handlePastedCsvImport}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isAr ? "رفع البيانات الملصقة" : "Import Pasted Text"}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* أداة معالجة ورفع درجات الطلاب عبر Excel */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150/70 shadow-sm space-y-6">
              <div className="text-right border-r-4 border-indigo-600 pr-3">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <span>{isAr ? "رفع ومعالجة درجات الطلاب من ملف Excel 📊" : "Upload & Process Student Grades from Excel 📊"}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {isAr 
                    ? "قم برفع ملف Excel (XLSX/XLS) يحتوي على درجات الطلاب. سيقوم النظام بمطابقة أرقام الجلوس تلقائياً بأسماء الطلاب وحالاتهم المسجلة مسبقاً، ثم تحديث درجاتهم في قاعدة البيانات." 
                    : "Upload an Excel sheet containing student marks. The system will automatically link seat numbers with pre-registered names & status, then save results in Firestore."}
                </p>
              </div>

              {/* اختيار الفرقة الدراسية لملف الإكسيل المرفوع */}
              <div className="space-y-2 text-right" dir="rtl">
                <label className="block text-xs font-black text-slate-700">
                  {isAr ? "حدد الفرقة الدراسية التابع لها هذا الملف 🎓:" : "Select the academic year for this file 🎓:"}
                </label>
                <select
                  value={uploadAcademicYear}
                  onChange={(e) => {
                    const selectedYear = e.target.value;
                    setUploadAcademicYear(selectedYear);
                    if (parsedGrades.length > 0) {
                      setParsedGrades(prev => prev.map(item => ({ ...item, academicYear: selectedYear })));
                    }
                  }}
                  className="w-full sm:w-72 px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="الفرقة الأولى">{isAr ? "الفرقة الأولى" : "First Year"}</option>
                  <option value="الفرقة الثانية">{isAr ? "الفرقة الثانية" : "Second Year"}</option>
                  <option value="الفرقة الثالثة">{isAr ? "الفرقة الثالثة" : "Third Year"}</option>
                  <option value="الفرقة الرابعة">{isAr ? "الفرقة الرابعة" : "Fourth Year"}</option>
                </select>
              </div>

              {/* منطقة السحب والإفلات وتصفح الملفات */}
              <div 
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]" 
                    : "border-gray-250 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400"
                }`}
                onDragEnter={handleExcelDrag}
                onDragOver={handleExcelDrag}
                onDragLeave={handleExcelDrag}
                onDrop={handleExcelDrop}
              >
                <input 
                  type="file" 
                  id="excelFileInput"
                  accept=".xlsx, .xls, .csv, .pdf" 
                  className="hidden" 
                  onChange={handleExcelFileChange}
                />
                
                <label 
                  htmlFor="excelFileInput" 
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                    <Download className="w-6 h-6 rotate-180" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-800">
                      {isAr ? "اسحب وأفلت ملف الـ Excel أو PDF هنا، أو اضغط للتصفح" : "Drag & drop your Excel or PDF file here, or click to browse"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">
                      {isAr ? "يدعم ملفات .xlsx, .xls, .csv, .pdf" : "Supports .xlsx, .xls, .csv, .pdf formats"}
                    </p>
                  </div>
                </label>
              </div>

              {/* حالة معالجة الملف */}
              {isParsingExcel && (
                <div className="text-center py-4 space-y-2">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-500">
                    {isAr ? "جاري قراءة الملف وتفسير درجات المواد الدراسية..." : "Parsing Excel sheet and mapping academic grades..."}
                  </p>
                </div>
              )}

              {/* الأخطاء */}
              {excelImportError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-black rounded-2xl flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-black">{isAr ? "حدث خطأ أثناء معالجة الملف" : "Error Processing File"}</p>
                    <p className="text-[10px] text-red-500 mt-1 font-bold">{excelImportError}</p>
                  </div>
                </div>
              )}

              {/* نجاح الحفظ النهائي */}
              {excelImportSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-black">{isAr ? "تم حفظ وتحديث الدرجات بنجاح! 🎉" : "Grades Saved and Updated Successfully! 🎉"}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">
                      {isAr 
                        ? `تمت تغطية وتحديث درجات ${excelImportedCount} طالب بنجاح وربطهم بأسماء سجلاتهم المقيدة في قاعدة البيانات.` 
                        : `Successfully updated the grades for ${excelImportedCount} students linked to their registered profiles.`}
                    </p>
                  </div>
                </div>
              )}

              {/* حالة تقدم الحفظ الفعلي في Firestore */}
              {isSavingExcelGrades && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-gray-150 space-y-4">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-indigo-600">{excelGradesProgress}% ({excelGradesCurrent} / {excelGradesTotal})</span>
                    <span className="text-slate-600">{isAr ? "جاري تخزين وتحديث درجات الطلاب في Firestore..." : "Writing and updating grades in Firestore..."}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${excelGradesProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* معاينة البيانات بعد التحليل وقبل الحفظ */}
              {parsedGrades.length > 0 && !isSavingExcelGrades && (
                <div className="space-y-4" dir="rtl">
                  <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-800">
                        {isAr ? `تم العثور على درجات لـ ${parsedGrades.length} طالب جاهزة للمزامنة.` : `Found grades for ${parsedGrades.length} students ready to sync.`}
                      </p>
                      <p className="text-[10px] text-indigo-600 mt-0.5 font-bold">
                        {isAr ? "تم ربط أسماء الطلاب تلقائياً برقم الجلوس من قاعدة بيانات الطلاب المقيدين." : "Student names mapped automatically from preloaded database matching seat numbers."}
                      </p>
                    </div>
                    <button
                      onClick={handleSaveExcelGrades}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isAr ? "حفظ كافة الدرجات الآن" : "Save All Grades Now"}</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                    <table className="w-full text-right text-xs font-sans">
                      <thead className="bg-slate-50 text-slate-600 border-b border-gray-150 text-[10px] font-black uppercase">
                        <tr>
                          <th className="p-3 text-right">{isAr ? "رقم الجلوس" : "Seat Number"}</th>
                          <th className="p-3 text-right">{isAr ? "الاسم الكامل (مرتبط)" : "Linked Name"}</th>
                          {/* المواد الدراسية ديناميكياً */}
                          {parsedGrades[0]?.grades?.map((g: any, sIdx: number) => (
                            <th key={sIdx} className="p-3 text-center truncate max-w-[120px] font-bold" title={g.subject}>
                              {g.subject}
                            </th>
                          ))}
                          <th className="p-3 text-center">{isAr ? "المجموع" : "Total"}</th>
                          <th className="p-3 text-center">{isAr ? "النسبة" : "Percentage"}</th>
                          <th className="p-3 text-center">{isAr ? "التقدير" : "Grade"}</th>
                          <th className="p-3 text-center">{isAr ? "الترتيب" : "Rank"}</th>
                          <th className="p-3 text-center">{isAr ? "الحالة" : "Status"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedGrades.slice(0, 5).map((student, idx) => (
                          <tr key={idx} className="border-b last:border-none border-gray-150 hover:bg-slate-50 transition-colors font-semibold text-slate-800">
                            <td className="p-3 font-mono font-bold text-indigo-600">{student.seatNumber}</td>
                            <td className="p-3 font-black text-slate-900">{student.fullName}</td>
                            {/* درجات المواد ديناميكياً */}
                            {student.grades?.map((g: any, sIdx: number) => (
                              <td key={sIdx} className="p-3 text-center font-mono text-slate-600">
                                {g.scoreText}
                              </td>
                            ))}
                            <td className="p-3 text-center font-mono text-slate-800 font-bold">{student.totalScore}</td>
                            <td className="p-3 text-center font-mono text-slate-800 font-bold">{student.percentage}%</td>
                            <td className="p-3 text-center text-slate-700 font-extrabold">{student.generalGrade}</td>
                            <td className="p-3 text-center text-slate-600 font-mono font-bold">{student.rank}</td>
                            <td className="p-3 text-center">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                student.status === "باقي" || student.status === "Baqi" || student.status.includes("باق")
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              }`}>
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {parsedGrades.length > 5 && (
                    <p className="text-[10px] text-center text-slate-400 font-bold">
                      {isAr 
                        ? `* يعرض الجدول عينة معاينة لأول 5 طلاب فقط من أصل ${parsedGrades.length} طالباً تم استخراج درجاتهم.` 
                        : `* Showing a preview of the first 5 records out of ${parsedGrades.length} total parsed student rows.`}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-150/70 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div className="text-right">
                  <h3 className="font-black text-slate-900 text-base">{isAr ? "الطلاب المقيدون وحالة المصروفات الدراسية" : "Registered Students & Tuition Status"}</h3>
                  <p className="text-xs text-slate-400 font-bold">{isAr ? "استعراض بيانات الطلاب المسجلين بالكلية وتتبع دفع المصاريف" : "View enrolled student profiles and monitor their financial clearances"}</p>
                </div>
                <div className="bg-teal-500/10 text-teal-700 px-4 py-2 rounded-xl text-xs font-black">
                  {isAr ? `إجمالي الطلاب: ${adminStudents.length}` : `Total Students: ${adminStudents.length}`}
                </div>
              </div>

              {adminStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[10px] font-black uppercase">
                      <tr>
                        <th className="p-3 text-right">{isAr ? "اسم الطالب" : "Student Name"}</th>
                        <th className="p-3 text-right">{isAr ? "البريد الإلكتروني" : "Email"}</th>
                        <th className="p-3 text-right">{isAr ? "كود الطالب (ID)" : "Student ID"}</th>
                        <th className="p-3 text-center">{isAr ? "الفرقة الأكاديمية" : "Academic Year"}</th>
                        <th className="p-3 text-center">{isAr ? "حالة الرسوم" : "Tuition status"}</th>
                        <th className="p-3 text-left">{isAr ? "إجراء سريع" : "Quick Action"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminStudents.map((student) => {
                        // البحث عن حالة الدفع لهذا الطالب
                        const payment = adminPayments.find(p => p.userId === student.id);
                        const isPaid = payment ? payment.paid : false;
                        return (
                          <tr key={student.id} className="border-b last:border-none border-gray-150 hover:bg-slate-50 transition-colors font-semibold text-slate-800">
                            <td className="p-3 font-black text-slate-900 text-right">{student.fullName}</td>
                            <td className="p-3 font-mono text-xs text-right">{student.email}</td>
                            <td className="p-3 font-mono text-xs text-indigo-600 text-right">{student.studentId || "ST-2026-XXXX"}</td>
                            <td className="p-3 text-center">{student.academicYear}</td>
                            <td className="p-3 text-center">
                              {isPaid ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[11px] font-black inline-block">
                                  {isAr ? "✅ مسدد ومبرأ ماليًا" : "Paid & Unlocked"}
                                </span>
                              ) : (
                                <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full text-[11px] font-black inline-block">
                                  {isAr ? "🔒 معلق (الدرجات محجوبة)" : "Pending (Grades Locked)"}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-left">
                              <button
                                onClick={async () => {
                                  if (!payment) return;
                                  try {
                                    await updateDoc(doc(db, "student_payments", payment.id), {
                                      paid: !isPaid,
                                      paidDate: !isPaid ? new Date().toLocaleDateString("en-US") : ""
                                    });
                                    alert(isAr ? "تم تحديث حالة الرسوم للطالب بنجاح!" : "Tuition fee status toggled successfully!");
                                    fetchAdminData();
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer border ${
                                  isPaid 
                                    ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" 
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                }`}
                              >
                                {isPaid ? (isAr ? "تعليق الدفع وحجب الدرجات" : "Lock Grades") : (isAr ? "إعفاء/تأكيد السداد الكامل" : "Mark as Paid")}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-semibold text-center py-6">{isAr ? "لا يوجد طلاب مقيدون تجريبيون حاليًا." : "No registered students found."}</p>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
