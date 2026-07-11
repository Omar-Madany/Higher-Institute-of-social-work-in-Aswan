/**
 * ONE-TIME SETUP SCRIPT
 * ---------------------
 * Run this locally (never on Hostinger, never in the browser) after you've
 * created your own Firebase project. It uses the Firebase ADMIN SDK, which
 * authenticates with a service account and bypasses Firestore security
 * rules entirely — that's exactly what we need to bootstrap the first
 * admin account before any rules-based login exists.
 *
 * WHAT IT DOES
 *   1. Creates (or reuses) a Firebase Authentication user for you.
 *   2. Adds that user's uid to the /admins collection, which is what
 *      firestore.rules checks to decide who is allowed to write data.
 *   3. Seeds the news_articles collection with the site's sample articles
 *      (only if the collection is currently empty).
 *   4. Seeds student_results_by_seat with the preloaded exam-results list
 *      (only if the collection is currently empty).
 *
 * HOW TO RUN IT
 *   1. In the Firebase Console: Project settings -> Service accounts ->
 *      "Generate new private key". Save the downloaded file as
 *      serviceAccountKey.json in the project root (same folder as
 *      package.json). This file is a secret — never commit it, never
 *      upload it to Hostinger.
 *   2. In the Firebase Console: Authentication -> Sign-in method -> enable
 *      "Email/Password".
 *   3. npm install firebase-admin --save-dev
 *   4. node scripts/setup-firebase.mjs admin@yourdomain.com "a-strong-password"
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");

const [, , emailArg, passwordArg] = process.argv;

if (!emailArg || !passwordArg) {
  console.error("Usage: node scripts/setup-firebase.mjs <admin-email> <admin-password>");
  process.exit(1);
}

if (!existsSync(serviceAccountPath)) {
  console.error(
    `Could not find serviceAccountKey.json at ${serviceAccountPath}\n` +
    "Download it from Firebase Console -> Project settings -> Service accounts -> Generate new private key."
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

async function ensureAdminUser(email, password) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log(`Found existing Auth user for ${email} (uid: ${user.uid}). Updating password...`);
    await auth.updateUser(user.uid, { password });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.log(`Creating new Auth user for ${email}...`);
      user = await auth.createUser({ email, password, emailVerified: true });
    } else {
      throw err;
    }
  }

  await db.collection("admins").doc(user.uid).set({
    email,
    role: "admin",
    createdAt: new Date().toISOString(),
  });
  console.log(`✔ ${email} (uid: ${user.uid}) is now registered as an admin.`);
  return user;
}

async function seedNewsIfEmpty() {
  const snapshot = await db.collection("news_articles").limit(1).get();
  if (!snapshot.empty) {
    console.log("news_articles already has data — skipping news seed.");
    return;
  }

  const defaultArticles = [
    {
      id: "news1",
      title_ar: "اعتماد جداول امتحانات الفصل الدراسي الحالي لجميع الفرق الأربعة بأسوان",
      title_en: "Semester Exam Schedules Approved for All Academic Levels",
      summary_ar: "أعلنت الإدارة الأكاديمية بالمعهد العالي للخدمة الاجتماعية بأسوان عن الجداول التفصيلية والنهائية لامتحانات نهاية الفصل الدراسي.",
      summary_en: "Aswan Institute Academic Affairs has disclosed the definitive timetable schedules for final term sessions.",
      content_ar: "أعلنت الإدارة الأكاديمية وشئون الطلاب برعاية الأستاذ الدكتور عميد المعهد اليوم، الجداول الرسمية المفصلة والنهائية لامتحانات نهاية الفصل الدراسي الحالي لجميع الفرق الدراسية الأربعة.",
      content_en: "Official academic boards and student desks under the Dean's purview have released finalized, structured timetables for all four undergraduate batches.",
      date: "2026-06-18",
      category: "إعلانات",
      image: "/assets/images/academic_hall_1783237406652.jpg",
      views: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "news2",
      title_ar: "بدء برامج التدريب الميداني والزيارات الخارجية لطلاب الفرقتين الثالثة والرابعة",
      title_en: "Field Internships & Placement Planners Activated",
      summary_ar: "انطلاق فعاليات التدريب العملي المبرم بأكثر من 85 مؤسسة حكومية وأهلية في نطاق المحافظة.",
      summary_en: "Practical field training kicks off inside over 85 governmental and civil bodies across Aswan.",
      content_ar: "انطلقت تحت إشراف قسم التدريب الميداني المجموعات التخصصية لطلاب الفرقتين الثالثة والرابعة لتنفيذ خطة الزيارات والتدريبات العملية.",
      content_en: "Under supervision of the Practical Internship Department, senior batches started their physical allocation rosters.",
      date: "2026-06-15",
      category: "فعاليات",
      image: "/assets/images/studying.jpg",
      views: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  console.log(`Seeding ${defaultArticles.length} starter news articles (edit/add more later from the Admin Dashboard)...`);
  const batch = db.batch();
  for (const art of defaultArticles) {
    const { id, ...rest } = art;
    batch.set(db.collection("news_articles").doc(id), rest);
  }
  await batch.commit();
  console.log("✔ News seeded. Add the rest of your real articles from the Admin Dashboard.");
}

async function seedExamResultsIfEmpty() {
  const snapshot = await db.collection("student_results_by_seat").limit(1).get();
  if (!snapshot.empty) {
    console.log("student_results_by_seat already has data — skipping results seed.");
    return;
  }

  const dataModulePath = path.join(__dirname, "..", "src", "data", "preloaded_students.ts");
  if (!existsSync(dataModulePath)) {
    console.log("No preloaded_students.ts found — skipping results seed.");
    return;
  }

  const raw = readFileSync(dataModulePath, "utf-8");
  const matches = [...raw.matchAll(/\{\s*seatNumber:\s*"([^"]+)",\s*fullName:\s*"([^"]+)",\s*status:\s*"([^"]+)"\s*\}/g)];
  if (matches.length === 0) {
    console.log("Could not parse preloaded_students.ts — skipping results seed.");
    return;
  }

  console.log(`Seeding ${matches.length} preloaded exam results...`);
  let batch = db.batch();
  let count = 0;
  for (const [, seatNumber, fullName, status] of matches) {
    const docRef = db.collection("student_results_by_seat").doc(`seat_${seatNumber}`);
    batch.set(docRef, {
      seatNumber,
      fullName,
      academicYear: seatNumber.startsWith("5") ? "الفرقة الأولى" : "الفرقة الأولى",
      department: "شعبة الخدمة الاجتماعية",
      percentage: 0,
      status,
      grades: [],
    });
    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  await batch.commit();
  console.log(`✔ Seeded ${matches.length} exam results.`);
}

async function main() {
  await ensureAdminUser(emailArg, passwordArg);
  await seedNewsIfEmpty();
  await seedExamResultsIfEmpty();
  console.log("\nAll done. You can now log in to /admin (or wherever the Admin Dashboard is mounted) with:");
  console.log(`  Email:    ${emailArg}`);
  console.log(`  Password: (the one you passed in)`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Setup script failed:", err);
  process.exit(1);
});
