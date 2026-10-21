import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CollegeProvider } from "./contexts/CollegeContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Navbar } from "./components/layout/Navbar";

// Public Pages
import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { AcademicsPage } from "./pages/public/AcademicsPage";
import { DepartmentsPage } from "./pages/public/DepartmentsPage";
import { FacilitiesPage } from "./pages/public/FacilitiesPage";
import { NoticesPage } from "./pages/public/NoticesPage";
import { ContactPage } from "./pages/public/ContactPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignUpPage } from "./pages/auth/SignUpPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { StudentManagement } from "./pages/admin/StudentManagement";
import { TeacherManagement } from "./pages/admin/TeacherManagement";
import { DepartmentManagement } from "./pages/admin/DepartmentManagement";
import { ClassManagement } from "./pages/admin/ClassManagement";
import { SubjectManagement } from "./pages/admin/SubjectManagement";
import { AnnouncementManagement } from "./pages/admin/AnnouncementManagement";
import { TimetableManagement } from "./pages/admin/TimetableManagement";
import { AttendanceOverview } from "./pages/admin/AttendanceOverview";
import { AssignmentOverview } from "./pages/admin/AssignmentOverview";
import { EnquiryManagement } from "./pages/admin/EnquiryManagement";
import { ReportsManagement } from "./pages/admin/ReportsManagement";
import { CollegeSettingsPage } from "./pages/admin/CollegeSettingsPage";
import { AdminProfile } from "./pages/admin/AdminProfile";

// Teacher Pages
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { TeacherClasses } from "./pages/teacher/TeacherClasses";
import { TeacherSubjects } from "./pages/teacher/TeacherSubjects";
import { TeacherStudents } from "./pages/teacher/TeacherStudents";
import { TeacherNotes } from "./pages/teacher/TeacherNotes";
import { TeacherAssignments } from "./pages/teacher/TeacherAssignments";
import { TeacherAttendance } from "./pages/teacher/TeacherAttendance";
import { TeacherTimetable } from "./pages/teacher/TeacherTimetable";
import { TeacherMessages } from "./pages/teacher/TeacherMessages";
import { TeacherAnnouncements } from "./pages/teacher/TeacherAnnouncements";
import { TeacherProfile } from "./pages/teacher/TeacherProfile";

// Student Pages
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentNotices } from "./pages/student/StudentNotices";
import { StudentClasses } from "./pages/student/StudentClasses";
import { StudentMaterials } from "./pages/student/StudentMaterials";
import { StudentAssignments } from "./pages/student/StudentAssignments";
import { StudentAttendance } from "./pages/student/StudentAttendance";
import { StudentTimetable } from "./pages/student/StudentTimetable";
import { StudentMessages } from "./pages/student/StudentMessages";
import { StudentProfile } from "./pages/student/StudentProfile";

// Public Wrapper Layout
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1">{children}</main>
  </div>
);

// 404 Not Found Page
const NotFound = () => (
  <PublicLayout>
    <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
      <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-3xl flex items-center justify-center mx-auto text-2xl font-black">
        404
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900">Page Not Found</h2>
      <p className="text-xs text-slate-500">
        The requested campus resource or page does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-500 transition-colors"
      >
        Return to Campus Home
      </Link>
    </div>
  </PublicLayout>
);

export function App() {
  return (
    <AuthProvider>
      <CollegeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/academics" element={<PublicLayout><AcademicsPage /></PublicLayout>} />
            <Route path="/departments" element={<PublicLayout><DepartmentsPage /></PublicLayout>} />
            <Route path="/facilities" element={<PublicLayout><FacilitiesPage /></PublicLayout>} />
            <Route path="/notices" element={<PublicLayout><NoticesPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><SignUpPage /></PublicLayout>} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StudentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TeacherManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DepartmentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ClassManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SubjectManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AnnouncementManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/timetable"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TimetableManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AttendanceOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AssignmentOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enquiries"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <EnquiryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReportsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CollegeSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/subjects"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/notes"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/timetable"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherTimetable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/messages"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/announcements"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherAnnouncements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/profile"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherProfile />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notices"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentNotices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/classes"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/materials"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentMaterials />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/timetable"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentTimetable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/messages"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CollegeProvider>
    </AuthProvider>
  );
}

export default App;
