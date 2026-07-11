# Setting up your own Firebase backend + deploying to Hostinger

Your site currently points at a **temporary Firebase project** created by AI
Studio (`global-nirvana-7k91c`), and the Admin Dashboard "login" was just a
hardcoded password sitting in the JavaScript bundle — anyone could read it in
their browser's dev tools, and the database rules let anyone read *and write*
everything (`allow read, write: if true`) regardless of that password.

This guide walks you through replacing that with a real Firebase project you
own, with a real admin login and locked-down database rules. I've already
fixed the code side (`firestore.rules`, the Admin Dashboard login, and a
one-time setup script) — you just need to do the parts that require your own
Google account.

---

## 1. Create your Firebase project

1. Go to https://console.firebase.google.com and sign in with the Google
   account you want to own this project.
2. Click **Add project**, name it (e.g. `aswan-institute`), disable Google
   Analytics if you don't need it, and click **Create project**.
3. Once created, click the **Web** icon (`</>`) to register a web app. Name
   it anything (e.g. "Aswan Institute Website"). You do **not** need Firebase
   Hosting — you're deploying to Hostinger.
4. Firebase will show you a `firebaseConfig` object. Keep this tab open, you
   need it in step 4.

## 2. Enable Firestore and Authentication

1. In the left sidebar, go to **Build -> Firestore Database -> Create
   database**. Choose **Production mode** (not test mode) and pick a region
   close to Egypt (e.g. `europe-west1` or `me-central1` if offered).
2. Go to **Build -> Authentication -> Get started**. Under **Sign-in
   method**, enable **Email/Password**.

## 3. Deploy the security rules

The repo already contains a locked-down `firestore.rules` file:
- Public visitors can read news, exam schedules, exam results by seat
  number, and submit admission applications.
- Only an account registered in the `admins` collection can create/edit/
  delete news, exam schedules, grades, payments, and results.

Deploy it with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # choose your new project, keep the default rules file name
# when it asks to overwrite firestore.rules, say NO (keep the one already in this repo)
firebase deploy --only firestore:rules
```

## 4. Point the app at your project

Open `firebase-applet-config.json` in the project root and replace its
contents with the `firebaseConfig` values from step 1, adding a
`firestoreDatabaseId` field set to `"(default)"`:

```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "...",
  "measurementId": ""
}
```

These values aren't secret (they're visible in any Firebase web app's
bundled JS by design) — access control is enforced by the security rules
you deployed in step 3, not by hiding this file.

## 5. Create your admin account

1. In the Firebase Console: **Project settings (gear icon) -> Service
   accounts -> Generate new private key**. Save the downloaded file as
   `serviceAccountKey.json` in the project root. **Never commit this file or
   upload it to Hostinger** — it's already in `.gitignore`.
2. Install the one dev dependency this needs, then run the setup script with
   the email and password you want for the institute's admin account:

```bash
npm install
node scripts/setup-firebase.mjs admin@yourdomain.com "a-strong-password"
```

This creates the Firebase Auth account, registers it in the `admins`
collection (which is what the security rules check), and seeds a couple of
starter news articles and the preloaded exam results list if those
collections are empty. You can add/edit everything else from the Admin
Dashboard once you're logged in.

You can re-run this script any time to add more admins (just pass a
different email) or reset the password for an existing one.

## 6. Build and deploy to Hostinger

```bash
npm run build
```

This produces a `dist/` folder. Upload **everything inside `dist/`** (not
the `dist` folder itself) to your Hostinger `public_html` directory — via
the File Manager or FTP. The repo already includes `public/.htaccess`,
which gets copied into `dist/` during the build and handles HTTPS
redirection and SPA routing for Hostinger's Apache/LiteSpeed setup, so you
shouldn't need to touch it.

If your site lives in a subfolder instead of the domain root, edit
`vite.config.ts`'s `base: './'` — the relative path already works for both
cases, so this is usually not necessary.

## 7. Sanity check

- Visit your live site — news and exam schedules should load (seeded/public
  reads).
- Go to the Admin Dashboard, log in with the email/password from step 5, and
  confirm you can add a news article.
- Open the browser dev tools on the public site and confirm you can no
  longer find any working admin password in the bundle — there isn't one
  anymore, only your real Firebase Auth account can write data.

---

### A note on scope

I secured the collections that clearly hold sensitive data (grades,
payments, admin-only edits) and left public collections (news reads, exam
schedule reads, visitor counters) open, matching how the app already uses
them. A few less-common code paths in `StudentPortal.tsx` (demo/professor
self-service features using simulated student IDs) write to `student_grades`
and `course_materials` directly from the portal — under the new rules those
now require the signed-in account to be registered in `admins` too. If you
want a separate "professor" role with narrower permissions than full admin,
that's a reasonable next step but wasn't part of what you asked for here —
happy to build it out if useful.
