import React, { useState, useEffect } from "react";
import { 
  Search, GraduationCap, Printer, CheckCircle2, Send, ShieldAlert, 
  HelpingHand, Lock, User, Mail, BookOpen, CreditCard, 
  Plus, Trash2, Video, FileText, ExternalLink, Calendar, LogOut, Check,
  Award, Eye, FileSpreadsheet, ShieldCheck, AlertCircle, Sparkles, UserCheck, Key
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { 
  collection, addDoc, getDocs, query, where, updateDoc, 
  doc, setDoc, getDoc, deleteDoc, onSnapshot 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { db, auth } from "../lib/firebase";
import { handleFirestoreError, OperationType, isQuotaError } from "../lib/firebase-error";
import { SEEDED_RESULTS } from "../data";
import AdminDashboard from "./AdminDashboard";

const isPassingGrade = (grade: string) => {
  const cleanGrade = String(grade || "").trim();
  if (cleanGrade === "" || cleanGrade === "-") {
    return null;
  }
  if (["م", "ج ج", "ج", "ل", "امتياز", "جيد جدا", "جيد", "مقبول", "ناجح"].includes(cleanGrade)) {
    return true;
  }
  if (["ض", "ض ج", "غ", "ضعيف", "ضعيف جدا", "غائب", "راسب"].includes(cleanGrade)) {
    return false;
  }
  const num = Number(cleanGrade);
  if (!isNaN(num)) {
    return num >= 50;
  }
  return true; // default
};

const renderGradeBadge = (grade: string) => {
  const cleanGrade = String(grade || "").trim();
  if (cleanGrade === "" || cleanGrade === "-") {
    return (
      <span className="inline-flex items-center gap-1 bg-slate-800/50 text-slate-400 border border-slate-700/55 px-2.5 py-0.5 rounded-xl font-bold text-xs">
        -
      </span>
    );
  }
  if (cleanGrade === "م" || cleanGrade.includes("امتياز")) {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-xl font-bold text-xs">
        🟢 م (امتياز)
      </span>
    );
  }
  if (cleanGrade === "ج ج" || cleanGrade.includes("جيد جدا")) {
    return (
      <span className="inline-flex items-center gap-1 bg-teal-500/15 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-xl font-bold text-xs">
        🔵 ج ج (جيد جداً)
      </span>
    );
  }
  if (cleanGrade === "ج" || cleanGrade.includes("جيد")) {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-xl font-bold text-xs">
        🔵 ج (جيد)
      </span>
    );
  }
  if (cleanGrade === "ل" || cleanGrade.includes("مقبول")) {
    return (
      <span className="inline-flex items-center gap-1 bg-slate-500/15 text-slate-300 border border-slate-500/20 px-2 py-0.5 rounded-xl font-bold text-xs">
        ⚪ ل (مقبول)
      </span>
    );
  }
  if (cleanGrade === "ض" || cleanGrade.includes("ضعيف")) {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-xl font-bold text-xs">
        🟡 ض (ضعيف)
      </span>
    );
  }
  if (cleanGrade === "ض ج" || cleanGrade.includes("ضعيف جدا")) {
    return (
      <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-xl font-bold text-xs">
        🔴 ض ج (ضعيف جداً)
      </span>
    );
  }
  if (cleanGrade === "غ" || cleanGrade.includes("غائب") || cleanGrade.includes("غياب")) {
    return (
      <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-xl font-bold text-xs">
        ⚫ غ (غائب)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-slate-900 text-white border border-slate-800 px-2.5 py-0.5 rounded-xl font-mono font-bold text-xs">
      {cleanGrade}
    </span>
  );
};

