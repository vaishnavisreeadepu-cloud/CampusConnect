import React, { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { authService } from "../../services/authService";
import { attendanceService } from "../../services/attendanceService";
import { FileBarChart, Download, CheckCircle2, Users, CheckSquare, BookOpen } from "lucide-react";

export const ReportsManagement = () => {
  const { classes, departments, subjects } = useCollege();
  const [downloading, setDownloading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Helper to trigger browser CSV download
  const triggerCsvDownload = (filename, rows) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export Student Enrollment Roster
  const handleExportStudents = async () => {
    setDownloading(true);
    try {
      const allUsers = await authService.getAllUsers();
      const students = allUsers.filter((u) => u.role === "student");

      const headers = ["Student ID", "Roll Number", "Full Name", "Email", "Phone", "Department", "Class", "Enrollment Year", "Status"];
      const rows = [headers];

      students.forEach((s) => {
        const dept = departments.find((d) => d.id === s.departmentId);
        const cls = classes.find((c) => c.id === s.classId);
        rows.push([
          s.studentId || "N/A",
          s.rollNumber || "N/A",
          s.fullName,
          s.email,
          s.phone || "N/A",
          dept?.name || s.departmentId || "N/A",
          cls?.name || s.className || "N/A",
          s.enrollmentYear || "2024",
          s.active !== false ? "Active" : "Deactivated",
        ]);
      });

      triggerCsvDownload(`campusconnect_students_${new Date().toISOString().split("T")[0]}.csv`, rows);
      setFeedback("Student roster report exported successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  // 2. Export Faculty Directory & Allocations
  const handleExportTeachers = async () => {
    setDownloading(true);
    try {
      const allUsers = await authService.getAllUsers();
      const teachers = allUsers.filter((u) => u.role === "teacher");

      const headers = ["Employee ID", "Full Name", "Email", "Phone", "Department", "Designation", "Assigned Classes", "Assigned Subjects"];
      const rows = [headers];

      teachers.forEach((t) => {
        const dept = departments.find((d) => d.id === t.departmentId);
        rows.push([
          t.employeeId || "N/A",
          t.fullName,
          t.email,
          t.phone || "N/A",
          dept?.name || t.departmentId || "N/A",
          t.designation || "Faculty",
          t.assignedClasses?.join("; ") || "None",
          t.assignedSubjects?.join("; ") || "None",
        ]);
      });

      triggerCsvDownload(`campusconnect_faculty_${new Date().toISOString().split("T")[0]}.csv`, rows);
      setFeedback("Faculty directory report exported successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  // 3. Export Attendance Sessions Audit
  const handleExportAttendance = async () => {
    setDownloading(true);
    try {
      const sessions = await attendanceService.getSessions();
      const headers = ["Session ID", "Date", "Time Slot", "Class", "Subject", "Total Students", "Present", "Absent", "Late", "Attendance Rate"];
      const rows = [headers];

      sessions.forEach((s) => {
        const cls = classes.find((c) => c.id === s.classId);
        const total = s.totalStudents || (s.presentCount + s.absentCount) || 1;
        const rate = Math.round(((s.presentCount + (s.lateCount || 0)) / total) * 100);

        rows.push([
          s.id,
          s.date,
          s.sessionTime || "N/A",
          cls?.name || s.classId,
          s.subjectName || "N/A",
          s.totalStudents,
          s.presentCount,
          s.absentCount,
          s.lateCount || 0,
          `${rate}%`,
        ]);
      });

      triggerCsvDownload(`campusconnect_attendance_audit_${new Date().toISOString().split("T")[0]}.csv`, rows);
      setFeedback("Attendance audit report exported successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DashboardLayout
      title="Academic Reports & Data Export"
      subtitle="Generate compliant institutional reports and download structured CSV records"
    >
      <div className="space-y-6">
        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Report Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Student Enrollment Roster</h3>
              <p className="text-xs text-slate-500 mt-1">
                Complete student records including ID, roll numbers, department, class, and enrollment statuses.
              </p>
            </div>
            <button
              onClick={handleExportStudents}
              disabled={downloading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Students CSV
            </button>
          </div>

          {/* Faculty Report Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Faculty Allocations Report</h3>
              <p className="text-xs text-slate-500 mt-1">
                Teacher appointments, departmental designations, employee IDs, and assigned teaching classes.
              </p>
            </div>
            <button
              onClick={handleExportTeachers}
              disabled={downloading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Faculty CSV
            </button>
          </div>

          {/* Attendance Report Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Attendance Audit Report</h3>
              <p className="text-xs text-slate-500 mt-1">
                Session-by-session roll-call verification, attendance rates, and absence records across departments.
              </p>
            </div>
            <button
              onClick={handleExportAttendance}
              disabled={downloading}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Attendance CSV
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
