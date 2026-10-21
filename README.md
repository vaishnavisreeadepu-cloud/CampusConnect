# CampusConnect — Integrated College Management System

**CampusConnect** is a full-stack, responsive college management web application built using **React (Vite)**, **Tailwind CSS**, and **Firebase**. It provides dedicated, role-based workflows for **Administrators**, **Teachers**, and **Students** with real-time Firestore listeners, Cloud Storage coursework distribution, conflict-detecting timetable scheduling, subject-wise attendance analytics, and private 1-on-1 teacher-student messaging.

---

## 🏛️ System Features & User Roles

### 1. Public Institutional Portal
- **Hero & Heritage:** Prestigious university architecture showcase, mission/vision statements, and institutional highlights.
- **Academic Programs & Departments:** Department listings for CSE, ECE, Mechanical, and AI-DS with HOD appointments and credit schemes.
- **Campus Facilities:** Visual showcase of GPU computing laboratories, digital library, robotics labs, sports complex, and student residencies.
- **Official Notice Board:** Filterable circulars (Examinations, Holidays, Hackathons, Academic Guidance) with attachment downloads.
- **Online Admissions Enquiry Pipeline:** Prospective students submit inquiries directly to the administrative admissions pipeline.

### 2. Administrator Console (`/admin`)
- **Institutional Governance Dashboard:** Live Firestore metric counts for total students, faculty, departments, classes, circulars, and admissions leads.
- **Student Management:** Full CRUD, class cohort assignment, duplicate ID and roll conflict detection, and student dossier inspector.
- **Faculty Management:** Appointment workflow, department allocations, employee ID uniqueness validation, and class assignments.
- **Curriculum Architecture:** Departments, academic years, semesters, cohort sections, and credit-hour subject catalog.
- **Intelligent Timetable Engine:** Automated conflict detection preventing teacher or classroom double-booking across periods.
- **Admissions Review Pipeline:** Status transition engine (`Pending` → `Reviewed` → `Admitted` → `Rejected`).
- **Reports & Data Export:** One-click authorized CSV exports for **Student Rosters**, **Faculty Directories**, and **Attendance Audits**.
- **Institutional Settings:** Dynamic administrative configuration of college name, crest, address, contact coordinates, and academic term calendar.

### 3. Faculty / Teacher Portal (`/teacher`)
- **Authorized Class Cohorts:** Strict role and assignment filtering — instructors access only their assigned classes and subjects.
- **Student Roster & Direct Action:** View enrolled scholars with instant **"Message Student"** trigger.
- **Coursework Materials Upload:** Upload lecture notes, PDF guides, DOCX/PPTX slides (up to 25MB) with strict class isolation.
- **Assignment Delivery & Grading:** Issue coursework with deadlines and max marks; inspect student submissions; assign marks and publish constructive written feedback.
- **Roll-Call Attendance Ledger:** Roll-call interface with one-click **"All Present"** / **"All Absent"** shortcuts, duplicate session protection, and stored summary stats.
- **Weekly Schedule:** Filtered personal timetable of lecture periods and room numbers.
- **Private 1-on-1 Student Chat:** Direct messaging channel with enrolled scholars featuring real-time message stream and attachment support.

### 4. Student Information System (`/student`)
- **Personalized Scholar Dashboard:** Enrolled cohort details, live attendance percentage meter, upcoming assignment deadlines, and cohort circulars.
- **Isolated Course Materials:** View and download only authorized lecture notes for the student's enrolled class.
- **Assignments & Turn-In:** Inspect problem sheets, submit written answers or upload solution files, track submission statuses (`Submitted`, `Late`, `Graded`), and review published marks with faculty feedback.
- **Subject-Wise Attendance Analytics:** Dynamic calculation of lectures held, presences, absences, and subject percentages with regulatory <75% debarment warnings.
- **Weekly Timetable:** Period-by-period class schedule with subject, teacher, and classroom location.
- **Faculty Consultation Channel:** Real-time private chat with course instructors with read receipts.
- **Student Profile:** View official academic dossier (immutable) and update personal emergency contacts, phone, and address.

---

## 🔑 Demo & Test Credentials

The application includes pre-configured demo credentials accessible via the one-click **"Quick Role Switch"** bar on the navigation ribbon or login screen:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campusconnect.edu` | `Admin@123` | Dr. Vance (Super Administrator) |
| **Faculty / Teacher** | `teacher@campusconnect.edu` | `Teacher@123` | Prof. Alan Turing (CSE Department) |
| **Student (Class A)** | `student@campusconnect.edu` | `Student@123` | Alex Rivera (CSE 2nd Year, Roll #101) |
| **Student (Class B)** | `student2@campusconnect.edu` | `Student@123` | Emma Watson (ECE 2nd Year, Roll #204 - Isolation Test) |

---

## ⚙️ Technology Stack

- **Frontend:** React 19, Vite 8, React Router 7
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Backend & Persistence:** Firebase Authentication, Cloud Firestore, Cloud Storage for Firebase, Firebase Cloud Functions (Admin SDK)
- **Local Dev Resilience:** Built-in dual-engine architecture supporting both live Firebase and an in-browser reactive store with identical async interfaces and real-time event dispatching.

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):
```env
# Frontend Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Set to true when running the Firebase Emulator Suite
VITE_USE_FIREBASE_EMULATOR=false
```

> **Security Note:** The variables prefixed with `VITE_` are public client identifiers bundled with frontend assets. **Never** place private service account keys or Firebase Admin credentials in `.env` or client code.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🔥 Firebase Backend & Cloud Deployment

### 1. Firebase Project Setup
1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project named **CampusConnect**.
2. Under **Build > Authentication**, enable **Email/Password** provider.
3. Under **Build > Firestore Database**, create a database in production mode.
4. Under **Build > Cloud Storage**, create a storage bucket.

### 2. Deploy Security Rules & Indexes
Install Firebase CLI if you haven't already:
```bash
npm install -g firebase-tools
firebase login
firebase use --add <your-project-id>
```

Deploy Firestore and Storage rules:
```bash
# Deploy Firestore security rules and composite indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Cloud Storage security rules
firebase deploy --only storage
```

### 3. Firebase Cloud Functions
Navigate to the `functions/` directory and install dependencies:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 4. Deploying to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 🧪 Testing with Firebase Emulator Suite

To run tests in a completely isolated, local Firebase environment without cloud billing:
```bash
# Start Emulators for Auth, Firestore, Storage, Functions, and UI
firebase emulators:start
```
Set `VITE_USE_FIREBASE_EMULATOR=true` in your `.env` file and start the Vite dev server (`npm run dev`). View emulator state and inspect records at [http://localhost:4000](http://localhost:4000).

---

## 🔒 Security Architecture Highlights

1. **Defense-in-Depth:** UI route guards ensure seamless user experience, while **Firestore Security Rules** (`firestore.rules`) and **Storage Rules** (`storage.rules`) strictly enforce authorization at the database and storage layer.
2. **Class & Material Isolation:** Students enrolled in Class A cannot read or download coursework belonging to Class B.
3. **Private Messaging Security:** Firestore security rules enforce that only the two conversation participants (`request.auth.uid in [teacherId, studentId]`) can read or append chat messages.
4. **Attendance Integrity:** Official attendance records and sessions can only be committed by authenticated teachers or administrators. Students are denied write permissions.
5. **Audited User Provisioning:** Teacher and student account creation is orchestrated through trusted server-side flows or administrator governance.
# CampusConnect
# CampusConnect