export default function StudentPortal() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  // -------------------------------------------------------------
  // 1. حالات المصادقة والمستخدمين (Auth States)
  // -------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"results" | "login" | "signup" | "admission">("results");
  const [seatNumber, setSeatNumber] = useState("");
  const [resultSearchLoading, setResultSearchLoading] = useState(false);
  const [resultSearchResult, setResultSearchResult] = useState<any | null>(null);
  const [resultSearchError, setResultSearchError] = useState("");
  const [showInactivityNotice, setShowInactivityNotice] = useState(false);

  // حقول طلب الالتحاق الجديد (الطلاب الجدد)
  const [admFullName, setAdmFullName] = useState("");
  const [admPhone, setAdmPhone] = useState("");
  const [admNationalId, setAdmNationalId] = useState("");
  const [admAddress, setAdmAddress] = useState("");
  const [admReceiptCode, setAdmReceiptCode] = useState("");
  const [admHighSchool, setAdmHighSchool] = useState("");
  const [admNotes, setAdmNotes] = useState("");
  const [isSubmittingAdmission, setIsSubmittingAdmission] = useState(false);
  const [admissionSuccessId, setAdmissionSuccessId] = useState("");

  // حقول تتبع وحالة طلبات الالتحاق للطلاب الجدد
  const [lookupAppId, setLookupAppId] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // حقول تسجيل الدخول / التسجيل
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "professor" | "admin">("student");
  const [academicYear, setAcademicYear] = useState("الفرقة الأولى");
  const [department, setDepartment] = useState("شعبة الخدمة الاجتماعية");
  const [professorPasscode, setProfessorPasscode] = useState("");

  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [demoActionLoading, setDemoActionLoading] = useState(false);

  // -------------------------------------------------------------
  // 2. حالات لوحة تحكم الطالب (Student Dashboard States)
  // -------------------------------------------------------------
  const [studentTab, setStudentTab] = useState<"dashboard" | "courses" | "grades" | "payments">("dashboard");
  const [myGrades, setMyGrades] = useState<any[]>([]);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [payingItem, setPayingItem] = useState<any | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [viewingLecture, setViewingLecture] = useState<any | null>(null);
  const [selectedEmailReceipt, setSelectedEmailReceipt] = useState<any | null>(null);

  // -------------------------------------------------------------
  // 3. حالات لوحة تحكم الأستاذ (Faculty Dashboard States)
  // -------------------------------------------------------------
  const [professorTab, setProfessorTab] = useState<"upload" | "grading" | "admissions">("upload");
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [allAdmissions, setAllAdmissions] = useState<any[]>([]);
  const [gradingStudent, setGradingStudent] = useState<any | null>(null);
  const [allUploadedMaterials, setAllUploadedMaterials] = useState<any[]>([]);

  // حقول رفع المحاضرات والماتريال
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialSubject, setMaterialSubject] = useState("");
  const [materialType, setMaterialType] = useState<"pdf" | "video" | "link" | "text">("pdf");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialDesc, setMaterialDesc] = useState("");
  const [materialYear, setMaterialYear] = useState("الفرقة الأولى");

  // حقول رصد الدرجات
  const [gradeSubject, setGradeSubject] = useState("");
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeTerm, setGradeTerm] = useState("الترم الأول");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("");

  useEffect(() => {
    if (userProfile?.academicYear && !selectedYearFilter) {
      setSelectedYearFilter(userProfile.academicYear);
    }
  }, [userProfile]);

  useEffect(() => {
    const initialMode = localStorage.getItem("portal_initial_mode");
    if (initialMode === "admission" || initialMode === "signup" || initialMode === "login") {
      setAuthMode(initialMode as any);
      localStorage.removeItem("portal_initial_mode");
    }
  }, []);

  // -------------------------------------------------------------
  // مراقبة حالة جلسة المستخدم الحالية
  // -------------------------------------------------------------
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      const savedSimulated = localStorage.getItem("aswan_simulated_user");
      if (savedSimulated) {
        try {
          const simUser = JSON.parse(savedSimulated);
          setCurrentUser(simUser);
          
          // Try fetching their profile from Firestore to keep it updated, otherwise use stored
          const docRef = doc(db, "user_profiles", simUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            setUserProfile(simUser.profile);
          }
          setAuthLoading(false);
          return () => {};
        } catch (e: any) {
          if (isQuotaError(e)) {
            console.warn("Failed to restore simulated session (Quota Exceeded):", e);
          } else {
            console.error("Failed to restore simulated session:", e);
          }
          handleFirestoreError(e, OperationType.GET, "user_profiles");
        }
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          try {
            const docRef = doc(db, "user_profiles", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
            } else {
              const fallbackProfile = {
                uid: user.uid,
                fullName: user.displayName || user.email?.split("@")[0] || "طالب معهد أسوان",
                email: user.email,
                role: "student",
                academicYear: "الفرقة الأولى",
                department: "الخدمة الاجتماعية",
                createdAt: new Date().toISOString()
              };
              setUserProfile(fallbackProfile);
            }
          } catch (error: any) {
            if (isQuotaError(error)) {
              console.warn("Error getting user profile (Quota Exceeded):", error);
            } else {
              console.error("Error getting user profile:", error);
            }
            handleFirestoreError(error, OperationType.GET, "user_profiles");
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setAuthLoading(false);
      });
      
      return unsubscribe;
    };
    
    let unsub: () => void = () => {};
    checkAuth().then(res => {
      unsub = res;
    });
    
    return () => {
      unsub();
    };
  }, []);

  // -------------------------------------------------------------
  // مراقبة النشاط لتسجيل الخروج التلقائي بعد 15 دقيقة من الخمول حمايةً للبيانات الأكاديمية
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: any;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 mins (900,000 ms)

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(triggerAutoLogout, INACTIVITY_LIMIT);
    };

    const triggerAutoLogout = async () => {
      console.log("Inactivity limit reached. Auto-logging out...");
      await handleLogout();
      setShowInactivityNotice(true);
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [currentUser]);

  // -------------------------------------------------------------
  // مراقبة الجلب التلقائي للبيانات بناءً على هوية المستخدم المسجل
  // -------------------------------------------------------------
  useEffect(() => {
    if (!currentUser || !userProfile) return;

    let unsubGrades = () => {};
    let unsubPayments = () => {};
    let unsubMaterials = () => {};
    let unsubStudents = () => {};
    let unsubAdmissions = () => {};

    if (userProfile.role === "student") {
      // 1. جلب درجات الطالب الحقيقي بأسوان
      const gradesQuery = query(collection(db, "student_grades"), where("studentId", "==", currentUser.uid));
      unsubGrades = onSnapshot(gradesQuery, (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach((d) => loaded.push({ id: d.id, ...d.data() }));
        setMyGrades(loaded);
      }, (err) => handleFirestoreError(err, OperationType.GET, "student_grades"));

      // 2. جلب المصروفات المستحقة للطالب
      const paymentsQuery = query(collection(db, "student_payments"), where("userId", "==", currentUser.uid));
      unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach((d) => loaded.push({ id: d.id, ...d.data() }));
        setMyPayments(loaded);
      }, (err) => handleFirestoreError(err, OperationType.GET, "student_payments"));

      // 3. جلب ماتريال المواد والمحاضرات للفرقة الأكاديمية للطالب
      const materialsQuery = query(collection(db, "course_materials"), where("academicYear", "==", userProfile.academicYear));
      unsubMaterials = onSnapshot(materialsQuery, (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach((d) => loaded.push({ id: d.id, ...d.data() }));
        setCourseMaterials(loaded);
      }, (err) => handleFirestoreError(err, OperationType.GET, "course_materials"));

    } else if (userProfile.role === "professor") {
      // 1. جلب كافة الطلاب لرصد الدرجات
      const studentsQuery = query(collection(db, "user_profiles"), where("role", "==", "student"));
      unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach((d) => loaded.push({ id: d.id, ...d.data() }));
        setStudentsList(loaded);
      }, (err) => handleFirestoreError(err, OperationType.GET, "user_profiles"));

      // 2. جلب المحاضرات والماتريال التي رفعها هذا الأستاذ فقط
      const profMaterialsQuery = query(collection(db, "course_materials"), where("professorId", "==", currentUser.uid));
      unsubMaterials = onSnapshot(profMaterialsQuery, (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach((d) => loaded.push({ id: d.id, ...d.data() }));
        setAllUploadedMaterials(loaded);
      }, (err) => handleFirestoreError(err, OperationType.GET, "course_materials"));

      // 3. جلب طلبات الالتحاق/القبول المعلقة والواردة من المتقدمين
      const admQuery = collection(db, "admission_applications");
      unsubAdmissions = onSnapshot(admQuery, (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach((d) => loaded.push({ id: d.id, ...d.data() }));
        setAllAdmissions(loaded);
      }, (err) => handleFirestoreError(err, OperationType.GET, "admission_applications"));
    }

    return () => {
      unsubGrades();
      unsubPayments();
      unsubMaterials();
      unsubStudents();
      unsubAdmissions();
    };
  }, [currentUser, userProfile]);

  // -------------------------------------------------------------
  // 4. دالات معالجة المصادقة والتحقق (Auth Handlers)
  // -------------------------------------------------------------
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");

    if (!email || !password) {
      setAuthError(isAr ? "يرجى كتابة البريد الإلكتروني وكلمة المرور." : "Please fill in email and password.");
      return;
    }

    try {
      if (authMode === "login") {
        // Check for hardcoded demo credentials first to bypass unnecessary Firebase Auth provider calls
        if (email === "student@aswan.edu" && password === "aswan123456") {
          await handleDemoLoginFallback("student");
        } else if (email === "professor@aswan.edu" && password === "aswan123456") {
          await handleDemoLoginFallback("professor");
        } else if ((email === "admin@aswan.edu" || email === "omarmadany83@gmail.com") && (password === "aswan123456" || password === "admin2026" || password === "1975" || password === "admin1975")) {
          await handleDemoLoginFallback("admin", email);
        } else {
          try {
            // Attempt Firebase Auth sign-in first for custom registered accounts
            await signInWithEmailAndPassword(auth, email, password);
            setAuthSuccessMsg(isAr ? "تم تسجيل الدخول بنجاح!" : "Logged in successfully!");
          } catch (fbErr: any) {
            if (fbErr?.code === "auth/operation-not-allowed") {
              console.info("Aswan Authentication offline/cached provider fallback activated.");
            } else {
              console.warn("Firebase Auth failed, trying simulated login fallback:", fbErr);
            }
            
            // Check Firestore for user_profiles matching this email
            const q = query(collection(db, "user_profiles"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const profileData = userDoc.data();
              
              // Validate password (allow "aswan123456" or custom stored tempPass or custom password)
              const isValidPass = password === "aswan123456" || 
                                  (profileData.tempPass && password === profileData.tempPass) ||
                                  (profileData.password && password === profileData.password);
              
              if (isValidPass) {
                const simUser = {
                  uid: profileData.uid,
                  email: profileData.email,
                  displayName: profileData.fullName,
                  profile: profileData
                };
                localStorage.setItem("aswan_simulated_user", JSON.stringify(simUser));
                setCurrentUser(simUser);
                setUserProfile(profileData);
                setAuthSuccessMsg(isAr ? "تم تسجيل الدخول بنجاح للحساب الأكاديمي!" : "Logged in successfully to academic account!");
              } else {
                throw new Error(isAr ? "كلمة المرور غير صحيحة للحساب الجامعي." : "Incorrect password for this academic account.");
              }
            } else {
              throw new Error(isAr ? "الحساب غير موجود بالبوابة الأكاديمية. يرجى مراجعة البريد الإلكتروني أو إنشاء حساب جديد." : "Account not found in the academic portal. Please verify your email or register.");
            }
          }
        }
      } else {
        // Sign up
        if (role === "professor" && professorPasscode.trim() !== "prof123" && professorPasscode.trim() !== "aswan2026") {
          setAuthError(isAr ? "كود هيئة التدريس غير صحيح! يرجى التواصل مع إدارة التقنية." : "Faculty passkey is incorrect.");
          return;
        }
        if (role === "admin" && professorPasscode.trim() !== "admin2026" && professorPasscode.trim() !== "aswan2026") {
          setAuthError(isAr ? "كود المدير غير صحيح!" : "Admin passkey is incorrect.");
          return;
        }

        if (!fullName) {
          setAuthError(isAr ? "يرجى إدخال اسمك الكامل ثلاثياً." : "Please enter full name.");
          return;
        }

        const simulatedUid = "sim_" + Math.random().toString(36).substr(2, 9);
        const studentId = role === "student" ? ("ST-2026-" + Math.floor(1000 + Math.random() * 9000)) : (role === "admin" ? "ADMIN-ASW" : "PROF-ASW");

        const newProfile = {
          uid: simulatedUid,
          fullName,
          email,
          role,
          academicYear: role === "student" ? academicYear : "",
          department: department,
          studentId,
          createdAt: new Date().toISOString()
        };

        try {
          // Attempt Firebase Auth sign-up first (it might succeed if enabled, or fail if disabled)
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          const user = credential.user;
          newProfile.uid = user.uid;
        } catch (fbErr: any) {
          if (fbErr?.code === "auth/operation-not-allowed") {
            console.info("Aswan Account registered in Firestore secure cloud schema successfully.");
          } else {
            console.warn("Firebase Auth SignUp failed, using simulated sign-up fallback:", fbErr);
          }
        }

        // Save profile in Firestore (will succeed because public write is allowed!)
        await setDoc(doc(db, "user_profiles", newProfile.uid), newProfile);
        
        // Save simulated session locally
        const simUser = {
          uid: newProfile.uid,
          email: newProfile.email,
          displayName: newProfile.fullName,
          profile: newProfile
        };
        localStorage.setItem("aswan_simulated_user", JSON.stringify(simUser));
        setCurrentUser(simUser);
        setUserProfile(newProfile);

        // Seed initial mock payments if student
        if (role === "student") {
          const paymentsRef = collection(db, "student_payments");
          await addDoc(paymentsRef, {
            userId: newProfile.uid,
            studentName: fullName,
            title: isAr ? "المصروفات الدراسية للعام الجامعي ٢٠٢٦" : "University Tuition Fees 2026",
            amount: 1850,
            paid: false,
            dueDate: "2026-09-15",
            paidDate: "",
            createdAt: new Date().toISOString()
          });
          await addDoc(paymentsRef, {
            userId: newProfile.uid,
            studentName: fullName,
            title: isAr ? "رسوم الكارنيه والأنشطة الطلابية" : "Student Card & Welfare Activity Fees",
            amount: 150,
            paid: false,
            dueDate: "2026-06-30",
            paidDate: "",
            createdAt: new Date().toISOString()
          });
        }

        setAuthSuccessMsg(isAr ? "تم إنشاء الحساب الأكاديمي بنجاح في البوابة الموحدة!" : "Academic account created successfully!");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setAuthError(isAr ? "هذا البريد الإلكتروني مستخدم بالفعل." : "Email is already in use.");
      } else if (err.code === "auth/weak-password") {
        setAuthError(isAr ? "كلمة المرور ضعيفة جداً (يجب ألا تقل عن 6 أحرف)." : "Password is too weak (min 6 characters).");
      } else if (err.code === "auth/invalid-email") {
        setAuthError(isAr ? "صيغة البريد الإلكتروني غير صحيحة." : "Invalid email format.");
      } else if (err.code === "auth/invalid-credential") {
        setAuthError(isAr ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.");
      } else {
        setAuthError(err.message || String(err));
      }
    }
  };

  // -------------------------------------------------------------
  // دالة إرسال طلب التقديم والالتحاق الإلكتروني للطلاب الجدد
  // -------------------------------------------------------------
  const handleSubmitAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");
    setAdmissionSuccessId("");

    if (!admFullName || !admPhone || !admNationalId || !admAddress || !admReceiptCode || !admHighSchool) {
      setAuthError(isAr ? "يرجى ملء جميع الحقول المطلوبة لتقديم طلب الالتحاق." : "Please fill in all required fields for admissions.");
      return;
    }

    if (admNationalId.length !== 14 || !/^\d+$/.test(admNationalId)) {
      setAuthError(isAr ? "الرقم القومي يجب أن يتكون من 14 رقماً." : "National ID must be exactly 14 digits.");
      return;
    }

    setIsSubmittingAdmission(true);
    const trackingId = "ASW-2026-" + Math.floor(1000 + Math.random() * 9000);

    try {
      await addDoc(collection(db, "admission_applications"), {
        appId: trackingId,
        fullName: admFullName,
        phone: admPhone,
        nationalId: admNationalId,
        address: admAddress,
        receiptCode: admReceiptCode,
        paymentCycle: "annual",
        highSchoolGrad: admHighSchool,
        notes: admNotes || "",
        status: "pending",
        createdAt: new Date().toISOString()
      });

      setAdmissionSuccessId(trackingId);
      setAuthSuccessMsg(isAr 
        ? `تهانينا! تم تسجيل طلب التقديم الإلكتروني بنجاح بالمعهد! كود تتبع طلبك هو: ${trackingId}` 
        : `Congratulations! Your online admission request has been sent! Tracking code: ${trackingId}`
      );

      // مسح المدخلات
      setAdmFullName("");
      setAdmPhone("");
      setAdmNationalId("");
      setAdmAddress("");
      setAdmReceiptCode("");
      setAdmHighSchool("");
      setAdmNotes("");
    } catch (err: any) {
      if (isQuotaError(err)) {
        console.warn("Error submitting admission (Quota Exceeded):", err);
      } else {
        console.error("Error submitting admission:", err);
      }
      setAuthError(isAr ? "حدث خطأ أثناء إرسال طلب التقديم. يرجى المحاولة مرة أخرى." : "Error submitting admissions form. Please try again.");
      handleFirestoreError(err, OperationType.CREATE, "admission_applications");
    } finally {
      setIsSubmittingAdmission(false);
    }
  };

  // -------------------------------------------------------------
  // الاستعلام عن النتائج برقم الجلوس - قاعدة البيانات التجريبية
  // -------------------------------------------------------------
  const DEFAULT_RESULTS_BY_SEAT: Record<string, {
    seatNumber: string;
    fullName: string;
    academicYear: string;
    department: string;
    percentage: number;
    totalScore?: number;
    generalGrade?: string;
    rank?: string;
    notes?: string;
    status: string;
    grades: {
      subject: string;
      maxScore: number;
      passingScore: number;
      scoreText: string;
      isSpecial?: boolean;
    }[];
  }> = {
    "5001": {
      seatNumber: "5001",
      fullName: "أحمد محمد محمود علي",
      academicYear: "الفرقة الأولى",
      department: "شعبة الخدمة الاجتماعية",
      percentage: 65.21,
      totalScore: 913,
      generalGrade: "ج (جيد)",
      rank: "14",
      notes: "ناجح ومنقول للفرقة الأعلى",
      status: "ناجح",
      grades: [
        { subject: "تدريب", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "علم الاجتماع العام", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "علم النفس العام", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "علم الاجتماع السياسي", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "الشريعة الإسلامية", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "مدخل الخدمة الاجتماعية", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "الإحصاء الاجتماعي الوصفي", maxScore: 100, passingScore: 50, scoreText: "م" },
        { subject: "نصوص في الخدمة الاجتماعية باللغة", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "الاقتصاد الاجتماعي", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "مدخل الرعاية الاجتماعية", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "الانثروبولوجيا الاجتماعية والثقافية", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "صحة المجتمع", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "علم النفس الاجتماعي", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "حاسب آلي ونظم معلومات", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "قضايا مجتمعية", maxScore: 100, passingScore: 50, scoreText: "ل" }
      ]
    },
    "5002": {
      seatNumber: "5002",
      fullName: "سارة عبد الرحمن حسن سليمان",
      academicYear: "الفرقة الأولى",
      department: "شعبة الخدمة الاجتماعية",
      percentage: 77.64,
      totalScore: 1087,
      generalGrade: "ج ج (جيد جداً)",
      rank: "5",
      notes: "ناجح ومنقول للفرقة الأعلى بتميز",
      status: "ناجح",
      grades: [
        { subject: "تدريب", maxScore: 100, passingScore: 50, scoreText: "م" },
        { subject: "علم الاجتماع العام", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "علم النفس العام", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "علم الاجتماع السياسي", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "الشريعة الإسلامية", maxScore: 100, passingScore: 50, scoreText: "م" },
        { subject: "مدخل الخدمة الاجتماعية", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "الإحصاء الاجتماعي الوصفي", maxScore: 100, passingScore: 50, scoreText: "م" },
        { subject: "نصوص في الخدمة الاجتماعية باللغة", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "الاقتصاد الاجتماعي", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "مدخل الرعاية الاجتماعية", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "الانثروبولوجيا الاجتماعية والثقافية", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "صحة المجتمع", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "علم النفس الاجتماعي", maxScore: 100, passingScore: 50, scoreText: "ج ج" },
        { subject: "حاسب آلي ونظم معلومات", maxScore: 100, passingScore: 50, scoreText: "م" },
        { subject: "قضايا مجتمعية", maxScore: 100, passingScore: 50, scoreText: "ج" }
      ]
    },
    "5003": {
      seatNumber: "5003",
      fullName: "محمود إبراهيم أحمد خلف",
      academicYear: "الفرقة الأولى",
      department: "شعبة الخدمة الاجتماعية",
      percentage: 59.85,
      totalScore: 838,
      generalGrade: "ل (مقبول)",
      rank: "22",
      notes: "ناجح ومقبول",
      status: "ناجح",
      grades: [
        { subject: "تدريب", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "علم الاجتماع العام", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "علم النفس العام", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "علم الاجتماع السياسي", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "الشريعة الإسلامية", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "مدخل الخدمة الاجتماعية", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "الإحصاء الاجتماعي الوصفي", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "نصوص في الخدمة الاجتماعية باللغة", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "الاقتصاد الاجتماعي", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "مدخل الرعاية الاجتماعية", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "الانثروبولوجيا الاجتماعية والثقافية", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "صحة المجتمع", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "علم النفس الاجتماعي", maxScore: 100, passingScore: 50, scoreText: "ج" },
        { subject: "حاسب آلي ونظم معلومات", maxScore: 100, passingScore: 50, scoreText: "ل" },
        { subject: "قضايا مجتمعية", maxScore: 100, passingScore: 50, scoreText: "ل" }
      ]
    }
  };

  const handleLookupSeatNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultSearchError("");
    setResultSearchResult(null);

    const queryStr = seatNumber.trim();
    if (!queryStr) {
      setResultSearchError(isAr ? "يرجى كتابة رقم الجلوس للاستعلام." : "Please enter your seat number.");
      return;
    }

    setResultSearchLoading(true);
    try {
      if (sessionStorage.getItem("aswan_inst_firestore_quota_exceeded") === "true") {
        if (DEFAULT_RESULTS_BY_SEAT[queryStr]) {
          setResultSearchResult(DEFAULT_RESULTS_BY_SEAT[queryStr]);
        } else {
          setResultSearchError(isAr 
            ? "عذراً، رقم الجلوس هذا غير مسجل حالياً في النتائج المعتمدة. يرجى مراجعة الرقم أو المحاولة لاحقاً." 
            : "This seat number was not found in the approved results database. Please check and try again."
          );
        }
        setResultSearchLoading(false);
        return;
      }

      // 1. الاستعلام من قاعدة بيانات Firestore أولاً لضمان الديناميكية عند رفع الإكسيل
      const q = query(collection(db, "student_results_by_seat"), where("seatNumber", "==", queryStr));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setResultSearchResult({ id: querySnapshot.docs[0].id, ...docData });
      } else {
        // 2. الفحص في البيانات المسبقة التجريبية محلياً إذا لم توجد في فايرستور
        if (DEFAULT_RESULTS_BY_SEAT[queryStr]) {
          setResultSearchResult(DEFAULT_RESULTS_BY_SEAT[queryStr]);
        } else {
          setResultSearchError(isAr 
            ? "عذراً، رقم الجلوس هذا غير مسجل حالياً في النتائج المعتمدة. يرجى مراجعة الرقم أو المحاولة لاحقاً." 
            : "This seat number was not found in the approved results database. Please check and try again."
          );
        }
      }
    } catch (err: any) {
      if (isQuotaError(err)) {
        console.warn("Error looking up seat number (Quota Exceeded):", err);
        try {
          sessionStorage.setItem("aswan_inst_firestore_quota_exceeded", "true");
        } catch (e) {}
        if (DEFAULT_RESULTS_BY_SEAT[queryStr]) {
          setResultSearchResult(DEFAULT_RESULTS_BY_SEAT[queryStr]);
        } else {
          setResultSearchError(isAr 
            ? "عذراً، رقم الجلوس هذا غير مسجل حالياً في النتائج المعتمدة. يرجى مراجعة الرقم أو المحاولة لاحقاً." 
            : "This seat number was not found in the approved results database. Please check and try again."
          );
        }
      } else {
        console.error("Error looking up seat number:", err);
        // Fallback to local demo in case of network issue
        if (DEFAULT_RESULTS_BY_SEAT[queryStr]) {
          setResultSearchResult(DEFAULT_RESULTS_BY_SEAT[queryStr]);
        } else {
          setResultSearchError(isAr ? "حدث خطأ أثناء الاتصال بالخادم." : "Error connecting to server.");
        }
      }
    } finally {
      setResultSearchLoading(false);
    }
  };

  // -------------------------------------------------------------
  // دالة الاستعلام عن حالة طلب التقديم للطلاب الجدد
  // -------------------------------------------------------------
  const handleLookupAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);
    if (!lookupAppId.trim()) {
      setLookupError(isAr ? "يرجى كتابة كود التتبع أو الرقم القومي للاستعلام." : "Please enter tracking code or National ID.");
      return;
    }

    setLookupLoading(true);
    try {
      if (sessionStorage.getItem("aswan_inst_firestore_quota_exceeded") === "true") {
        setLookupError(isAr 
          ? "الخدمة تواجه ضغطاً كبيراً حالياً، يرجى المحاولة لاحقاً." 
          : "System is under high load right now, please try again later."
        );
        setLookupLoading(false);
        return;
      }

      // Query by tracking appId OR nationalId
      let q = query(collection(db, "admission_applications"), where("appId", "==", lookupAppId.trim()));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        q = query(collection(db, "admission_applications"), where("nationalId", "==", lookupAppId.trim()));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const appDoc = querySnapshot.docs[0];
        setLookupResult({ id: appDoc.id, ...appDoc.data() });
      } else {
        setLookupError(isAr 
          ? "لم يتم العثور على أي طلب تقديم يطابق هذا الرمز أو الرقم القومي. يرجى التحقق وإعادة المحاولة." 
          : "No admission file matched this code or National ID. Please double check."
        );
      }
    } catch (err: any) {
      if (isQuotaError(err)) {
        console.warn("Error looking up admission (Quota Exceeded):", err);
        try {
          sessionStorage.setItem("aswan_inst_firestore_quota_exceeded", "true");
        } catch (e) {}
        setLookupError(isAr 
          ? "الخدمة تواجه ضغطاً كبيراً حالياً، يرجى المحاولة لاحقاً." 
          : "System is under high load right now, please try again later."
        );
      } else {
        console.error("Error looking up admission:", err);
        setLookupError(isAr ? "حدث خطأ أثناء الاتصال بالنظام." : "Error fetching from network.");
      }
    } finally {
      setLookupLoading(false);
    }
  };

  // -------------------------------------------------------------
  // دالة الدخول السريع كمسؤول/طالب/أستاذ بوضع المحاكاة الكامل الفوري
  // -------------------------------------------------------------
  const handleDemoLoginFallback = async (targetRole: "student" | "professor" | "admin", specificEmail?: string) => {
    let simulatedUid = "sim_student_id";
    let demoEmail = "student@aswan.edu";

    if (targetRole === "admin") {
      simulatedUid = "sim_admin_id";
      demoEmail = specificEmail || "admin@aswan.edu";
    } else if (targetRole === "professor") {
      demoEmail = specificEmail || "professor@aswan.edu";
      if (demoEmail.includes("prof1")) simulatedUid = "sim_prof1_id";
      else if (demoEmail.includes("prof2")) simulatedUid = "sim_prof2_id";
      else if (demoEmail.includes("prof3")) simulatedUid = "sim_prof3_id";
      else simulatedUid = "sim_professor_id";
    } else {
      demoEmail = specificEmail || "student@aswan.edu";
      if (demoEmail.includes("student1")) simulatedUid = "sim_student_y1";
      else if (demoEmail.includes("student2")) simulatedUid = "sim_student_y2";
      else if (demoEmail.includes("student3")) simulatedUid = "sim_student_y3";
      else simulatedUid = "sim_student_id";
    }

    let detectedName = "عمر محمد مدني رشوان";
    let detectedYear = "الفرقة الرابعة";
    let detectedSubject = "";
    let detectedDept = "تخطيط وبحوث الخدمة الاجتماعية";

    if (targetRole === "admin") {
      detectedName = "المهندس عمر مدني (مدير النظام البوابة)";
      detectedYear = "";
      detectedDept = "إدارة تكنولوجيا المعلومات";
    } else if (targetRole === "professor") {
      if (demoEmail.includes("prof1")) {
        detectedName = "د. أحمد كمال";
        detectedYear = "الفرقة الأولى";
        detectedSubject = "مدخل إلى الخدمة الاجتماعية";
        detectedDept = "أسس الخدمة الاجتماعية";
      } else if (demoEmail.includes("prof2")) {
        detectedName = "د. مصطفى محمود";
        detectedYear = "الفرقة الثانية";
        detectedSubject = "الخدمة الاجتماعية الطبية";
        detectedDept = "الخدمة الاجتماعية في المجال الطبي";
      } else if (demoEmail.includes("prof3")) {
        detectedName = "د. إيمان الشريف";
        detectedYear = "الفرقة الثالثة";
        detectedSubject = "طرق تنظيم المجتمع المحلي";
        detectedDept = "تنظيم المجتمع";
      } else {
        detectedName = "أ.د. عادل عبد الحميد (عميد التخطيط)";
        detectedYear = "الفرقة الرابعة";
        detectedSubject = "التخطيط الاجتماعي والتنمية المستدامة";
        detectedDept = "تخطيط وبحوث الخدمة الاجتماعية";
      }
    } else {
      // students
      if (demoEmail.includes("student1")) {
        detectedName = "أحمد حسن علي";
        detectedYear = "الفرقة الأولى";
        detectedDept = "أسس الخدمة الاجتماعية";
      } else if (demoEmail.includes("student2")) {
        detectedName = "سارة محمود السيد";
        detectedYear = "الفرقة الثانية";
        detectedDept = "الخدمة الاجتماعية في المجال الطبي";
      } else if (demoEmail.includes("student3")) {
        detectedName = "مينا جرجس غالي";
        detectedYear = "الفرقة الثالثة";
        detectedDept = "تنظيم المجتمع";
      }
    }

    const demoProfile = {
      uid: simulatedUid,
      fullName: detectedName,
      email: demoEmail,
      role: targetRole,
      academicYear: detectedYear,
      subject: detectedSubject,
      department: detectedDept,
      studentId: targetRole === "student" ? (simulatedUid === "sim_student_y1" ? "ST-2026-1122" : simulatedUid === "sim_student_y2" ? "ST-2026-3344" : simulatedUid === "sim_student_y3" ? "ST-2026-5566" : "ST-2026-7788") : (targetRole === "admin" ? "ADMIN-2026" : "PROF-9900"),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "user_profiles", simulatedUid), demoProfile);
    } catch (err: any) {
      if (isQuotaError(err)) {
        console.warn("Firestore setDoc failed during demo fallback (Quota Exceeded):", err);
      } else {
        console.error("Firestore setDoc failed during demo fallback:", err);
      }
    }

    // Seed student data and extra students
    try {
      const payRef = collection(db, "student_payments");
      const gradesRef = collection(db, "student_grades");
      const matRef = collection(db, "course_materials");

      // Seed Student 4 (Default sim_student_id)
      const payQuery = await getDocs(query(payRef, where("userId", "==", "sim_student_id")));
      if (payQuery.empty) {
        await addDoc(payRef, {
          userId: "sim_student_id",
          studentName: "عمر محمد مدني رشوان",
          title: "المصروفات الدراسية المعتمدة لعام ٢٠٢٦",
          amount: 1850,
          paid: false,
          dueDate: "2026-09-15",
          paidDate: "",
          createdAt: new Date().toISOString()
        });
        await addDoc(payRef, {
          userId: "sim_student_id",
          studentName: "عمر محمد مدني رشوان",
          title: "رسوم الكتب المنهجية المطبوعة والأنشطة",
          amount: 250,
          paid: true,
          dueDate: "2026-05-10",
          paidDate: "2026-05-09",
          createdAt: new Date().toISOString()
        });
      }

      const gradesQuery = await getDocs(query(gradesRef, where("studentId", "==", "sim_student_id")));
      if (gradesQuery.empty) {
        await addDoc(gradesRef, {
          studentId: "sim_student_id",
          studentName: "عمر محمد مدني رشوان",
          subject: "طرق الخدمة الاجتماعية (فرد)",
          grade: "امتياز",
          score: 95,
          academicYear: "الفرقة الرابعة",
          professorId: "demo_prof_id_2",
          professorName: "د. إيمان الشريف",
          term: "الترم الأول",
          createdAt: new Date().toISOString()
        });
        await addDoc(gradesRef, {
          studentId: "sim_student_id",
          studentName: "عمر محمد مدني رشوان",
          subject: "التخطيط الاجتماعي والتنمية المستدامة",
          grade: "امتياز",
          score: 92,
          academicYear: "الفرقة الرابعة",
          professorId: "sim_professor_id",
          professorName: "أ.د. عادل عبد الحميد",
          term: "الترم الأول",
          createdAt: new Date().toISOString()
        });
        await addDoc(gradesRef, {
          studentId: "sim_student_id",
          studentName: "عمر محمد مدني رشوان",
          subject: "تنظيم المجتمعات المحلية بأسوان",
          grade: "جيد جداً",
          score: 84,
          academicYear: "الفرقة الرابعة",
          professorId: "demo_prof_id_3",
          professorName: "د. مصطفى محمود",
          term: "الترم الثاني",
          createdAt: new Date().toISOString()
        });
      }

      // Seed Student 1 (Year 1)
      const payQuery1 = await getDocs(query(payRef, where("userId", "==", "sim_student_y1")));
      if (payQuery1.empty) {
        await setDoc(doc(db, "user_profiles", "sim_student_y1"), {
          uid: "sim_student_y1",
          fullName: "أحمد حسن علي",
          email: "student1@aswan.edu",
          role: "student",
          academicYear: "الفرقة الأولى",
          department: "أسس الخدمة الاجتماعية",
          studentId: "ST-2026-1122",
          createdAt: new Date().toISOString()
        });
        await addDoc(payRef, {
          userId: "sim_student_y1",
          studentName: "أحمد حسن علي",
          title: "المصروفات الدراسية للفرقة الأولى ٢٠٢٦",
          amount: 1850,
          paid: false, // Has unpaid dues so their grades will be LOCKED
          dueDate: "2026-09-15",
          paidDate: "",
          createdAt: new Date().toISOString()
        });
        await addDoc(gradesRef, {
          studentId: "sim_student_y1",
          studentName: "أحمد حسن علي",
          subject: "مدخل إلى الخدمة الاجتماعية",
          grade: "جيد جداً",
          score: 82,
          academicYear: "الفرقة الأولى",
          professorId: "sim_prof1_id",
          professorName: "د. أحمد كمال",
          term: "الترم الأول",
          createdAt: new Date().toISOString()
        });
      }

      // Seed Student 2 (Year 2)
      const payQuery2 = await getDocs(query(payRef, where("userId", "==", "sim_student_y2")));
      if (payQuery2.empty) {
        await setDoc(doc(db, "user_profiles", "sim_student_y2"), {
          uid: "sim_student_y2",
          fullName: "سارة محمود السيد",
          email: "student2@aswan.edu",
          role: "student",
          academicYear: "الفرقة الثانية",
          department: "الخدمة الاجتماعية في المجال الطبي",
          studentId: "ST-2026-3344",
          createdAt: new Date().toISOString()
        });
        await addDoc(payRef, {
          userId: "sim_student_y2",
          studentName: "سارة محمود السيد",
          title: "المصروفات الدراسية للفرقة الثانية ٢٠٢٦",
          amount: 1850,
          paid: true, // Mark Year 2 student as PAID so their grades are UNLOCKED instantly!
          dueDate: "2026-09-15",
          paidDate: "2026-04-12",
          createdAt: new Date().toISOString()
        });
        await addDoc(gradesRef, {
          studentId: "sim_student_y2",
          studentName: "سارة محمود السيد",
          subject: "الخدمة الاجتماعية الطبية",
          grade: "امتياز",
          score: 91,
          academicYear: "الفرقة الثانية",
          professorId: "sim_prof2_id",
          professorName: "د. مصطفى محمود",
          term: "الترم الأول",
          createdAt: new Date().toISOString()
        });
      }

      // Seed Student 3 (Year 3)
      const payQuery3 = await getDocs(query(payRef, where("userId", "==", "sim_student_y3")));
      if (payQuery3.empty) {
        await setDoc(doc(db, "user_profiles", "sim_student_y3"), {
          uid: "sim_student_y3",
          fullName: "مينا جرجس غالي",
          email: "student3@aswan.edu",
          role: "student",
          academicYear: "الفرقة الثالثة",
          department: "تنظيم المجتمع",
          studentId: "ST-2026-5566",
          createdAt: new Date().toISOString()
        });
        await addDoc(payRef, {
          userId: "sim_student_y3",
          studentName: "مينا جرجس غالي",
          title: "المصروفات الدراسية للفرقة الثالثة ٢٠٢٦",
          amount: 1850,
          paid: false, // Has unpaid dues so grades are LOCKED
          dueDate: "2026-09-15",
          paidDate: "",
          createdAt: new Date().toISOString()
        });
        await addDoc(gradesRef, {
          studentId: "sim_student_y3",
          studentName: "مينا جرجس غالي",
          subject: "طرق تنظيم المجتمع المحلي",
          grade: "جيد جداً",
          score: 79,
          academicYear: "الفرقة الثالثة",
          professorId: "sim_prof3_id",
          professorName: "د. إيمان الشريف",
          term: "الترم الأول",
          createdAt: new Date().toISOString()
        });
      }

      // Seed course materials
      const matQuery = await getDocs(query(matRef, where("academicYear", "==", "الفرقة الرابعة")));
      if (matQuery.empty) {
        await addDoc(matRef, {
          subject: "التخطيط الاجتماعي والتنمية المستدامة",
          academicYear: "الفرقة الرابعة",
          title: "المحاضرة الأولى: مقدمة عامة في نظريات التخطيط الحديث",
          type: "video",
          url: "https://www.youtube.com/embed/zpOULjyy-n8",
          description: "شرح مرئي مفصل يقدمه عميد المعهد حول أساليب التخطيط وبحوث العمل والتدخل المهني بأسوان.",
          professorId: "sim_professor_id",
          professorName: "أ.د. عادل عبد الحميد",
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      if (isQuotaError(err)) {
        console.warn("Seeding student data skipped (Quota Exceeded):", err);
      } else {
        console.error("Error seeding student data:", err);
      }
    }

    const simUser = {
      uid: simulatedUid,
      email: demoEmail,
      displayName: demoProfile.fullName,
      profile: demoProfile
    };
    localStorage.setItem("aswan_simulated_user", JSON.stringify(simUser));
    setCurrentUser(simUser);
    setUserProfile(demoProfile);
    setAuthSuccessMsg(isAr ? "تم تسجيل الدخول السريع بنجاح (وضع المحاكاة الآمن)!" : "Demo session initialized (Simulated Secure Mode)!");
  };

  const handleDemoLogin = async (targetRole: "student" | "professor" | "admin", specificEmail?: string) => {
    setDemoActionLoading(true);
    setAuthError("");
    const demoEmail = specificEmail || (targetRole === "student" ? "student@aswan.edu" : (targetRole === "admin" ? "admin@aswan.edu" : "professor@aswan.edu"));
    const demoPass = "aswan123456";

    try {
      // Try standard Firebase Auth first
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      setAuthSuccessMsg(isAr ? "تم تسجيل الدخول بنجاح!" : "Logged in successfully!");
    } catch (loginErr: any) {
      console.warn("Firebase login failed, executing robust local/simulated demo auth:", loginErr);
      await handleDemoLoginFallback(targetRole, demoEmail);
    } finally {
      setDemoActionLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      localStorage.removeItem("aswan_simulated_user");
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // 5. وظائف الطالب (Student Actions)
  // -------------------------------------------------------------
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCVV) {
      alert(isAr ? "الرجاء تعبئة بيانات الدفع لبطاقة فيزا/ماستر كارد." : "Please fill card details.");
      return;
    }
    setIsPaying(true);
    try {
      if (payingItem) {
        const docRef = doc(db, "student_payments", payingItem.id);
        await updateDoc(docRef, {
          paid: true,
          paidDate: new Date().toLocaleDateString("en-US")
        });
        alert(isAr ? "تمت عملية الدفع الإلكتروني الآمن بنجاح! شكراً لك." : "Tuition fee paid successfully via secured portal.");
        setPayingItem(null);
        setCardNumber("");
        setCardExpiry("");
        setCardCVV("");
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, "student_payments");
    } finally {
      setIsPaying(false);
    }
  };

  // -------------------------------------------------------------
  // 6. وظائف الأستاذ / الدكاترة (Professor Actions)
  // -------------------------------------------------------------
  const handleMaterialUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle || !materialSubject || !materialUrl) {
      alert(isAr ? "يرجى تعبئة كافة الحقول الإلزامية للمحاضرة." : "Please complete required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "course_materials"), {
        subject: materialSubject,
        academicYear: materialYear,
        title: materialTitle,
        type: materialType,
        url: materialUrl,
        description: materialDesc || "",
        professorId: currentUser?.uid,
        professorName: userProfile?.fullName || "عضو هيئة تدريس معتمد",
        createdAt: new Date().toISOString()
      });

      alert(isAr ? "تم رفع المادة الدراسية بنجاح ومتاحة للطلاب فوراً!" : "Material uploaded successfully!");
      setMaterialTitle("");
      setMaterialSubject("");
      setMaterialUrl("");
      setMaterialDesc("");
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, "course_materials");
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه المادة الدراسية نهائياً؟" : "Delete this material permanently?")) return;
    try {
      await deleteDoc(doc(db, "course_materials", matId));
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, "course_materials");
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingStudent || !gradeSubject || !gradeScore) {
      alert(isAr ? "يرجى اختيار طالب، وتحديد المادة، وإدخال الدرجة المستحقة." : "Incomplete grade input.");
      return;
    }

    // حساب التقدير العام تلقائياً
    let determinedGrade = "مقبول";
    if (gradeScore >= 85) determinedGrade = "امتياز";
    else if (gradeScore >= 75) determinedGrade = "جيد جداً";
    else if (gradeScore >= 65) determinedGrade = "جيد";
    else if (gradeScore >= 50) determinedGrade = "مقبول";
    else determinedGrade = "راسب";

    try {
      await addDoc(collection(db, "student_grades"), {
        studentId: gradingStudent.uid,
        studentName: gradingStudent.fullName,
        subject: gradeSubject,
        grade: determinedGrade,
        score: Number(gradeScore),
        academicYear: gradingStudent.academicYear,
        professorId: currentUser?.uid,
        professorName: userProfile?.fullName || "دكتور المعهد بأسوان",
        term: gradeTerm,
        createdAt: new Date().toISOString()
      });

      alert(isAr ? `تم رصد درجة الطالب: ${gradingStudent.fullName} بنجاح!` : "Grade submitted successfully!");
      setGradingStudent(null);
      setGradeSubject("");
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, "student_grades");
    }
  };

  const handleUpdateAdmissionStatus = async (appId: string, newStatus: "approved" | "rejected") => {
    try {
      const docRef = doc(db, "admission_applications", appId);
      
      if (newStatus === "approved") {
        const appSnap = await getDoc(docRef);
        if (appSnap.exists()) {
          const appData = appSnap.data();
          
          // Generate student credentials
          const studentIdNum = Math.floor(1000 + Math.random() * 9000);
          const studentId = `ST-2026-${studentIdNum}`;
          const academicEmail = `std.2026.${studentIdNum}@aswan.edu`;
          const academicPassword = "aswan123456";
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
        alert(isAr ? "تم تحديث حالة طلب القبول بنجاح!" : "Admissions application status updated!");
      }
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, "admission_applications");
    }
  };

  // -------------------------------------------------------------
  // حساب المجموع الكلي والنسبة المئوية والتقدير للطالب المسجل
  // -------------------------------------------------------------
  const calculateAveragePercentage = (gradesList = myGrades) => {
    if (gradesList.length === 0) return "0%";
    let totalScore = 0;
    gradesList.forEach((g) => {
      totalScore += g.score;
    });
    return (totalScore / gradesList.length).toFixed(1) + "%";
  };

  const getPercentageGradeWord = (percentageStr: string) => {
    const num = parseFloat(percentageStr);
    if (isNaN(num)) return isAr ? "مقبول" : "Satisfactory / Pass";
    if (num >= 85) return isAr ? "امتياز" : "Excellent";
    if (num >= 75) return isAr ? "جيد جداً" : "Very Good";
    if (num >= 65) return isAr ? "جيد" : "Good";
    if (num >= 50) return isAr ? "مقبول" : "Satisfactory / Pass";
    return isAr ? "ضعيف (راسب)" : "Weak / Failed";
  };

  const hasUnpaidDues = myPayments.some(p => !p.paid);

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen border-b border-slate-950 flex flex-col font-sans" id="student-portal-section">
      
      {/* نافذة الخمول الأمني */}
      {showInactivityNotice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-950 border border-emerald-500/30 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                {isAr ? "جلسة أمنية منتهية" : "Security Session Expired"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isAr 
                  ? "تم تسجيل خروجك تلقائياً لعدم النشاط وحفاظاً على سرية وأمان بياناتك الأكاديمية."
                  : "You have been automatically logged out due to inactivity to protect the privacy and security of your academic records."}
              </p>
            </div>
            <button
              onClick={() => setShowInactivityNotice(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-bold transition-all text-sm shadow-lg shadow-emerald-900/20"
            >
              {isAr ? "موافق" : "OK"}
            </button>
          </div>
        </div>
      )}

      {/* هيدر مخصص ومستقل يجعلك تشعر بأنك في موقع منفصل ذو برستيج جامعي فخم */}
      <header className="bg-slate-950 border-b border-slate-800 py-4 px-6 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-2.5 rounded-2xl shadow-md animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block">
              {isAr ? "وزارة التعليم العالي — معهد أسوان" : "Ministry of Higher Education — Aswan Institute"}
            </span>
            <h1 className="text-lg md:text-xl font-black text-white">
              {isAr ? "البوابة الرقمية الموحدة للطلاب وأعضاء هيئة التدريس" : "Unified Digital Portal for Students & Faculty"}
            </h1>
          </div>
        </div>

        {currentUser && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 font-bold block">
                {userProfile?.role === "professor" ? (isAr ? "عضو هيئة تدريس" : "Professor/Doctor") : (isAr ? "طالب أكاديمي" : "Academic Student")}
              </span>
              <span className="text-xs font-extrabold text-emerald-400">{userProfile?.fullName}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? "خروج" : "Log Out"}</span>
            </button>
          </div>
        )}
      </header>

      {/* المحتوى الرئيسي */}
      <div className="flex-grow flex flex-col justify-center items-center">
        {authLoading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-semibold">{isAr ? "جاري مصادقة الدخول والتحقق الآمن..." : "Authenticating session safely..."}</p>
          </div>
        ) : !currentUser ? (
          
          /* ------------------------------------------------------------- */
          /* بوابة الدخول والتسجيل (Authentication Gateway UI) */
          /* ------------------------------------------------------------- */
          <div className={`w-full mx-auto p-4 md:p-8 grid grid-cols-1 gap-8 items-center transition-all duration-300 ${
            authMode === "results" 
              ? "max-w-5xl" 
              : "max-w-6xl lg:grid-cols-12"
          }`}>
            
            {/* العمود الأيسر: تقديم تعريفي مميز للبوابة يضاهي جامعات هارفارد ومعهد ماساتشوستس */}
            {authMode !== "results" && (
              <div className="lg:col-span-6 space-y-6 text-right" dir={isAr ? "rtl" : "ltr"}>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-500/20">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? "الجيل الرابع للخدمات الجامعية الرقمية بأسوان" : "4th-Gen University Digital Services"}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                {isAr ? "مستقبلك الأكاديمي يبدأ من هنا" : "Your Academic Future Starts Here"}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-bold">
                {isAr 
                  ? "تتيح البوابة الرقمية لطلاب معهد الخدمة الاجتماعية بأسوان الاطلاع المباشر على النتائج، وتنزيل المحاضرات، ومتابعة المصروفات الدراسية. كما تمكن أعضاء هيئة التدريس من رفع الماتريال ورصد درجات الطلاب بكل سهولة ويقين."
                  : "The digital portal allows Aswan Institute students to check their grades, stream/download lectures, and pay tuition. It enables professors to upload materials and record student marks easily."}
              </p>

              {/* بطاقات الميزات الأربعة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-start gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">{isAr ? "محاضرات ومواد دراسية" : "Lectures & PDFs"}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">{isAr ? "ذاكر محاضراتك مسجلة وملفات PDF من الدكاترة فوراً." : "Study online with videos and documents."}</p>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-start gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">{isAr ? "الدرجات والتقديرات" : "Grades & GPA"}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">{isAr ? "تابع درجاتك أولاً بأول بالتفصيل ومعدلك التراكمي." : "Get instant grade transcript & cumulative GPA."}</p>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-start gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">{isAr ? "الرسوم والمصروفات" : "Tuition Billing"}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">{isAr ? "سداد آمن ومبسط للرسوم الدراسية وكارنيه المعهد." : "Securely check and pay university dues."}</p>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-start gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">{isAr ? "بوابة الأساتذة والتحكم" : "Professors Hub"}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">{isAr ? "أدوات متكاملة للدكاترة لرصد الدرجات وإدارتها بالكامل." : "Faculty tools to record marks & manage materials."}</p>
                  </div>
                </div>
              </div>

              {/* قسم الدخول التجريبي الذكي المعزز */}
              {(import.meta as any).env?.VITE_ENABLE_DEMO === "true" && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl space-y-4 mt-6">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                    <Key className="w-4 h-4" />
                    <span>{isAr ? "معاينة سريعة وتجربة فورية دون عناء التسجيل:" : "Instant Quick Access & Evaluation:"}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    {isAr 
                      ? "اختر حساباً تجريبياً للدخول فوراً ومعاينة البوابة الأكاديمية بنسبة ١٠٠٪. في حال واجهت أي مشاكل في المصادقة أو قيود الشبكة، ستقوم البوابة بتفعيل وضع المحاكاة الآمن محلياً بشكل تلقائي تام." 
                      : "Select a demo role to instantly load and test pre-seeded materials, grades, or administrative layouts. If you encounter any authentication or permission errors, the portal automatically falls back to full simulated security mode."}
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      onClick={() => handleDemoLogin("student", "student@aswan.edu")}
                      disabled={demoActionLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{isAr ? "طالب غير دافع (مغلق)" : "Unpaid Student (Locked)"}</span>
                    </button>
                    <button
                      onClick={() => handleDemoLogin("student", "student2@aswan.edu")}
                      disabled={demoActionLoading}
                      className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "طالب دافع (مفتوح)" : "Paid Student (Unlocked)"}</span>
                    </button>
                    <button
                      onClick={() => handleDemoLogin("professor")}
                      disabled={demoActionLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{isAr ? "دخول سريع كدكتور تجريبي" : "Quick Professor"}</span>
                    </button>
                    <button
                      onClick={() => handleDemoLogin("admin")}
                      disabled={demoActionLoading}
                      className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isAr ? "دخول سريع كمدير للنظام" : "Quick Admin"}</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 mt-1.5">
                    <p className="text-[10px] font-extrabold text-slate-300 mb-1.5">{isAr ? "بيانات تسجيل الدخول اليدوي المباشر:" : "Manual Login Credentials Data:"}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 font-mono font-bold leading-relaxed">
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <p className="text-emerald-400 font-black mb-0.5">{isAr ? "طالب (غير دافع - مغلق):" : "Student (Unpaid):"}</p>
                        <p>student@aswan.edu</p>
                        <p>aswan123456</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <p className="text-teal-400 font-black mb-0.5">{isAr ? "طالب (دافع - مفتوح):" : "Student (Paid):"}</p>
                        <p>student2@aswan.edu</p>
                        <p>aswan123456</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <p className="text-indigo-400 font-black mb-0.5">Professor:</p>
                        <p>professor@aswan.edu</p>
                        <p>aswan123456</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <p className="text-rose-400 font-black mb-0.5">Admin:</p>
                        <p>admin@aswan.edu</p>
                        <p>aswan123456</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
            )}

            {/* العمود الأيمن: نموذج المصادقة المصمم بدقة فائقة */}
            <div className={`${
              authMode === "results" 
                ? "w-full animate-in fade-in zoom-in-95 duration-500" 
                : "lg:col-span-6"
            } bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative transition-all duration-300`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 justify-center border-b border-slate-800 pb-4 mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => { setAuthMode("results"); setAuthError(""); setAuthSuccessMsg(""); }}
                  className={`py-3 text-center text-xs font-black transition-all cursor-pointer ${
                    authMode === "results" 
                      ? "text-emerald-400 border-b-2 border-emerald-500 font-extrabold" 
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {isAr ? "📊 نتائج الامتحانات" : "📊 Exam Results"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthError(""); setAuthSuccessMsg(""); }}
                  className={`py-3 text-center text-xs font-black transition-all cursor-pointer ${
                    authMode === "login" 
                      ? "text-emerald-400 border-b-2 border-emerald-500 font-extrabold" 
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {isAr ? "🔑 دخول البوابة" : "🔑 Portal Login"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("admission"); setAuthError(""); setAuthSuccessMsg(""); }}
                  className={`py-3 text-center text-xs font-black transition-all cursor-pointer ${
                    authMode === "admission" 
                      ? "text-emerald-400 border-b-2 border-emerald-500 font-extrabold" 
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {isAr ? "🎓 تقديم طلاب جدد" : "🎓 New Admission"}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setAuthError(""); setAuthSuccessMsg(""); }}
                  className={`py-3 text-center text-xs font-black transition-all cursor-pointer ${
                    authMode === "signup" 
                      ? "text-emerald-400 border-b-2 border-emerald-500 font-extrabold" 
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {isAr ? "✉️ تفعيل الحساب" : "✉️ Activate Account"}
                </button>
              </div>

              {authError && (
                <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-start gap-2.5 mb-4">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccessMsg && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl flex items-start gap-2.5 mb-4">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authSuccessMsg}</span>
                </div>
              )}

              {authMode === "results" ? (
                /* ------------------------------------------------------------- */
                /* بوابة الاستعلام عن النتائج برقم الجلوس */
                /* ------------------------------------------------------------- */
                <div className="space-y-6 text-right animate-in fade-in duration-300" dir={isAr ? "rtl" : "ltr"}>
                  {!resultSearchResult ? (
                    <form onSubmit={handleLookupSeatNumber} className="space-y-4 sm:space-y-6 py-2 px-1 sm:px-4">
                      <div className="text-center space-y-2 mb-4">
                        <Award className="w-12 h-12 text-emerald-400 mx-auto animate-bounce duration-1000" />
                        <h3 className="text-lg sm:text-xl font-black text-white font-sans tracking-wide">
                          {isAr ? "البوابة الرسمية للاستعلام الفوري عن النتائج" : "Official Direct Results Gateway"}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 font-semibold leading-relaxed max-w-md mx-auto">
                          {isAr 
                            ? "يرجى كتابة رقم الجلوس المكون من 4 أرقام بشكل صحيح ومطابق لرقمك الأكاديمي لعرض بيان درجات المعهد المعتمد بالكامل."
                            : "Please enter your official 4-digit seat number exactly to load your fully verified, official university transcript."}
                        </p>
                      </div>

                      {/* حقل رقم الجلوس - مصمم بشكل مدمج، أنيق ومناسب لجميع الشاشات (fit) */}
                      <div className="space-y-3 bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-inner">
                        <label className="block text-xs sm:text-sm font-black text-slate-300 text-center sm:text-right">
                          {isAr ? "🎯 اكتب رقم الجلوس الموحد الخاص بك:" : "🎯 Enter Your Seat Number:"}
                        </label>
                        <div className="relative max-w-xs mx-auto">
                          <input
                            type="text"
                            required
                            value={seatNumber}
                            onChange={(e) => setSeatNumber(e.target.value)}
                            placeholder={isAr ? "رقم الجلوس" : "Seat Number"}
                            className="w-full bg-slate-950 border-2 border-slate-700 hover:border-slate-500 focus:border-emerald-500 rounded-xl px-4 py-2.5 sm:py-3 text-lg sm:text-xl font-black text-center text-white focus:outline-none transition-all duration-300 font-mono tracking-widest focus:ring-4 focus:ring-emerald-500/20"
                          />
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 font-bold text-center leading-relaxed">
                          {isAr 
                            ? "رقم الجلوس موحد ومكون من 4 أرقام مسجل ومعتمد بكنترول المعهد العالي للخدمة الاجتماعية بأسوان لعام ٢٠٢٦م."
                            : "Your seat number consists of 4 digits registered in the database of Aswan Institute."}
                        </p>
                      </div>

                      {resultSearchError && (
                        <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-400 text-[11px] sm:text-xs font-bold rounded-xl flex items-start gap-2 animate-pulse max-w-xs mx-auto">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                          <span>{resultSearchError}</span>
                        </div>
                      )}

                      <div className="max-w-xs mx-auto">
                        <button
                          type="submit"
                          disabled={resultSearchLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm sm:text-base py-3 sm:py-3.5 rounded-xl transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/20 hover:shadow-emerald-500/10"
                        >
                          {resultSearchLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Search className="w-5 h-5 text-emerald-100" />
                          )}
                          <span>{isAr ? "عرض النتيجة والدرجات بالتفصيل 🔍" : "View Detailed Result & Grades 🔍"}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ------------------------------------------------------------- */
                    /* كارت النتيجة والشهادة المصممة ببرستيج أكاديمي فخم جداً */
                    /* ------------------------------------------------------------- */
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                      {/* كارت الشهادة المعتمدة بنظام الكنترول الرسمي للمعهد */}
                      <div id="print-certificate" className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                        
                        {/* ختم مائي فخم في الخلفية */}
                        <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center rotate-12 pointer-events-none">
                          <GraduationCap className="w-28 h-28 text-emerald-500/10" />
                        </div>

                        {/* رأس الشهادة / الكنترول الأكاديمي */}
                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b border-slate-800 pb-5 mb-6 gap-4 text-center sm:text-right" dir="rtl">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 block uppercase tracking-wider">وزارة التعليم العالي</span>
                            <span className="text-sm font-black text-emerald-400 block font-sans tracking-wide">المعهد العالي للخدمة الاجتماعية بأسوان</span>
                            <span className="text-[10px] font-bold text-slate-400 block">كشف رصد تقديرات الطلاب في امتحانات النقل للفرقة الأولى</span>
                            <span className="text-[10px] font-black text-slate-500 block">دور مايو سنة ٢٠٢٦م</span>
                          </div>
                          
                          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isAr ? "بيان درجات رسمي معتمد" : "Official Certified Grade Sheet"}</span>
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">ID: ASWAN-{resultSearchResult.seatNumber}-2026</span>
                          </div>
                        </div>

                        {/* شبكة توزيع المحتوى بشكل كامل بدون أي عمود جانبي وبدون التسبب في أي scroll */}
                        <div className="space-y-6 w-full" dir="rtl">
                          
                          {/* 1. Student Information (البيانات الأكاديمية الرسمية) */}
                          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-emerald-500/80 mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5 justify-end">
                              <span>{isAr ? "البيانات الأكاديمية الرسمية" : "Official Academic Records"}</span>
                              <User className="w-3.5 h-3.5" />
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                              {resultSearchResult.fullName && (
                                <div className="space-y-1 bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800/60 shadow-sm flex flex-col justify-center md:col-span-3">
                                  <span className="text-[10px] text-slate-500 font-extrabold block">{isAr ? "اسم الطالب:" : "Student Name:"}</span>
                                  <span className="text-sm font-black text-white block mt-0.5">{resultSearchResult.fullName}</span>
                                </div>
                              )}
                              <div className="space-y-1 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 shadow-sm flex flex-col justify-center">
                                <span className="text-[10px] text-emerald-400 font-extrabold block">{isAr ? "رقم الجلوس المعتمد:" : "Certified Seat Number:"}</span>
                                <span className="text-base font-black text-emerald-400 font-mono block tracking-wider mt-0.5">{resultSearchResult.seatNumber}</span>
                              </div>
                              {resultSearchResult.academicYear && resultSearchResult.academicYear !== "-" && (
                                <div className="space-y-1 bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800/60 shadow-sm flex flex-col justify-center">
                                  <span className="text-[10px] text-slate-500 font-extrabold block">{isAr ? "الفرقة الدراسية:" : "Academic Level:"}</span>
                                  <span className="text-xs font-black text-slate-200 block mt-0.5">{resultSearchResult.academicYear}</span>
                                </div>
                              )}
                              {resultSearchResult.department && resultSearchResult.department !== "-" && (
                                <div className="space-y-1 bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800/60 shadow-sm flex flex-col justify-center">
                                  <span className="text-[10px] text-slate-500 font-extrabold block">{isAr ? "الشعبة / التخصص:" : "Department / Specialization:"}</span>
                                  <span className="text-xs font-black text-slate-200 block mt-0.5">{resultSearchResult.department}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 2. Subject Grades (subjects only) */}
                          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-5 shadow-inner">
                            <h4 className="text-xs uppercase font-black tracking-widest text-emerald-500/80 mb-4 pb-2 border-b border-slate-800/80 flex items-center gap-1.5 justify-end">
                              <span>{isAr ? "بيان المواد والتقديرات" : "Subjects & Grades Statement"}</span>
                              <BookOpen className="w-4 h-4 text-emerald-500" />
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {resultSearchResult.grades
                                ?.filter((g: any) => g && g.subject && g.subject.trim() !== "" && g.scoreText && g.scoreText.trim() !== "" && g.scoreText !== "-")
                                ?.map((g: any, idx: number) => {
                                  const pass = isPassingGrade(g.scoreText);
                                  return (
                                    <div key={idx} className="bg-slate-900/60 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 gap-3 shadow-md">
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="text-[10px] font-mono text-slate-500 font-bold">#{idx + 1}</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                          pass === null ? "bg-slate-800/40 text-slate-400 border border-slate-700/40" : pass 
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                        }`}>
                                          {pass === null ? "-" : (pass ? (isAr ? "ناجح" : "Pass") : (isAr ? "راسب" : "Fail"))}
                                        </span>
                                      </div>
                                      
                                      <div>
                                        <h5 className="text-xs sm:text-sm font-black text-white leading-relaxed min-h-[36px] flex items-center">{g.subject}</h5>
                                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                                          <span>{isAr ? "العظمى:" : "Max:"} <strong className="text-slate-200 font-mono font-bold">{g.maxScore || 100}</strong></span>
                                          <span className="text-slate-600">|</span>
                                          <span>{isAr ? "النجاح:" : "Pass:"} <strong className="text-slate-200 font-mono font-bold">{g.passingScore || 50}</strong></span>
                                        </div>
                                      </div>

                                      <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                                        <span className="text-[9px] text-slate-500 font-extrabold">{isAr ? "التقدير:" : "Grade:"}</span>
                                        {renderGradeBadge(g.scoreText)}
                                      </div>
                                    </div>
                                  );
                              })}
                            </div>
                          </div>

                          {/* 3. Failed/Carryover Subjects (مواد التخلف) (only if data exists) */}
                          {((resultSearchResult.backlogSubjects && resultSearchResult.backlogSubjects.length > 0) || 
                            (resultSearchResult.socialDevelopment && resultSearchResult.socialDevelopment !== "-" && resultSearchResult.socialDevelopment !== "0") || 
                            (resultSearchResult.economicDevelopment && resultSearchResult.economicDevelopment !== "-" && resultSearchResult.economicDevelopment !== "0") || 
                            (resultSearchResult.communicationMeans && resultSearchResult.communicationMeans !== "-" && resultSearchResult.communicationMeans !== "0") || 
                            (resultSearchResult.carriedSubjects && resultSearchResult.carriedSubjects !== "-" && resultSearchResult.carriedSubjects !== "0")) && (
                            <div className="space-y-4">
                              {/* مواد التخلف */}
                              {resultSearchResult.backlogSubjects && resultSearchResult.backlogSubjects.length > 0 && (
                                <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-5 shadow-lg">
                                  <h4 className="text-[10px] uppercase font-black tracking-widest text-rose-400 mb-4 pb-2 border-b border-rose-900/40 flex items-center gap-1.5 justify-end">
                                    <span>{isAr ? "بيان مواد التخلف" : "Backlog Subjects Statement"}</span>
                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                  </h4>
                                  <div className="text-right space-y-4">
                                    <span className="text-xs font-black text-rose-300 block">{isAr ? "مواد التخلف:" : "Backlog Subjects:"}</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {resultSearchResult.backlogSubjects.map((sub: any, idx: number) => (
                                        <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-rose-500/10 space-y-1.5">
                                          <div className="text-xs font-semibold text-slate-300">
                                            <span className="text-rose-400 font-extrabold block mb-0.5">- {isAr ? "المادة:" : "Subject:"}</span>
                                            <span className="text-white font-black">{sub.subject}</span>
                                          </div>
                                          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between pt-1.5 border-t border-slate-800/60">
                                            {renderGradeBadge(sub.scoreText)}
                                            <span className="text-rose-400 font-extrabold">- {isAr ? "التقدير:" : "Grade:"}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* بيان المواد المحمولة */}
                              {((resultSearchResult.socialDevelopment && resultSearchResult.socialDevelopment !== "-" && resultSearchResult.socialDevelopment !== "0") || 
                                (resultSearchResult.economicDevelopment && resultSearchResult.economicDevelopment !== "-" && resultSearchResult.economicDevelopment !== "0") || 
                                (resultSearchResult.communicationMeans && resultSearchResult.communicationMeans !== "-" && resultSearchResult.communicationMeans !== "0") || 
                                (resultSearchResult.carriedSubjects && resultSearchResult.carriedSubjects !== "-" && resultSearchResult.carriedSubjects !== "0")) && (
                                <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-5 shadow-lg">
                                  <h4 className="text-[10px] uppercase font-black tracking-widest text-amber-400 mb-4 pb-2 border-b border-amber-900/40 flex items-center gap-1.5 justify-end">
                                    <span>{isAr ? "بيان المواد المحمولة" : "Carried Subjects Statement"}</span>
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
                                    {resultSearchResult.socialDevelopment && resultSearchResult.socialDevelopment !== "-" && resultSearchResult.socialDevelopment !== "0" && (
                                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {renderGradeBadge(resultSearchResult.socialDevelopment)}
                                          <span className="text-[10px] text-slate-500 font-bold">{isAr ? "التقدير:" : "Grade:"}</span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[10px] text-amber-400 font-extrabold block">{isAr ? "مادة محمولة:" : "Carried Subject:"}</span>
                                          <span className="text-xs font-black text-slate-200 block mt-0.5">{isAr ? "تنمية اجتماعية" : "Social Development"}</span>
                                        </div>
                                      </div>
                                    )}

                                    {resultSearchResult.economicDevelopment && resultSearchResult.economicDevelopment !== "-" && resultSearchResult.economicDevelopment !== "0" && (
                                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {renderGradeBadge(resultSearchResult.economicDevelopment)}
                                          <span className="text-[10px] text-slate-500 font-bold">{isAr ? "التقدير:" : "Grade:"}</span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[10px] text-amber-400 font-extrabold block">{isAr ? "مادة محمولة:" : "Carried Subject:"}</span>
                                          <span className="text-xs font-black text-slate-200 block mt-0.5">{isAr ? "تنمية اقتصادية" : "Economic Development"}</span>
                                        </div>
                                      </div>
                                    )}

                                    {resultSearchResult.communicationMeans && resultSearchResult.communicationMeans !== "-" && resultSearchResult.communicationMeans !== "0" && (
                                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {renderGradeBadge(resultSearchResult.communicationMeans)}
                                          <span className="text-[10px] text-slate-500 font-bold">{isAr ? "التقدير:" : "Grade:"}</span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-[10px] text-amber-400 font-extrabold block">{isAr ? "مادة محمولة:" : "Carried Subject:"}</span>
                                          <span className="text-xs font-black text-slate-200 block mt-0.5">{isAr ? "وسائل اتصال" : "Communication Means"}</span>
                                        </div>
                                      </div>
                                    )}

                                    {resultSearchResult.carriedSubjects && resultSearchResult.carriedSubjects !== "-" && resultSearchResult.carriedSubjects !== "0" && (
                                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/10 flex items-center justify-between">
                                        <div className="flex-1 text-right">
                                          <span className="text-[10px] text-amber-400 font-extrabold block">{isAr ? "المواد المحمولة الكلية:" : "Total Carried Subjects:"}</span>
                                          <span className="text-xs font-black text-slate-200 block mt-0.5">{resultSearchResult.carriedSubjects}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 4. Academic Summary (الملخص الأكاديمي) */}
                          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-teal-400 mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5 justify-end">
                              <span>{isAr ? "الملخص الأكاديمي" : "Academic Summary"}</span>
                              <Award className="w-3.5 h-3.5 text-teal-400" />
                            </h4>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                              {/* المجموع الكلي */}
                              {resultSearchResult.totalScore && resultSearchResult.totalScore !== "-" && resultSearchResult.totalScore !== "0" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "المجموع الكلي:" : "Total Score:"}</span>
                                  <span className="text-sm font-black text-slate-200 mt-1 font-mono">{resultSearchResult.totalScore}</span>
                                </div>
                              )}
                              
                              {/* النسبة المئوية */}
                              {resultSearchResult.percentage && resultSearchResult.percentage !== "-" && resultSearchResult.percentage !== "0" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "النسبة المئوية:" : "Percentage:"}</span>
                                  <span className="text-sm font-black text-emerald-400 mt-1 font-mono">{resultSearchResult.percentage}%</span>
                                </div>
                              )}
                              
                              {/* تقدير رابعة */}
                              {resultSearchResult.gradeYear4 && resultSearchResult.gradeYear4 !== "-" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "تقدير رابعة:" : "4th Year Grade:"}</span>
                                  <span className="text-sm font-black text-amber-400 mt-1">{resultSearchResult.gradeYear4}</span>
                                </div>
                              )}
                              
                              {/* مجموع أولى */}
                              {resultSearchResult.totalYear1 && resultSearchResult.totalYear1 !== "-" && resultSearchResult.totalYear1 !== "0" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "مجموع أولى:" : "1st Year Total:"}</span>
                                  <span className="text-sm font-black text-slate-300 mt-1 font-mono">{resultSearchResult.totalYear1}</span>
                                </div>
                              )}
                              
                              {/* مجموع تانية */}
                              {resultSearchResult.totalYear2 && resultSearchResult.totalYear2 !== "-" && resultSearchResult.totalYear2 !== "0" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "مجموع تانية:" : "2nd Year Total:"}</span>
                                  <span className="text-sm font-black text-slate-300 mt-1 font-mono">{resultSearchResult.totalYear2}</span>
                                </div>
                              )}
                              
                              {/* مجموع تالتة */}
                              {resultSearchResult.totalYear3 && resultSearchResult.totalYear3 !== "-" && resultSearchResult.totalYear3 !== "0" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "مجموع تالتة:" : "3rd Year Total:"}</span>
                                  <span className="text-sm font-black text-slate-300 mt-1 font-mono">{resultSearchResult.totalYear3}</span>
                                </div>
                              )}
                              
                              {/* مجموع التراكمي */}
                              {resultSearchResult.cumulativeTotal && resultSearchResult.cumulativeTotal !== "-" && resultSearchResult.cumulativeTotal !== "0" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "مجموع التراكمي:" : "Cumulative Total:"}</span>
                                  <span className="text-sm font-black text-slate-100 mt-1 font-mono">{resultSearchResult.cumulativeTotal}</span>
                                </div>
                              )}
                              
                              {/* النسبة المئوية العامة */}
                              {resultSearchResult.cumulativePercentage && resultSearchResult.cumulativePercentage !== "-" && resultSearchResult.cumulativePercentage !== "0" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "النسبة المئوية العامة:" : "Cumulative Percentage:"}</span>
                                  <span className="text-sm font-black text-teal-400 mt-1 font-mono">{resultSearchResult.cumulativePercentage}%</span>
                                </div>
                              )}
                              
                              {/* التقدير العام */}
                              {resultSearchResult.generalGrade && resultSearchResult.generalGrade !== "-" && (
                                <div className="bg-teal-500/10 border border-teal-500/20 p-3.5 rounded-xl text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-teal-400 font-extrabold">{isAr ? "التقدير العام:" : "General Grade:"}</span>
                                  <span className="text-sm font-black text-teal-300 mt-1">{resultSearchResult.generalGrade}</span>
                                </div>
                              )}
                              
                              {/* درجات مضافة للتراكمي */}
                              {resultSearchResult.addedDegrees && resultSearchResult.addedDegrees !== "-" && resultSearchResult.addedDegrees !== "0" && (
                                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-right flex flex-col justify-between">
                                  <span className="text-[10px] text-slate-500 font-extrabold">{isAr ? "درجات مضافة للتراكمي:" : "Added Degrees:"}</span>
                                  <span className="text-sm font-black text-yellow-400 mt-1 font-mono">{resultSearchResult.addedDegrees}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 5. Student Status Section (حالة الطالب) */}
                          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-amber-500 mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5 justify-end">
                              <span>{isAr ? "حالة الطالب" : "Student Status"}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-right">
                              {/* حالة الطالب */}
                              {resultSearchResult.studentStatus && resultSearchResult.studentStatus !== "-" && (
                                <div className="space-y-1 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-center">
                                  <span className="text-[10px] text-slate-500 font-extrabold block">{isAr ? "حالة الطالب:" : "Student Status:"}</span>
                                  <span className="text-xs font-black text-slate-200 block mt-0.5">{resultSearchResult.studentStatus}</span>
                                </div>
                              )}
                              
                              {/* عدد فرص الطالب */}
                              {resultSearchResult.studentOpportunities && resultSearchResult.studentOpportunities !== "-" && resultSearchResult.studentOpportunities !== "0" && (
                                <div className="space-y-1 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-center">
                                  <span className="text-[10px] text-slate-500 font-extrabold block">{isAr ? "عدد فرص الطالب:" : "Allowed Attempts:"}</span>
                                  <span className="text-xs font-black text-slate-200 block mt-0.5">{resultSearchResult.studentOpportunities}</span>
                                </div>
                              )}
                              
                              {/* مواد الرسوب */}
                              {resultSearchResult.failedSubjects && resultSearchResult.failedSubjects !== "-" && resultSearchResult.failedSubjects !== "0" && (
                                <div className="space-y-1 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-center sm:col-span-2">
                                  <span className="text-[10px] text-rose-400 font-extrabold block">{isAr ? "مواد الرسوب:" : "Failed Subjects:"}</span>
                                  <span className="text-xs font-black text-rose-300 block mt-0.5">{resultSearchResult.failedSubjects}</span>
                                </div>
                              )}
                              
                              {/* ملاحظات */}
                              {resultSearchResult.notes && resultSearchResult.notes !== "-" && (
                                <div className="space-y-1 bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/10 shadow-sm flex flex-col justify-center sm:col-span-4">
                                  <span className="text-[10px] text-emerald-400 font-extrabold block">{isAr ? "ملاحظات:" : "Remarks:"}</span>
                                  <span className="text-xs font-black text-emerald-300 block mt-0.5 leading-relaxed">{resultSearchResult.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* تذييل الاعتمادات والتوقيعات الرسمية */}
                          <div className="flex flex-col sm:flex-row justify-between items-center pt-5 border-t border-slate-800 text-[9px] text-slate-500 gap-4">
                            <div className="text-center sm:text-right">
                              <span className="block font-black text-slate-400">{isAr ? "رئيس الكنترول العام" : "Controller in Chief"}</span>
                              <span className="block font-semibold mt-0.5 text-slate-500 font-sans">{isAr ? "أ.د. عميد الكنترول بالمعهد" : "Aswan Institute General Registrar"}</span>
                            </div>
                            
                            {/* الختم الرسمي */}
                            <div className="text-center flex flex-col items-center">
                              <div className="w-14 h-14 rounded-full border border-dashed border-emerald-500/25 flex flex-col items-center justify-center font-black text-[6px] text-emerald-500/40 rotate-12 bg-slate-900/50 p-1 text-center leading-tight">
                                <span>المعهد العالي</span>
                                <span>للخدمة الاجتماعية</span>
                                <span>بأسوان</span>
                              </div>
                            </div>

                            <div className="text-center sm:text-left font-mono">
                              <span className="block">ASWAN-INSTITUTE-2026</span>
                              <span className="block mt-0.5 text-slate-500">{isAr ? "الرمز المائي والمصادقة" : "Watermark & Authentication"}</span>
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* أزرار الإجراءات */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            // طباعة الجزء المخصص للشهادة فقط بنظام متطور
                            const printContent = document.getElementById("print-certificate")?.innerHTML;
                            const originalContent = document.body.innerHTML;
                            if (printContent) {
                              const printWindow = window.open("", "_blank");
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>بيان درجات الطالب - معهد الخدمة الاجتماعية بأسوان</title>
                                      <style>
                                        body {
                                          font-family: Arial, sans-serif;
                                          background-color: white;
                                          color: black;
                                          padding: 40px;
                                          direction: rtl;
                                          text-align: right;
                                        }
                                        #print-certificate {
                                          border: 2px solid #10b981;
                                          border-radius: 20px;
                                          padding: 30px;
                                          background-color: #fcfcfc;
                                        }
                                        table {
                                          width: 100%;
                                          border-collapse: collapse;
                                          margin-top: 20px;
                                          margin-bottom: 20px;
                                        }
                                        th, td {
                                          border: 1px solid #ddd;
                                          padding: 12px;
                                          text-align: right;
                                        }
                                        th {
                                          background-color: #f1f1f1;
                                          font-weight: bold;
                                        }
                                        .badge {
                                          padding: 4px 8px;
                                          border-radius: 6px;
                                          font-weight: bold;
                                          border: 1px solid #ccc;
                                        }
                                        .flex-grid {
                                          display: grid;
                                          grid-template-columns: repeat(2, 1fr);
                                          gap: 15px;
                                          margin-bottom: 25px;
                                          background: #fafafa;
                                          padding: 15px;
                                          border-radius: 12px;
                                          border: 1px solid #eee;
                                        }
                                        .stats-grid {
                                          display: grid;
                                          grid-template-columns: repeat(4, 1fr);
                                          gap: 15px;
                                          margin-bottom: 20px;
                                        }
                                        .stat-box {
                                          border: 1px solid #e2e8f0;
                                          padding: 15px;
                                          border-radius: 12px;
                                          background: #fafafa;
                                        }
                                        .header-cert {
                                          display: flex;
                                          justify-content: space-between;
                                          border-b: 2px solid #ccc;
                                          padding-bottom: 15px;
                                          margin-bottom: 20px;
                                        }
                                        .signature-footer {
                                          display: flex;
                                          justify-content: space-between;
                                          margin-top: 35px;
                                          border-top: 1px solid #ddd;
                                          padding-top: 15px;
                                        }
                                        .stamp {
                                          border: 2px dashed #10b981;
                                          width: 80px;
                                          height: 80px;
                                          border-radius: 50%;
                                          display: flex;
                                          align-items: center;
                                          justify-content: center;
                                          font-size: 8px;
                                          text-align: center;
                                          font-weight: bold;
                                          color: #10b981;
                                        }
                                        @media print {
                                          body { padding: 0; }
                                          #print-certificate { border: 1px solid #10b981; }
                                        }
                                      </style>
                                    </head>
                                    <body>
                                      <div id="print-certificate">
                                        <div class="header-cert">
                                          <div>
                                            <h3>وزارة التعليم العالي</h3>
                                            <h2>المعهد العالي للخدمة الاجتماعية بأسوان</h2>
                                            <h4>كشف رصد تقديرات امتحانات النقل والتبادل الدراسي</h4>
                                            <h5>دور مايو سنة ٢٠٢٦م</h5>
                                          </div>
                                          <div style="text-align: left; font-size: 12px;">
                                            <p><strong>بيان رسمي معتمد</strong></p>
                                            <p>رقم الجلوس: ${resultSearchResult.seatNumber}</p>
                                          </div>
                                        </div>

                                        <div class="flex-grid" style="grid-template-columns: repeat(${[resultSearchResult.academicYear, resultSearchResult.department].filter(x => x && x !== '-').length + 2}, 1fr);">
                                          <div><strong>اسم الطالب:</strong> ${resultSearchResult.fullName || ""}</div>
                                          <div><strong>رقم الجلوس:</strong> ${resultSearchResult.seatNumber}</div>
                                          ${resultSearchResult.academicYear && resultSearchResult.academicYear !== "-" ? `<div><strong>الفرقة الدراسية:</strong> ${resultSearchResult.academicYear}</div>` : ""}
                                          ${resultSearchResult.department && resultSearchResult.department !== "-" ? `<div><strong>الشعبة / التخصص:</strong> ${resultSearchResult.department}</div>` : ""}
                                        </div>

                                        <table>
                                          <thead>
                                            <tr>
                                              <th style="width: 50px; text-align: center;">م</th>
                                              <th>المادة الدراسية</th>
                                              <th style="width: 120px; text-align: center;">الدرجة العظمى</th>
                                              <th style="width: 120px; text-align: center;">درجة النجاح</th>
                                              <th style="width: 180px; text-align: center;">التقدير المكتسب</th>
                                              <th style="width: 100px; text-align: center;">حالة المادة</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${resultSearchResult.grades
                                              ?.filter((g: any) => g && g.subject && g.subject.trim() !== "" && g.scoreText && g.scoreText.trim() !== "" && g.scoreText !== "-")
                                              ?.map((g: any, i: number) => {
                                                const pass = isPassingGrade(g.scoreText);
                                                return `
                                                  <tr>
                                                    <td style="text-align: center;">${i + 1}</td>
                                                    <td><strong>${g.subject}</strong></td>
                                                    <td style="text-align: center;">${g.maxScore || 100}</td>
                                                    <td style="text-align: center;">${g.passingScore || 50}</td>
                                                    <td style="text-align: center;"><strong>${g.scoreText}</strong></td>
                                                    <td style="text-align: center;">
                                                      <span style="font-weight: bold; color: ${pass === null ? '#666' : (pass ? '#059669' : '#dc2626')};">
                                                        ${pass === null ? "-" : (pass ? "ناجح" : "راسب")}
                                                      </span>
                                                    </td>
                                                  </tr>
                                                `;
                                              }).join("")}
                                          </tbody>
                                        </table>

                                        <!-- 3. Failed/Carryover Subjects (مواد التخلف) -->
                                        ${(resultSearchResult.backlogSubjects && resultSearchResult.backlogSubjects.length > 0) ? `
                                          <div style="margin-top: 15px; margin-bottom: 15px; border: 1px solid #fda4af; background-color: #fff1f2; padding: 12px; border-radius: 8px;">
                                            <strong style="color: #be123c;">مواد التخلف:</strong>
                                            <ul style="list-style-type: none; margin: 5px 0 0 0; padding-right: 0; font-size: 13px; line-height: 1.6;">
                                              ${resultSearchResult.backlogSubjects.map((sub: any) => `
                                                <li style="margin-bottom: 8px;">
                                                  <strong>- المادة:</strong> ${sub.subject} <br/>
                                                  &nbsp;&nbsp;<strong>التقدير:</strong> <strong>${sub.scoreText}</strong>
                                                </li>
                                              `).join("")}
                                            </ul>
                                          </div>
                                        ` : ""}

                                        ${((resultSearchResult.socialDevelopment && resultSearchResult.socialDevelopment !== "-" && resultSearchResult.socialDevelopment !== "0") || 
                                          (resultSearchResult.economicDevelopment && resultSearchResult.economicDevelopment !== "-" && resultSearchResult.economicDevelopment !== "0") || 
                                          (resultSearchResult.communicationMeans && resultSearchResult.communicationMeans !== "-" && resultSearchResult.communicationMeans !== "0") || 
                                          (resultSearchResult.carriedSubjects && resultSearchResult.carriedSubjects !== "-" && resultSearchResult.carriedSubjects !== "0")) ? `
                                          <div style="margin-top: 15px; margin-bottom: 15px; border: 1px solid #fcd34d; background-color: #fffbeb; padding: 12px; border-radius: 8px;">
                                            <strong style="color: #b45309;">بيان المواد المحمولة:</strong>
                                            <ul style="margin: 5px 0 0 0; padding-right: 20px; font-size: 13px; line-height: 1.6;">
                                              ${resultSearchResult.socialDevelopment && resultSearchResult.socialDevelopment !== "-" && resultSearchResult.socialDevelopment !== "0" ? `
                                                <li>مادة محمولة: تنمية اجتماعية - تقديرها: <strong>${resultSearchResult.socialDevelopment}</strong></li>
                                              ` : ""}
                                              ${resultSearchResult.economicDevelopment && resultSearchResult.economicDevelopment !== "-" && resultSearchResult.economicDevelopment !== "0" ? `
                                                <li>مادة محمولة: تنمية اقتصادية - تقديرها: <strong>${resultSearchResult.economicDevelopment}</strong></li>
                                              ` : ""}
                                              ${resultSearchResult.communicationMeans && resultSearchResult.communicationMeans !== "-" && resultSearchResult.communicationMeans !== "0" ? `
                                                <li>مادة محمولة: وسائل اتصال - تقديرها: <strong>${resultSearchResult.communicationMeans}</strong></li>
                                              ` : ""}
                                              ${resultSearchResult.carriedSubjects && resultSearchResult.carriedSubjects !== "-" && resultSearchResult.carriedSubjects !== "0" ? `
                                                <li>المواد المحمولة الكلية: <strong>${resultSearchResult.carriedSubjects}</strong></li>
                                              ` : ""}
                                            </ul>
                                          </div>
                                        ` : ""}

                                        <div class="stats-grid" style="grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap: 10px; margin-top: 15px; margin-bottom: 15px;">
                                           ${resultSearchResult.totalScore && resultSearchResult.totalScore !== "-" && resultSearchResult.totalScore !== "0" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>المجموع الكلي:</strong><br/>
                                               <span style="font-size: 14px; font-weight: bold;">${resultSearchResult.totalScore}</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.percentage && resultSearchResult.percentage !== "-" && resultSearchResult.percentage !== "0" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>النسبة المئوية:</strong><br/>
                                               <span style="font-size: 14px; font-weight: bold; color: #10b981;">${resultSearchResult.percentage}%</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.gradeYear4 && resultSearchResult.gradeYear4 !== "-" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>تقدير رابعة:</strong><br/>
                                               <span style="font-size: 13px; font-weight: bold; color: #b45309;">${resultSearchResult.gradeYear4}</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.totalYear1 && resultSearchResult.totalYear1 !== "-" && resultSearchResult.totalYear1 !== "0" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>مجموع الأولى:</strong><br/>
                                               <span style="font-size: 13px; font-weight: bold;">${resultSearchResult.totalYear1}</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.totalYear2 && resultSearchResult.totalYear2 !== "-" && resultSearchResult.totalYear2 !== "0" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>مجموع الثانية:</strong><br/>
                                               <span style="font-size: 13px; font-weight: bold;">${resultSearchResult.totalYear2}</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.totalYear3 && resultSearchResult.totalYear3 !== "-" && resultSearchResult.totalYear3 !== "0" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>مجموع الثالثة:</strong><br/>
                                               <span style="font-size: 13px; font-weight: bold;">${resultSearchResult.totalYear3}</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.cumulativeTotal && resultSearchResult.cumulativeTotal !== "-" && resultSearchResult.cumulativeTotal !== "0" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>المجموع التراكمي:</strong><br/>
                                               <span style="font-size: 14px; font-weight: bold;">${resultSearchResult.cumulativeTotal}</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.cumulativePercentage && resultSearchResult.cumulativePercentage !== "-" && resultSearchResult.cumulativePercentage !== "0" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>النسبة التراكمية العامة:</strong><br/>
                                               <span style="font-size: 14px; font-weight: bold; color: #0d9488;">${resultSearchResult.cumulativePercentage}%</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.generalGrade && resultSearchResult.generalGrade !== "-" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>التقدير العام:</strong><br/>
                                               <span style="font-size: 13px; font-weight: bold; color: #0d9488;">${resultSearchResult.generalGrade}</span>
                                             </div>
                                           ` : ""}
                                           ${resultSearchResult.addedDegrees && resultSearchResult.addedDegrees !== "-" && resultSearchResult.addedDegrees !== "0" ? `
                                             <div class="stat-box" style="padding: 8px;">
                                               <strong>درجات مضافة للتراكمي:</strong><br/>
                                               <span style="font-size: 13px; font-weight: bold; color: #b45309;">${resultSearchResult.addedDegrees}</span>
                                             </div>
                                           ` : ""}
                                         </div>

                                         ${(resultSearchResult.studentStatus || resultSearchResult.studentOpportunities || resultSearchResult.failedSubjects || resultSearchResult.notes) ? `
                                           <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; padding: 12px; border-radius: 8px; margin-top: 15px; margin-bottom: 20px;">
                                             ${resultSearchResult.studentStatus && resultSearchResult.studentStatus !== "-" ? `<p style="margin: 4px 0;"><strong>حالة الطالب:</strong> ${resultSearchResult.studentStatus}</p>` : ""}
                                             ${resultSearchResult.studentOpportunities && resultSearchResult.studentOpportunities !== "-" && resultSearchResult.studentOpportunities !== "0" ? `<p style="margin: 4px 0;"><strong>عدد الفرص:</strong> ${resultSearchResult.studentOpportunities}</p>` : ""}
                                             ${resultSearchResult.failedSubjects && resultSearchResult.failedSubjects !== "-" && resultSearchResult.failedSubjects !== "0" ? `<p style="margin: 4px 0; color: #dc2626;"><strong>مواد الرسوب:</strong> ${resultSearchResult.failedSubjects}</p>` : ""}
                                             ${resultSearchResult.notes && resultSearchResult.notes !== "-" ? `<p style="margin: 4px 0; color: #047857;"><strong>ملاحظات لجنة الكنترول:</strong> ${resultSearchResult.notes}</p>` : ""}
                                           </div>
                                         ` : ""}

                                         <div style="display: none;">
                                         <div class="stats-grid" style="grid-template-columns: repeat(${[resultSearchResult.totalScore, resultSearchResult.percentage, resultSearchResult.generalGrade, resultSearchResult.rank].filter(x => x && x !== "-").length}, 1fr);">
                                          ${resultSearchResult.totalScore && resultSearchResult.totalScore !== "-" ? `
                                            <div class="stat-box">
                                              <strong>المجموع الكلي:</strong><br/>
                                              <span style="font-size: 18px; font-weight: bold;">${resultSearchResult.totalScore} / ${resultSearchResult.grades ? (resultSearchResult.grades.length * 100) : "١٥٠٠"}</span>
                                            </div>
                                          ` : ""}
                                          ${resultSearchResult.percentage && resultSearchResult.percentage !== "-" ? `
                                            <div class="stat-box">
                                              <strong>النسبة المئوية:</strong><br/>
                                              <span style="font-size: 18px; font-weight: bold; color: #10b981;">${resultSearchResult.percentage}%</span>
                                            </div>
                                          ` : ""}
                                          ${resultSearchResult.generalGrade && resultSearchResult.generalGrade !== "-" ? `
                                            <div class="stat-box">
                                              <strong>التقدير العام:</strong><br/>
                                              <span style="font-size: 16px; font-weight: bold; color: #0d9488;">${resultSearchResult.generalGrade}</span>
                                            </div>
                                          ` : ""}
                                          ${resultSearchResult.rank && resultSearchResult.rank !== "-" ? `
                                            <div class="stat-box">
                                              <strong>الترتيب العام:</strong><br/>
                                              <span style="font-size: 18px; font-weight: bold; color: #db2777;">👑 ${resultSearchResult.rank}</span>
                                            </div>
                                          ` : ""}
                                        </div>

                                        ${resultSearchResult.notes && resultSearchResult.notes !== "-" ? `
                                          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                                            <strong>ملاحظات لجنة الكنترول:</strong> ${resultSearchResult.notes}
                                          </div>
                                        ` : ""}

                                        </div>
                                         <div class="signature-footer">
                                          <div>
                                            <p><strong>رئيس الكنترول العام</strong></p>
                                            <p style="color: #666; font-size: 11px;">أ.د. عميد الكنترول بالمعهد</p>
                                          </div>
                                          <div class="stamp">
                                            المعهد العالي<br/>للخدمة الاجتماعية<br/>بأسوان
                                          </div>
                                          <div style="text-align: left;">
                                            <p><strong>ASWAN-INSTITUTE-2026</strong></p>
                                            <p style="color: #666; font-size: 10px;">المصادقة الإلكترونية</p>
                                          </div>
                                        </div>
                                      </div>
                                      <script>
                                        window.onload = function() {
                                          window.print();
                                          window.close();
                                        }
                                      </script>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              }
                            }
                          }}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-black text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5"
                        >
                          <span>🖨️ {isAr ? "طباعة بيان الدرجات الرسمي" : "Print Official Grade Sheet"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setResultSearchResult(null); setSeatNumber(""); }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5"
                        >
                          <span>🔍 {isAr ? "استعلام عن رقم جلوس آخر" : "Check Another Seat Number"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={authMode === "admission" ? handleSubmitAdmission : handleAuthSubmit} className="space-y-4">
                
                {authMode === "admission" && (
                  <>
                    {/* الاستعلام عن حالة الطلب والحصول على الحساب */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-right space-y-4 mb-6">
                      <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                        <span>🔍 {isAr ? "استعلام عن حالة التقديم واستلام الحساب الجامعي:" : "Check Admission & Account Status:"}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                        {isAr 
                          ? "هل قمت بتقديم طلبك بالفعل؟ أدخل كود التتبع (مثل ASW-2026-1234) أو رقمك القومي لمعرفة حالة قبولك واستلام بريدك الجامعي وكلمة المرور فوراً."
                          : "Already applied? Enter your tracking code (e.g. ASW-2026-1234) or National ID to fetch your official account credentials."}
                      </p>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={lookupAppId}
                          onChange={(e) => setLookupAppId(e.target.value)}
                          placeholder={isAr ? "كود التتبع أو الرقم القومي..." : "Tracking code or National ID..."}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 font-mono text-center"
                        />
                        <button
                          type="button"
                          onClick={handleLookupAdmission}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md shrink-0"
                        >
                          {lookupLoading ? (isAr ? "جاري..." : "Checking...") : (isAr ? "استعلام" : "Lookup")}
                        </button>
                      </div>

                      {lookupError && (
                        <p className="text-[10px] text-red-400 font-bold">{lookupError}</p>
                      )}

                      {lookupResult && (
                        <div className="p-3 bg-slate-950 border border-indigo-900/40 rounded-xl space-y-2 text-xs font-medium animate-in slide-in-from-top duration-200">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1.5">
                            <span className="font-extrabold text-[11px] text-slate-300">{lookupResult.fullName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              lookupResult.status === "approved" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : lookupResult.status === "rejected"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            }`}>
                              {lookupResult.status === "approved" ? (isAr ? "مقبول مبدئياً ✅" : "Approved ✅") : lookupResult.status === "rejected" ? (isAr ? "مرفوض ❌" : "Rejected ❌") : (isAr ? "تحت الدراسة والفرز ⏱️" : "Under Review ⏱️")}
                            </span>
                          </div>

                          {lookupResult.status === "approved" ? (
                            <div className="space-y-2">
                              <p className="text-[10px] text-emerald-400 font-bold">
                                {isAr 
                                  ? "🎉 مبارك! تم اعتماد ملفك الأكاديمي وتفعيل حسابك الموحد. استخدم البيانات التالية لتسجيل الدخول مباشرة للبوابة:" 
                                  : "🎉 Congratulations! Your academic file has been approved. Use these credentials to login:"}
                              </p>
                              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5 font-sans font-medium text-slate-300">
                                <div className="flex justify-between items-center">
                                  <span>{isAr ? "البريد الإلكتروني الجامعي:" : "Official Academic Email:"}</span>
                                  <span className="font-mono text-white font-bold select-all">{lookupResult.academicEmail}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>{isAr ? "كلمة المرور المؤقتة:" : "Temporary Password:"}</span>
                                  <span className="font-mono text-white font-bold select-all">{lookupResult.academicPassword || "aswan123456"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>{isAr ? "كود الطالب الجامعي:" : "Student Academic ID:"}</span>
                                  <span className="font-mono text-indigo-400 font-bold select-all">{lookupResult.generatedStudentId}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEmail(lookupResult.academicEmail);
                                  setPassword(lookupResult.academicPassword || "aswan123456");
                                  setAuthMode("login");
                                  setLookupResult(null);
                                  setLookupAppId("");
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-2 rounded-xl transition-all cursor-pointer shadow-md text-center mt-1"
                              >
                                {isAr ? "نسخ البيانات والتوجه لتسجيل الدخول ➡️" : "Fill & Go to Login ➡️"}
                              </button>
                            </div>
                          ) : lookupResult.status === "rejected" ? (
                            <p className="text-[10px] text-red-400 font-bold leading-normal">
                              {isAr 
                                ? "لم يتم قبول هذا الملف الأكاديمي للتنسيق الحالي. يرجى التواصل مع عمادة القبول والتسجيل بفرع أسوان." 
                                : "This file was not accepted for current intake. Contact youth welfare office."}
                            </p>
                          ) : (
                            <p className="text-[10px] text-yellow-400 font-bold leading-normal animate-pulse">
                              {isAr 
                                ? "طلبك قيد المراجعة والتدقيق المالي الآن. ستظهر بيانات حسابك الجامعي فور اعتماد ملفك من قِبل عميد المعهد." 
                                : "Your request is under review. Credentials will appear here as soon as approved."}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 text-right space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{isAr ? "إرشادات هامة للتقديم الإلكتروني والمصروفات:" : "Admissions & Annual Fees Guidance:"}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-bold leading-relaxed">
                        {isAr 
                          ? "سداد المصروفات الدراسية بالمعهد يكون سنوياً للطلاب الجدد. لتفعيل طلب التقديم، يجب إدخال كود السداد/الرمز التعريفي لإيصال دفع المصاريف السنوية بالبنك كإثبات رسمي على الدفع السنوي."
                          : "Tuition fees at the institute are paid annually. To activate your request, please provide your payment/receipt code from the annual bank deposit receipt."}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-black leading-relaxed">
                        {isAr
                          ? "💡 تذكير: الحسابات والبريد الإلكتروني الجامعي يتم إنشاؤها وتوفيرها حصرياً من قِبل إدارة المعهد وتُسلم للطلاب رسمياً بعد قبولهم."
                          : "💡 Note: All official student emails are generated by the institute and will be provided to you upon approval of your registration."}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "الاسم الكامل للطالب (ثلاثي أو رباعي) 👤:" : "Student Full Name:"}</label>
                      <input
                        type="text"
                        required
                        value={admFullName}
                        onChange={(e) => setAdmFullName(e.target.value)}
                        placeholder={isAr ? "اكتب الاسم مطابق لشهادة الميلاد" : "Enter full name"}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "رقم الهاتف / الواتساب 📞:" : "Phone / WhatsApp:"}</label>
                        <input
                          type="tel"
                          required
                          value={admPhone}
                          onChange={(e) => setAdmPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "مجموع الثانوية العامة (%) 📝:" : "High School Score (%):"}</label>
                        <input
                          type="text"
                          required
                          value={admHighSchool}
                          onChange={(e) => setAdmHighSchool(e.target.value)}
                          placeholder="85.5% / 320"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "الرقم القومي للطالب (14 رقم) 💳:" : "National ID Number (14 digits):"}</label>
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={admNationalId}
                        onChange={(e) => setAdmNationalId(e.target.value)}
                        placeholder="299xxxxxxxxxxx"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "العنوان السكني بالكامل بالتفصيل 📍:" : "Residential Address:"}</label>
                      <input
                        type="text"
                        required
                        value={admAddress}
                        onChange={(e) => setAdmAddress(e.target.value)}
                        placeholder={isAr ? "المحافظة، المدينة، اسم الشارع، رقم المنزل" : "Governorate, City, Street name, House No."}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "كود السداد لتأكيد دفع المصاريف السنوية 💵:" : "Annual Fee Payment Receipt Code:"}</label>
                      <input
                        type="text"
                        required
                        value={admReceiptCode}
                        onChange={(e) => setAdmReceiptCode(e.target.value)}
                        placeholder={isAr ? "مثال: REC-5026 أو رقم المعاملة البنكية" : "e.g., REC-5026 or Bank Transaction ID"}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-emerald-400 font-mono"
                      />
                      <span className="block text-[9px] text-slate-400 font-bold mt-1">*{isAr ? "سداد المصروفات سنوي للطلاب الجدد، أدخل الكود لتفعيل طلبك." : "Tuition is paid annually for freshmen; enter code to activate."}</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "رغبات أو ملاحظات أخرى (اختياري) ✉️:" : "Notes or Special Remarks:"}</label>
                      <textarea
                        value={admNotes}
                        onChange={(e) => setAdmNotes(e.target.value)}
                        placeholder={isAr ? "أي ملاحظات إضافية ترغب في إرسالها لإدارة المعهد..." : "Any additional notes..."}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white resize-none"
                      />
                    </div>
                  </>
                )}

                {authMode === "signup" && (
                  <>
                    <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 text-right mb-4">
                      <p className="text-[10px] text-amber-400 font-bold leading-relaxed">
                        {isAr
                          ? "⚠️ تنبيه هام: البريد الإلكتروني الجامعي لكل طالب يتم إنشاؤه وتوفيره حصرياً من قِبل إدارة المعهد ولا يتم إنشاؤه عشوائياً. يرجى تفعيل حسابك بالبريد الإلكتروني الجامعي الرسمي (@aswan.edu) المسلم إليك بعد قبول طلب الالتحاق."
                          : "⚠️ Important: All student emails are created and provided solely by the institute. Please activate your account using your official student email (@aswan.edu) provided to you after admission approval."}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "نوع الحساب الأكاديمي المتاح للتسجيل:" : "Available Academic Registration Role:"}</span>
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-right">
                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                          <User className="w-4 h-4 shrink-0" />
                          <span>{isAr ? "حساب طالب مقيد بالمعهد العالي للخدمة الاجتماعية" : "Enrolled Student Account"}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                          {isAr 
                            ? "ملاحظة أمنية: تماشياً مع معايير الأمان المعتمدة بمعهد أسوان، فإن التسجيل المباشر متاح فقط للطلاب. أما حسابات السادة أعضاء هيئة التدريس والدكاترة والمدراء، فيتم إنشاؤها وتفعيلها حصرياً عبر شؤون الطلاب ولوحة التحكم الإدارية منعاً لانتحال الصفة."
                            : "Security Notice: Direct registration is open only for students. Faculty staff, doctors, and administrator accounts are strictly pre-created and assigned by the general administration to ensure identity verification."}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "الاسم الكامل للطالب أو الأستاذ أو المدير:" : "Full Academic Name:"}</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={isAr ? "اكتب اسمك الثلاثي بالكامل" : "Enter your full name"}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                    </div>

                    {role === "student" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "الفرقة الدراسية الحالية:" : "Academic Year:"}</label>
                          <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white"
                          >
                            <option value="الفرقة الأولى">{isAr ? "الفرقة الأولى" : "1st Year"}</option>
                            <option value="الفرقة الثانية">{isAr ? "الفرقة الثانية" : "2nd Year"}</option>
                            <option value="الفرقة الثالثة">{isAr ? "الفرقة الثالثة" : "3rd Year"}</option>
                            <option value="الفرقة الرابعة">{isAr ? "الفرقة الرابعة" : "4th Year"}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "القسم / الشعبة:" : "Department:"}</label>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white"
                          >
                            <option value="شعبة الخدمة الاجتماعية">{isAr ? "شعبة الخدمة الاجتماعية" : "Social Work"}</option>
                            <option value="شعبة التخطيط والمجتمعات">{isAr ? "شعبة التخطيط" : "Planning"}</option>
                          </select>
                        </div>
                      </div>
                    ) : role === "admin" ? (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "كود المدير السري للتسجيل:" : "Secret Admin Register Passkey:"}</label>
                        <input
                          type="password"
                          required
                          value={professorPasscode}
                          onChange={(e) => setProfessorPasscode(e.target.value)}
                          placeholder={isAr ? "اكتب الكود (للتجربة: admin2026)" : "Admin register token (e.g. admin2026)"}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white font-mono tracking-widest"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "كود هيئة التدريس السري المعطى لك:" : "Secret Faculty Passkey:"}</label>
                        <input
                          type="password"
                          required
                          value={professorPasscode}
                          onChange={(e) => setProfessorPasscode(e.target.value)}
                          placeholder={isAr ? "اكتب الكود (للتجربة: prof123)" : "Faculty token (e.g. prof123)"}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white font-mono tracking-widest"
                        />
                      </div>
                    )}
                  </>
                )}

                {authMode !== "admission" && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "البريد الإلكتروني الجامعي أو الشخصي:" : "Email Address:"}</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={isAr ? "example@aswan.edu" : "name@example.com"}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "كلمة المرور السرية:" : "Secret Password:"}</label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingAdmission}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmittingAdmission ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>
                    {authMode === "login" 
                      ? (isAr ? "دخول آمن للبوابة" : "Secure Login") 
                      : authMode === "admission"
                      ? (isAr ? "إرسال طلب التقديم السنوي للالتحاق" : "Submit Admission Request")
                      : (isAr ? "تفعيل حساب طالب مسجل" : "Register Now")
                    }
                  </span>
                </button>
              </form>
              )}
            </div>
          </div>
        ) : (
          
          /* ------------------------------------------------------------- */
          /* واجهة لوحة تحكم الطالب الكاملة (Student Dashboard System) */
          /* ------------------------------------------------------------- */
          userProfile?.role === "student" ? (
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-right" dir={isAr ? "rtl" : "ltr"}>
              
              {/* شريط ملاحة جانبي فخم يطابق البوابات العالمية */}
              <div className="lg:col-span-3 space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-full flex items-center justify-center text-white text-xl font-black mx-auto mb-3 shadow-inner">
                    {userProfile?.fullName?.charAt(0)}
                  </div>
                  <h3 className="font-extrabold text-sm text-white line-clamp-1">{userProfile?.fullName}</h3>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full inline-block mt-2 font-mono">
                    {userProfile?.studentId || "ST-2026-REG"}
                  </span>
                  <div className="text-[11px] text-slate-400 font-bold mt-2 pt-2 border-t border-slate-800">
                    <p>{userProfile?.academicYear}</p>
                    <p className="text-[10px] text-slate-500">{userProfile?.department}</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1">
                  <button
                    onClick={() => setStudentTab("dashboard")}
                    className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                      studentTab === "dashboard" 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{isAr ? "نظرة عامة واللوائح" : "Dashboard Overview"}</span>
                  </button>

                  <button
                    onClick={() => { setStudentTab("courses"); setSelectedCourse(null); setViewingLecture(null); }}
                    className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                      studentTab === "courses" 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{isAr ? "المواد والمحاضرات الرقمية" : "My Lectures & Materials"}</span>
                  </button>

                  <button
                    onClick={() => setStudentTab("grades")}
                    className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                      studentTab === "grades" 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>{isAr ? "النتائج وبيان الدرجات" : "Grades & Transcript"}</span>
                  </button>

                  <button
                    onClick={() => setStudentTab("payments")}
                    className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                      studentTab === "payments" 
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isAr ? "الرسوم والمصروفات الدراسية" : "Tuition Billing"}</span>
                  </button>
                </div>
              </div>

              {/* لوحة عرض التبويب النشط للطالب */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* 1. تبويب: نظرة عامة (Dashboard Overview) */}
                {studentTab === "dashboard" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-l from-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>
                      <div className="space-y-3 relative z-10">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-3.5 py-1 rounded-full border border-emerald-500/20 inline-block">
                          {isAr ? "مرحباً بك مجدداً في الحرم الرقمي لأسوان" : "Welcome back to Aswan Digital Campus"}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-white">
                          {isAr ? `أهلاً بك يا ${userProfile?.fullName}` : `Hello, ${userProfile?.fullName}`}
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed max-w-2xl">
                          {isAr 
                            ? "مستعد لبدء المحاضرة؟ ننصحك بمتابعة المقررات الدراسية والتواصل المستمر مع الأساتذة عبر متابعة الملفات المرفقة ومراجعة سجل الدرجات." 
                            : "Ready to start learning? We recommend keeping up with your uploaded lectures and verifying your results constantly."}
                        </p>
                      </div>
                    </div>

                    {/* كروت الإحصائيات العلوية */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">{isAr ? "النسبة العامة للنجاح" : "Overall Percentage"}</span>
                          <span className="text-2xl font-black text-emerald-400">{calculateAveragePercentage()}</span>
                          <span className="text-[9px] block text-slate-500 font-semibold">{getPercentageGradeWord(calculateAveragePercentage())}</span>
                        </div>
                        <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                          <Award className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">{isAr ? "المقررات المسجلة" : "Registered Courses"}</span>
                          <span className="text-2xl font-black text-white">{courseMaterials.length > 0 ? Array.from(new Set(courseMaterials.map(m => m.subject))).length : 4}</span>
                          <span className="text-[9px] block text-slate-500 font-semibold">{isAr ? "مقررات الفصل الحالي" : "Courses this term"}</span>
                        </div>
                        <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">{isAr ? "المصروفات غير المدفوعة" : "Outstanding Tuition"}</span>
                          <span className="text-2xl font-black text-yellow-500">
                            {myPayments.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0)} {isAr ? "ج.م" : "EGP"}
                          </span>
                          <span className="text-[9px] block text-slate-500 font-semibold">{isAr ? "بوابة السداد المباشر متاحة" : "Direct payment active"}</span>
                        </div>
                        <div className="bg-yellow-500/10 p-3 rounded-xl text-yellow-500">
                          <CreditCard className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* لوائح التدريب الميداني والخدمات */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5 border-b border-slate-800 pb-3">
                        <HelpingHand className="w-5 h-5 text-emerald-400" />
                        <span>{isAr ? "دليل ومنهجية التدريب العملي الميداني بأسوان" : "Practical Placement & Field Training Protocol"}</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        {isAr 
                          ? "يهدف المعهد العالي للخدمة الاجتماعية بأسوان لربط المادة التعليمية بالواقع المجتمعي بأسوان ومحافظات الصعيد. يقضي طلاب الفرقة الثالثة والرابعة 4 فصول دراسية كاملة كفترة تدريبية إلزامية معتمدة داخل: مستشفيات أسوان العامة، لجان التربية والتعليم، مراكز ذوي الاحتياجات الخاصة، والجمعيات الخيرية."
                          : "Our accredited curriculum ensures graduate readiness through mandatory field assignments inside Upper Egypt healthcare systems, Aswan public schools, specialized rehabilitation facilities, and local civil organizations."}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. تبويب: المقررات والمحاضرات والمذاكرة الرقمية */}
                {studentTab === "courses" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="text-lg font-black text-white">{isAr ? "المحاضرات والمواد المرفوعة" : "Study Course Lectures & Materials"}</h2>
                        <p className="text-xs text-slate-400 font-bold">{isAr ? `المقررات المخصصة لطلاب: ${userProfile?.academicYear}` : `Assigned curriculum resources`}</p>
                      </div>
                    </div>

                    {/* مشغل الفيديو المدمج في حال اختيار محاضرة مرئية */}
                    {viewingLecture && (
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl animate-in scale-in duration-300">
                        <div className="flex justify-between items-start gap-4 border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-[10px] bg-red-500/10 text-red-400 font-bold px-2 py-0.5 rounded-full block w-fit mb-1">
                              {isAr ? "مشاهدة المحاضرة المباشرة" : "Streaming recorded video"}
                            </span>
                            <h3 className="font-extrabold text-sm text-white">{viewingLecture.title}</h3>
                          </div>
                          <button
                            onClick={() => setViewingLecture(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            {isAr ? "إغلاق المشاهدة" : "Close Player"}
                          </button>
                        </div>
                        {viewingLecture.type === "video" ? (
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-md">
                            <iframe
                              src={viewingLecture.url}
                              title="Lecture Video Player"
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                            <FileText className="w-10 h-10 text-emerald-400 mx-auto" />
                            <p className="text-xs text-slate-300 font-semibold text-center">
                              {isAr ? "هذه المادة عبارة عن مستند دراسي خارجي أو مرجع ويب." : "This material is an external study document or PDF book."}
                            </p>
                            <div className="text-center pt-2">
                              <a
                                href={viewingLecture.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>{isAr ? "تصفح وتحميل المستند الآن" : "Browse & Download PDF"}</span>
                              </a>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                          {viewingLecture.description || (isAr ? "لا يوجد وصف إضافي لهذه المحاضرة." : "No additional description.")}
                        </p>
                      </div>
                    )}

                    {courseMaterials.length === 0 ? (
                      <div className="text-center py-16 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                        <BookOpen className="w-12 h-12 text-slate-700 mx-auto" />
                        <h4 className="font-extrabold text-sm text-slate-300">{isAr ? "لم يتم رفع مقررات دراسية بعد!" : "No lectures uploaded yet!"}</h4>
                        <p className="text-xs text-slate-500 font-bold max-w-xs mx-auto">
                          {isAr 
                            ? "لم يقم الأساتذة والدكاترة بإرفاق محاضرات لفرقتك الأكاديمية حتى الآن. يرجى المتابعة لاحقاً." 
                            : "No faculty members have uploaded books or recorded videos for your academic year yet."}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courseMaterials.map((mat) => (
                          <div key={mat.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 relative group">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-md">
                                  {mat.subject}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{mat.createdAt ? new Date(mat.createdAt).toLocaleDateString() : "٢٠٢٦"}</span>
                                </span>
                              </div>

                              <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                                {mat.title}
                              </h3>
                              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-semibold">
                                {mat.description || (isAr ? "وصف ومستندات دراسية تابعة للمادة المعتمدة في معهد أسوان للخدمة الاجتماعية." : "Detailed academic documents.")}
                              </p>
                            </div>

                            <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 font-bold">— د. {mat.professorName}</span>
                              
                              <button
                                onClick={() => setViewingLecture(mat)}
                                className="bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer border border-slate-800 hover:border-transparent flex items-center gap-1.5 shadow-md"
                              >
                                {mat.type === "video" ? <Video className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                <span>{isAr ? "افتح المذاكرة 📖" : "Open Lecture"}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. تبويب: النتائج والدرجات (Grades System) */}
                {studentTab === "grades" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="text-lg font-black text-white">{isAr ? "بيان النجاح وسجل الدرجات الموثق" : "Official Academic Grades Report"}</h2>
                        <p className="text-xs text-slate-400 font-bold">{isAr ? "نتائج الامتحانات المعتمدة للفصل الدراسي الحالي" : "Accredited exam scores and cumulative performance"}</p>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="bg-slate-950 hover:bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl border border-slate-800 hover:border-transparent transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <Printer className="w-4 h-4" />
                        <span>{isAr ? "طباعة الشهادة الرسمية" : "Print Certificate"}</span>
                      </button>
                    </div>

                    {hasUnpaidDues ? (
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-6 max-w-2xl mx-auto shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500"></div>
                        <div className="bg-red-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center text-red-400 mx-auto border border-red-500/20 shadow-inner animate-pulse">
                          <Lock className="w-10 h-10" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-white">{isAr ? "النتائج والتقديرات مقفلة مؤقتاً 🔒" : "Academic Results Temporarily Locked 🔒"}</h3>
                          <p className="text-xs text-slate-400 font-bold leading-relaxed">
                            {isAr 
                              ? "تنبيه أكاديمي: بموجب اللائحة المالية المعتمدة للكلية، فإنه لا يُسمح للطلاب بالاطلاع على التقديرات والدرجات وشهادات النجاح للفصل الدراسي الحالي قبل سداد كامل المصروفات والرسوم الدراسية المترتبة عليهم."
                              : "Academic Alert: Under the college's approved financial regulations, students are not permitted to view their grades, transcript, or academic progress before fully clearing all outstanding tuition and fee payments."}
                          </p>
                        </div>

                        {/* كشف الديون المستحقة السريع */}
                        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 text-right space-y-3">
                          <span className="text-[10px] text-slate-500 font-bold block">{isAr ? "المستحقات المالية المتأخرة والواجبة السداد:" : "Unpaid Financial Dues:"}</span>
                          {myPayments.filter(p => !p.paid).map(p => (
                            <div key={p.id} className="flex justify-between items-center text-xs font-semibold border-b border-slate-850 pb-2 last:border-none last:pb-0">
                              <span className="text-slate-300 font-bold">{p.title}</span>
                              <span className="text-yellow-500 font-mono font-black">{p.amount} {isAr ? "ج.م" : "EGP"}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => setStudentTab("payments")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>{isAr ? "انتقل إلى صفحة الدفع والاصدار المالي 💳" : "Go to Payment Center 💳"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-xl">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
                          <div className="text-center md:text-right space-y-2">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-3 py-0.5 rounded-full">
                              {isAr ? "المجلس الأعلى للجامعات" : "Supreme Council of Universities"}
                            </span>
                            <h3 className="font-extrabold text-sm text-slate-300">{userProfile?.fullName}</h3>
                            <p className="text-xs text-slate-500 font-bold">{isAr ? `السجل المعتمد لفرقة: ${userProfile?.academicYear}` : `Undergraduate Transcript`}</p>
                          </div>

                          <div className="flex items-center gap-6 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl">
                            <div className="text-center">
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">{isAr ? "النسبة العامة" : "Overall Percentage"}</span>
                              <span className="text-3xl font-black text-emerald-400">{calculateAveragePercentage()}</span>
                            </div>
                            <div className="h-10 w-[1px] bg-slate-800"></div>
                            <div className="text-center">
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">{isAr ? "التقدير العام" : "Overall Grade"}</span>
                              <span className="text-xs font-extrabold text-white bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block mt-0.5">
                                {getPercentageGradeWord(calculateAveragePercentage())}
                              </span>
                            </div>
                          </div>
                        </div>

                        {myGrades.length === 0 ? (
                          <div className="text-center py-16 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                            <Award className="w-12 h-12 text-slate-700 mx-auto" />
                            <h4 className="font-extrabold text-sm text-slate-300">{isAr ? "لم يتم إدخال درجات رسمية حتى الآن!" : "No grades published yet!"}</h4>
                            <p className="text-xs text-slate-500 font-bold max-w-xs mx-auto">
                              {isAr 
                                ? "بمجرد قيام أساتذة المواد والدكاترة برصد درجات امتحاناتك من لوحة التحكم الخاصة بهم، ستظهر في هذا الكشف مباشرة." 
                                : "Once professors enter your exam scores from their panels, they will populate here instantly."}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-6">
                            {/* الفصل الدراسي الأول */}
                            {(() => {
                              const term1Grades = myGrades.filter(g => g.term === "الترم الأول" || g.term === "Term 1");
                              const term1Percentage = calculateAveragePercentage(term1Grades);
                              return (
                                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                      <span>{isAr ? "نتائج الفصل الدراسي الأول (الترم الأول)" : "First Semester Results (Term 1)"}</span>
                                    </h4>
                                    <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full">
                                      {isAr ? `متوسط الدرجات: ${term1Percentage}` : `Average Score: ${term1Percentage}`}
                                    </span>
                                  </div>

                                  {term1Grades.length === 0 ? (
                                    <p className="text-xs text-slate-500 font-bold italic py-4 text-center">{isAr ? "لا توجد مواد مرصودة في الترم الأول." : "No grades recorded for Term 1."}</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-right text-xs sm:text-sm">
                                        <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[10px] font-black uppercase">
                                          <tr>
                                            <th className="p-3">{isAr ? "المادة الدراسية" : "Course Subject"}</th>
                                            <th className="p-3 text-center">{isAr ? "الدرجة المستحقة" : "Score"}</th>
                                            <th className="p-3 text-center">{isAr ? "النهاية الكبرى" : "Max Mark"}</th>
                                            <th className="p-3 text-left">{isAr ? "التقدير" : "Grade"}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {term1Grades.map((g) => (
                                            <tr key={g.id} className="border-b last:border-none border-slate-900 hover:bg-slate-900/40 transition-colors font-semibold">
                                              <td className="p-3 text-white text-right font-black">{g.subject}</td>
                                              <td className="p-3 text-center font-mono text-emerald-400 font-black">{g.score}</td>
                                              <td className="p-3 text-center font-mono text-slate-500">100</td>
                                              <td className="p-3 text-left font-black">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[11px] ${
                                                  g.score >= 50 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                }`}>
                                                  {g.grade}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* الفصل الدراسي الثاني */}
                            {(() => {
                              const term2Grades = myGrades.filter(g => g.term === "الترم الثاني" || g.term === "Term 2" || g.term === "الترم الثانى");
                              const term2Percentage = calculateAveragePercentage(term2Grades);
                              return (
                                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                      <span>{isAr ? "نتائج الفصل الدراسي الثاني (الترم الثاني)" : "Second Semester Results (Term 2)"}</span>
                                    </h4>
                                    <span className="text-[11px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 rounded-full">
                                      {isAr ? `متوسط الدرجات: ${term2Percentage}` : `Average Score: ${term2Percentage}`}
                                    </span>
                                  </div>

                                  {term2Grades.length === 0 ? (
                                    <p className="text-xs text-slate-500 font-bold italic py-4 text-center">{isAr ? "لا توجد مواد مرصودة في الترم الثاني." : "No grades recorded for Term 2."}</p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-right text-xs sm:text-sm">
                                        <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 text-[10px] font-black uppercase">
                                          <tr>
                                            <th className="p-3">{isAr ? "المادة الدراسية" : "Course Subject"}</th>
                                            <th className="p-3 text-center">{isAr ? "الدرجة المستحقة" : "Score"}</th>
                                            <th className="p-3 text-center">{isAr ? "النهاية الكبرى" : "Max Mark"}</th>
                                            <th className="p-3 text-left">{isAr ? "التقدير" : "Grade"}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {term2Grades.map((g) => (
                                            <tr key={g.id} className="border-b last:border-none border-slate-900 hover:bg-slate-900/40 transition-colors font-semibold">
                                              <td className="p-3 text-white text-right font-black">{g.subject}</td>
                                              <td className="p-3 text-center font-mono text-emerald-400 font-black">{g.score}</td>
                                              <td className="p-3 text-center font-mono text-slate-500">100</td>
                                              <td className="p-3 text-left font-black">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[11px] ${
                                                  g.score >= 50 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                                }`}>
                                                  {g.grade}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 4. تبويب: الرسوم والمصروفات الجامعية (أوفلاين - السداد بالخزينة) */}
                {studentTab === "payments" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="text-lg font-black text-white">{isAr ? "حالة الرسوم والمصروفات الجامعية" : "Tuition Fees & Payments Status"}</h2>
                        <p className="text-xs text-slate-400 font-bold">{isAr ? "كشف حساب المصروفات الرسمي والتحصيل بمقر المعهد" : "Official tuition balances and in-person payments tracker"}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-indigo-950 rounded-3xl p-6 space-y-4 shadow-2xl">
                      <div className="flex items-center gap-3 border-b border-slate-900 pb-3">
                        <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-white">
                            {isAr ? "نظام تحصيل الرسوم والمصروفات الدراسي" : "Tuition Payment & Billing Policy"}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {isAr ? "طريقة السداد المعتمدة وحجب النتائج" : "Accredited billing protocol & grades visibility"}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed text-right">
                        {isAr 
                          ? "تنبيه هام: تلتزم الكلية بنظام السداد النقدي المباشر. يتم دفع كافة الرسوم والمصروفات الدراسية أو أقساط لجان التقديم والأنشطة كاش/نقداً بمقر خزينة شؤون الطلاب داخل المعهد بأسوان. بمجرد قيامك بالسداد واستلام الإيصال الورقي، يقوم موظف الخزينة بتفعيل حسابك على النظام فوراً لتظهر لك نتائج الامتحانات والدرجات تلقائياً."
                          : "Important Note: Our institute implements an offline payment collection protocol. All academic tuition, cards, and activities fees must be settled in cash at the Student Affairs & Treasury Office at the Aswan branch. Upon physical payment and receiving your official paper receipt, the system admin will instantly activate your payment status online, unlocking your academic results."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {myPayments.map((p) => (
                        <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative group hover:border-indigo-500/20 transition-all">
                          <div className="space-y-1 text-right">
                            <h3 className="font-extrabold text-sm text-white">{p.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-bold">
                              <p>{isAr ? "موعد الاستحقاق:" : "Due Date:"} <span className="font-mono">{p.dueDate}</span></p>
                              {p.paid && <p className="text-emerald-400">{isAr ? "تاريخ التحصيل بالخزينة:" : "Collected on:"} <span className="font-mono">{p.paidDate}</span></p>}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-900">
                            <div className="text-right">
                              <span className="text-lg font-black text-indigo-400 block">{p.amount} {isAr ? "ج.م" : "EGP"}</span>
                              <span className="text-[9px] text-slate-500 font-bold block">{isAr ? "التحصيل كاش" : "In-person cash"}</span>
                            </div>
                            
                            {p.paid ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                <span>{isAr ? "مسددة بالخزينة ✅" : "Fully Paid ✅"}</span>
                              </span>
                            ) : (
                              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>{isAr ? "مطلوب السداد نقداً ⚠️" : "Pending Cash Payment ⚠️"}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                        {/* قسم البريد الأكاديمي الوارد: إيصالات السداد الرسمية */}
                        <div className="border-t border-slate-800/80 pt-8 mt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Mail className="w-5 h-5 text-teal-400" />
                            <h3 className="text-sm font-black text-white">{isAr ? "البريد الأكاديمي الوارد: إيصالات السداد الرسمية ✉️" : "Academic Inbox: Official Payment Receipts ✉️"}</h3>
                          </div>

                          {selectedEmailReceipt ? (
                            /* عرض الإيميل بالتفصيل الموثق المذهل */
                            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
                              
                              <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                                <div className="space-y-1 text-right">
                                  <p className="text-xs text-slate-400 font-bold">
                                    <span className="text-emerald-400 font-extrabold">{isAr ? "من:" : "From:"}</span> {isAr ? "شؤون الطلاب والتحصيل المالي" : "Student Affairs & Treasury"} <span className="font-mono text-slate-500">&lt;finance-records@aswan.edu&gt;</span>
                                  </p>
                                  <p className="text-xs text-slate-400 font-bold">
                                    <span className="text-emerald-400 font-extrabold">{isAr ? "إلى:" : "To:"}</span> {currentUser?.email}
                                  </p>
                                  <h4 className="text-sm md:text-base font-black text-white pt-2">
                                    {isAr ? `📧 إيصال سداد أكاديمي رسمي: ${selectedEmailReceipt.title}` : `📧 Official Tuition Fee Payment Receipt: ${selectedEmailReceipt.title}`}
                                  </h4>
                                </div>
                                <button
                                  onClick={() => setSelectedEmailReceipt(null)}
                                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-black px-4 py-2 rounded-xl transition-all border border-slate-800 cursor-pointer"
                                >
                                  {isAr ? "العودة لصندوق الوارد" : "Back to Inbox"}
                                </button>
                              </div>

                              {/* تصميم الإيميل الرسمي المطبوع */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6 text-right" dir={isAr ? "rtl" : "ltr"}>
                                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                                  <div className="space-y-1">
                                    <p className="text-xs font-black text-white">{isAr ? "معهد أسوان العالي للخدمة الاجتماعية" : "Aswan Higher Institute of Social Work"}</p>
                                    <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">{isAr ? "إدارة الشؤون المالية والقبول" : "Admission & Finance Department"}</p>
                                  </div>
                                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    {isAr ? "معتمدة ومسددة" : "VERIFIED & PAID"}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs font-extrabold text-slate-300">
                                    {isAr ? `عزيزي الطالب/ة: ${userProfile?.fullName || "عمر محمد مدني رشوان"}` : `Dear Student: ${userProfile?.fullName || "Omar Madni"}`}
                                  </p>
                                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                                    {isAr 
                                      ? "نشكرك على إتمام عملية السداد الإلكتروني بنجاح. نود إخطارك بأنه تم استلام وتوثيق عملية الدفع الخاصة بك لرسوم الفصل الأكاديمي الحالي وفق البيانات الرسمية الموضحة أدناه:" 
                                      : "Thank you for completing your online payment. We are pleased to inform you that your secure transaction has been successfully received, processed, and registered in our central billing system:"}
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 font-bold block">{isAr ? "بند الرسوم المسددة:" : "Payment Item Title:"}</span>
                                    <span className="font-extrabold text-white">{selectedEmailReceipt.title}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 font-bold block">{isAr ? "رقم مرجع المعاملة (الرقم المرجعي):" : "Transaction Reference ID:"}</span>
                                    <span className="font-mono text-indigo-400 font-black">TXN-{selectedEmailReceipt.id ? selectedEmailReceipt.id.substring(0, 12).toUpperCase() : "DEMOPAY2026"}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 font-bold block">{isAr ? "المبلغ المستلم:" : "Amount Paid:"}</span>
                                    <span className="font-mono text-emerald-400 font-black">{selectedEmailReceipt.amount} {isAr ? "جنيه مصري (فقط لا غير)" : "EGP"}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-slate-500 font-bold block">{isAr ? "تاريخ ووقت التأكيد:" : "Confirmation Timestamp:"}</span>
                                    <span className="font-mono text-slate-300">{selectedEmailReceipt.paidDate || new Date().toLocaleDateString("en-US")}</span>
                                  </div>
                                </div>

                                <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl flex items-start gap-2 text-[11px] text-slate-400 font-semibold leading-relaxed">
                                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-white mb-0.5">{isAr ? "الإبراء المالي والأكاديمي التلقائي:" : "Automatic Academic & Grade Clearance:"}</p>
                                    <p>
                                      {isAr 
                                        ? "ملاحظة هامة: بموجب هذا الإيصال، تم إلغاء حظر الدرجات الأكاديمية الخاص بك تلقائياً. يمكنك الآن تصفح بيان النجاح، كشف الدرجات التفصيلي، والمعدل المئوي التراكمي مباشرة عبر لوحة التحكم."
                                        : "Important note: Grade restrictions have been automatically lifted. Your cumulative academic percentages and certified transcript are now unlocked and fully accessible."}
                                    </p>
                                  </div>
                                </div>

                                <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                                  <p className="text-[9px] text-slate-500 font-bold">{isAr ? "هذا المستند معتمد وصادر إلكترونياً ولا يحتاج إلى توقيع خطي." : "This is a computer-generated official receipt; no physical signature is required."}</p>
                                  <button
                                    onClick={() => window.print()}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1"
                                  >
                                    <Printer className="w-4 h-4" />
                                    <span>{isAr ? "طباعة الإيصال المالي والاحتفاظ به" : "Print Payment Receipt"}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* صندوق الوارد: قائمة الإيميلات المستلمة للطلاب دافعي المصاريف */
                            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-right">
                              {myPayments.filter(p => p.paid).length === 0 ? (
                                <div className="text-center py-12 space-y-3">
                                  <AlertCircle className="w-10 h-10 text-slate-700 mx-auto" />
                                  <h4 className="font-extrabold text-xs text-slate-400">{isAr ? "صندوق بريدك المالي فارغ تماماً" : "Your Financial Inbox is Empty"}</h4>
                                  <p className="text-[10px] text-slate-500 font-bold max-w-xs mx-auto">
                                    {isAr ? "بمجرد سداد أي مصروفات مستحقة، سيتم توليد وإرسال إيصال السداد الموثق إلى بريدك الأكاديمي فوراً." : "Once any pending tuition fees are paid, an official receipt email will be generated here instantly."}
                                  </p>
                                </div>
                              ) : (
                                <div className="divide-y divide-slate-900">
                                  {myPayments.filter(p => p.paid).map((p) => (
                                    <div 
                                      key={p.id}
                                      onClick={() => setSelectedEmailReceipt(p)}
                                      className="p-4 flex items-center justify-between hover:bg-slate-900/60 transition-all cursor-pointer group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-115 transition-transform">
                                          <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">
                                            {isAr ? `إيصال سداد معتمد: ${p.title}` : `Payment Receipt: ${p.title}`}
                                          </p>
                                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                                            {isAr ? "المرسل: الشؤون المالية والتحصيل" : "From: Treasury & Finance Dept"}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-left shrink-0">
                                        <span className="font-mono text-[10px] text-slate-500 block">{p.paidDate}</span>
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full inline-block mt-1">
                                          {p.amount} {isAr ? "ج.م" : "EGP"}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

              </div>

            </div>
          ) : userProfile?.role === "admin" ? (
            /* ------------------------------------------------------------- */
            /* واجهة لوحة تحكم مدير البوابة والنظام (Admin Control System) */
            /* ------------------------------------------------------------- */
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative mb-6 text-right" dir={isAr ? "rtl" : "ltr"}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 font-extrabold px-3 py-1 rounded-full border border-rose-500/20 inline-block uppercase tracking-wider font-mono">
                        {isAr ? "لوحة الإدارة الكاملة الموحدة" : "Unified Full Control Console"}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white px-2.5 py-1 rounded-full text-[10px] font-black transition-all border border-red-500/20 flex items-center gap-1 cursor-pointer sm:hidden"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>{isAr ? "خروج" : "Logout"}</span>
                      </button>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                      {isAr ? `مرحباً بك: ${userProfile?.fullName}` : `Welcome: ${userProfile?.fullName}`}
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed">
                      {isAr 
                        ? "لديك الصلاحية الكاملة لتعديل ونشر أخبار المعهد، وجداول الامتحانات، ومراجعة طلبات الالتحاق بالكامل وإحصائيات الزوار الحية." 
                        : "You have full privileges to modify news, manage exam schedules, accept incoming freshman admissions, and view real-time visitor statistics."}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all border border-red-500/20 hidden sm:flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isAr ? "تسجيل خروج من البوابة" : "Logout Portal"}</span>
                  </button>
                </div>
              </div>
              <AdminDashboard />
            </div>
          ) : (
            
            /* ------------------------------------------------------------- */
            /* واجهة لوحة تحكم الأستاذ والدكاترة (Faculty Management System) */
            /* ------------------------------------------------------------- */
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-right" dir={isAr ? "rtl" : "ltr"}>
              
              {/* شريط ملاحة الدكاترة */}
              <div className="lg:col-span-3 space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-full flex items-center justify-center text-white text-xl font-black mx-auto mb-3 shadow-inner">
                    {userProfile?.fullName?.charAt(0)}
                  </div>
                  <h3 className="font-extrabold text-sm text-white line-clamp-1">{userProfile?.fullName}</h3>
                  <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full inline-block mt-2">
                    {isAr ? "عضو هيئة تدريس" : "Faculty Staff"}
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold mt-2 pt-2 border-t border-slate-800">{userProfile?.department}</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1">
                  <button
                    onClick={() => setProfessorTab("upload")}
                    className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                      professorTab === "upload" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAr ? "رفع المحاضرات والماتريال" : "Upload Lectures & PDFs"}</span>
                  </button>

                  <button
                    onClick={() => setProfessorTab("grading")}
                    className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                      professorTab === "grading" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isAr ? "رصد وإدخال درجات الطلاب" : "Record Student Grades"}</span>
                  </button>

                  <button
                    onClick={() => setProfessorTab("admissions")}
                    className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 cursor-pointer ${
                      professorTab === "admissions" 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isAr ? "طلبات الالتحاق والقبول (التقديم)" : "Admissions & Freshmen"}</span>
                  </button>
                </div>
              </div>

              {/* لوحة عرض التبويب النشط للدكتور */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* 1. تبويب: رفع المحاضرات (Upload Materials) */}
                {professorTab === "upload" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
                      <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-400" />
                        <span>{isAr ? "رفع محاضرة أو مستند جديد" : "Publish New Course Material"}</span>
                      </h2>

                      <form onSubmit={handleMaterialUpload} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "الفرقة الدراسية المستهدفة:" : "Target Academic Level:"}</label>
                            <select
                              value={materialYear}
                              onChange={(e) => setMaterialYear(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white"
                            >
                              <option value="الفرقة الأولى">{isAr ? "الفرقة الأولى" : "1st Year"}</option>
                              <option value="الفرقة الثانية">{isAr ? "الفرقة الثانية" : "2nd Year"}</option>
                              <option value="الفرقة الثالثة">{isAr ? "الفرقة الثالثة" : "3rd Year"}</option>
                              <option value="الفرقة الرابعة">{isAr ? "الفرقة الرابعة" : "4th Year"}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "المادة الدراسية (المقرر):" : "Course Subject Name:"}</label>
                            <input
                              type="text"
                              required
                              value={materialSubject}
                              onChange={(e) => setMaterialSubject(e.target.value)}
                              placeholder={isAr ? "نموذج: التخطيط الاجتماعي والتنمية المستدامة" : "e.g. Social Planning"}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "عنوان المحاضرة أو الملف:" : "Material / Lecture Title:"}</label>
                            <input
                              type="text"
                              required
                              value={materialTitle}
                              onChange={(e) => setMaterialTitle(e.target.value)}
                              placeholder={isAr ? "نموذج: المحاضرة الأولى - مقدمة عامة ورؤى" : "Lecture Title"}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "نوع المحاضرة:" : "Material Category:"}</label>
                            <select
                              value={materialType}
                              onChange={(e) => setMaterialType(e.target.value as any)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white"
                            >
                              <option value="pdf">{isAr ? "ملف PDF ومستندات" : "PDF / Slides Document"}</option>
                              <option value="video">{isAr ? "محاضرة فيديو مسجلة" : "Recorded Video Lecture"}</option>
                              <option value="link">{isAr ? "رابط مرجعي خارجي" : "External Resource Link"}</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                            {isAr ? "رابط المستند أو كود الفيديو (embed) لليوتيوب:" : "File/Video URL:"}
                          </label>
                          <input
                            type="text"
                            required
                            value={materialUrl}
                            onChange={(e) => setMaterialUrl(e.target.value)}
                            placeholder={materialType === "video" ? "https://www.youtube.com/embed/..." : "https://example.com/document.pdf"}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white font-mono text-left"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "وصف مختصر للطلاب وموجهات المذاكرة:" : "Short Description & Homework Notes:"}</label>
                          <textarea
                            rows={3}
                            value={materialDesc}
                            onChange={(e) => setMaterialDesc(e.target.value)}
                            placeholder={isAr ? "اكتب هنا التوجيهات أو النقاط الرئيسية التي تود مراجعتها بأسوان..." : "Provide clear guidelines for your students..."}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white"
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          {isAr ? "رفع ونشر المحاضرة للطلاب ✉️" : "Publish Course Material Now"}
                        </button>
                      </form>
                    </div>

                    {/* قائمة الماتريال الحالية التي رفعها الأستاذ */}
                    <div className="space-y-4">
                      <h3 className="font-extrabold text-sm text-white">{isAr ? "المحاضرات المنشورة بواسطتك:" : "Course Materials Published By You:"}</h3>
                      {allUploadedMaterials.length === 0 ? (
                        <p className="text-xs text-slate-500 font-bold italic">{isAr ? "لم تقم بنشر مقررات أو كتب بعد." : "You have not uploaded any materials yet."}</p>
                      ) : (
                        <div className="space-y-3">
                          {allUploadedMaterials.map((m) => (
                            <div key={m.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex justify-between items-center gap-4">
                              <div>
                                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-md">
                                  {m.academicYear} — {m.subject}
                                </span>
                                <h4 className="font-bold text-xs text-white mt-1">{m.title}</h4>
                              </div>
                              <button
                                onClick={() => handleDeleteMaterial(m.id)}
                                className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white p-2.5 rounded-xl transition-all border border-red-500/20 cursor-pointer"
                                title={isAr ? "حذف نهائي" : "Delete Material"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. تبويب: رصد وإدخال درجات الطلاب (Grading System) */}
                {professorTab === "grading" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {gradingStudent && (
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl max-w-xl mx-auto animate-in scale-in duration-300">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                          <h3 className="font-extrabold text-sm text-white">{isAr ? `رصد درجات الطالب: ${gradingStudent.fullName}` : `Grading Student: ${gradingStudent.fullName}`}</h3>
                          <button
                            onClick={() => setGradingStudent(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer"
                          >
                            {isAr ? "إلغاء" : "Cancel"}
                          </button>
                        </div>

                        <form onSubmit={handleGradeSubmit} className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "المادة الدراسية (المقرر):" : "Course Subject:"}</label>
                            <input
                              type="text"
                              required
                              value={gradeSubject}
                              onChange={(e) => setGradeSubject(e.target.value)}
                              placeholder={isAr ? "نموذج: التخطيط الاجتماعي والتنمية المستدامة" : "e.g. Social Planning"}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "الدرجة المستحقة (من 100):" : "Student Score (out of 100):"}</label>
                              <input
                                type="number"
                                required
                                min="0"
                                max="100"
                                value={gradeScore}
                                onChange={(e) => setGradeScore(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">{isAr ? "الفصل الدراسي:" : "Academic Semester:"}</label>
                              <select
                                value={gradeTerm}
                                onChange={(e) => setGradeTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-white"
                              >
                                <option value="الترم الأول">{isAr ? "الترم الأول" : "Term 1"}</option>
                                <option value="الترم الثاني">{isAr ? "الترم الثاني" : "Term 2"}</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer"
                          >
                            {isAr ? "تأكيد ورصد الدرجة بنجاح ✔️" : "Confirm & Save Grade"}
                          </button>
                        </form>
                      </div>
                    )}

                    {!gradingStudent && (
                      <div className="space-y-4">
                        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h2 className="text-lg font-black text-white">{isAr ? "الطلاب المقيدون بالمعهد والمسجلون الكترونياً" : "Registered Academic Student List"}</h2>
                            <p className="text-xs text-slate-400 font-bold">
                              {isAr 
                                ? `عرض تلقائي لطلاب فرقتك الدراسية المخصصة: ${userProfile?.academicYear || "الكل"}` 
                                : `Showing students in your assigned year: ${userProfile?.academicYear || "All"}`}
                            </p>
                          </div>
                          
                          {/* فلتر اختيار الفرقة الدراسية */}
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-black text-slate-400 shrink-0">{isAr ? "تصفية حسب الفرقة:" : "Filter by Level:"}</label>
                            <select
                              value={selectedYearFilter || userProfile?.academicYear || "الفرقة الأولى"}
                              onChange={(e) => setSelectedYearFilter(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 text-white"
                            >
                              <option value="الفرقة الأولى">{isAr ? "الفرقة الأولى" : "1st Year"}</option>
                              <option value="الفرقة الثانية">{isAr ? "الفرقة الثانية" : "2nd Year"}</option>
                              <option value="الفرقة الثالثة">{isAr ? "الفرقة الثالثة" : "3rd Year"}</option>
                              <option value="الفرقة الرابعة">{isAr ? "الفرقة الرابعة" : "4th Year"}</option>
                              <option value="all">{isAr ? "جميع الفرق" : "All Years"}</option>
                            </select>
                          </div>
                        </div>

                        {(() => {
                          const activeYear = selectedYearFilter || userProfile?.academicYear || "الفرقة الأولى";
                          const filtered = studentsList.filter((stu) => {
                            if (activeYear === "all") return true;
                            return stu.academicYear === activeYear;
                          });

                          if (filtered.length === 0) {
                            return (
                              <p className="text-xs text-slate-500 font-bold italic py-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                                {isAr 
                                  ? `لا يوجد طلاب مسجلون إلكترونياً بالبوابة في ${activeYear === "all" ? "أي فرقة" : activeYear} حالياً.` 
                                  : `No students registered under ${activeYear === "all" ? "any level" : activeYear} yet.`}
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-3">
                              {filtered.map((stu) => (
                                <div key={stu.uid} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative group">
                                  <div className="space-y-1">
                                    <h3 className="font-extrabold text-sm text-white">{stu.fullName}</h3>
                                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-bold">
                                      <p>{isAr ? "رقم القيد:" : "ID:"} <span className="text-indigo-400">{stu.studentId || "ST-ASW"}</span></p>
                                      <p>{stu.academicYear} — {stu.department}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setGradingStudent(stu)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md self-end sm:self-auto shrink-0 flex items-center gap-1"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>{isAr ? "رصد درجات 📝" : "Grade Student"}</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. تبويب: طلبات التقديم والقبول (Admissions) */}
                {professorTab === "admissions" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-slate-800 pb-3">
                      <h2 className="text-lg font-black text-white">{isAr ? "طلبات تقديم القبول الإلكتروني الواردة" : "Prospective Freshman Admissions Requests"}</h2>
                      <p className="text-xs text-slate-400 font-bold">{isAr ? "مراجعة واعتماد أو رفض طلبات تنسيق الكلية لعام ٢٠٢٦" : "Review, accept, or reject incoming application files"}</p>
                    </div>

                    {allAdmissions.length === 0 ? (
                      <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl">
                        <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-500 font-bold mt-2 italic">{isAr ? "لم يتقدم أي مستخدم بطلب التحاق إلكتروني حتى الآن." : "No admissions requests found."}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allAdmissions.map((adm) => (
                          <div key={adm.id} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-3 relative">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold px-2.5 py-1 rounded-md">
                                  {adm.appId || "ASW-2026"}
                                </span>
                                <h3 className="font-extrabold text-sm text-white mt-1.5">{adm.fullName}</h3>
                              </div>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                                adm.status === "approved" 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : adm.status === "rejected"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              }`}>
                                {adm.status === "approved" ? (isAr ? "مقبول مبدئياً" : "Approved") : adm.status === "rejected" ? (isAr ? "مرفوض" : "Rejected") : (isAr ? "قيد الانتظار" : "Pending")}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-400 bg-slate-900/60 p-3 rounded-2xl border border-slate-900">
                              <p>{isAr ? "رقم الاتصال:" : "Phone:"} <span className="text-white font-mono">{adm.phone}</span></p>
                              <p>{isAr ? "مجموع الثانوية العامة:" : "High School Score:"} <span className="text-white font-mono">{adm.highSchoolGrad}</span></p>
                              <p className="sm:col-span-2">{isAr ? "الرقم القومي للتدقيق:" : "National ID:"} <span className="text-white font-mono">{adm.nationalId}</span></p>
                              {adm.notes && <p className="sm:col-span-2 text-slate-500">{isAr ? "ملاحظات الطالب:" : "Notes:"} {adm.notes}</p>}
                            </div>

                            {adm.status === "approved" && adm.academicEmail && (
                              <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] text-right space-y-1.5 text-slate-300 font-medium">
                                <p><span className="font-bold text-indigo-400">{isAr ? "الحساب الأكاديمي:" : "Academic Email:"}</span> <span className="font-mono text-white select-all">{adm.academicEmail}</span></p>
                                <p><span className="font-bold text-emerald-400">{isAr ? "كلمة المرور المؤقتة:" : "Temporary Password:"}</span> <span className="font-mono text-white select-all">{adm.academicPassword || "aswan123456"}</span></p>
                                <p><span className="font-bold text-purple-400">{isAr ? "كود الطالب الجامعي:" : "Academic Student ID:"}</span> <span className="font-mono text-white select-all">{adm.generatedStudentId}</span></p>
                              </div>
                            )}

                            {adm.status === "pending" && (
                              <div className="flex gap-2 justify-end pt-2">
                                <button
                                  onClick={() => handleUpdateAdmissionStatus(adm.id, "approved")}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                                >
                                  {isAr ? "موافقة وقبول ✔️" : "Approve File"}
                                </button>
                                <button
                                  onClick={() => handleUpdateAdmissionStatus(adm.id, "rejected")}
                                  className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                                >
                                  {isAr ? "رفض الطلب ❌" : "Reject File"}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          )
        )}
      </div>

    </div>
  );
}
