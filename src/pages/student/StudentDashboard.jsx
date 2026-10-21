import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { announcementService } from "../../services/announcementService";
import { materialService } from "../../services/materialService";
import { assignmentService } from "../../services/assignmentService";
import { attendanceService } from "../../services/attendanceService";
import {
  GraduationCap,
  BookOpen,
  CheckSquare,
  FileText,
  ClipboardList,
  Bell,
  Clock,
  ArrowRight,
  AlertTriangle,
  Download,
  Calendar,
} from "lucide-react";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { classes, subjects } = useCollege();

  const [announcements, setAnnouncements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalHeld: 0,
    totalAttended: 0,
    overallPercentage: 100,
    subjectBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  const studentClassId = user?.classId || "cse-y2-a";
  const myClass = classes.find((c) => c.id === studentClassId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anns, mats, asgs, subs, attSummary] = await Promise.all([
          announcementService.getAnnouncements(user),
          materialService.getMaterials(studentClassId),
          assignmentService.getAssignments(studentClassId),
          assignmentService.getStudentSubmissions(user?.uid || user?.id),
          attendanceService.getStudentAttendanceAnalytics(user?.uid || user?.id),
        ]);

        setAnnouncements(anns.slice(0, 3));
        setMaterials(mats.slice(0, 3));
        setAssignments(asgs);
        setSubmissions(subs);
        setAttendanceStats(attSummary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen to updates
    const handleUpdate = () => fetchData();
    window.addEventListener("campusconnect_announcements_updated", handleUpdate);
    window.addEventListener("campusconnect_materials_updated", handleUpdate);
    window.addEventListener("campusconnect_assignments_updated", handleUpdate);
    window.addEventListener("campusconnect_submissions_updated", handleUpdate);
    window.addEventListener("campusconnect_attendanceRecords_updated", handleUpdate);

    return () => {
      window.removeEventListener("campusconnect_announcements_updated", handleUpdate);
      window.removeEventListener("campusconnect_materials_updated", handleUpdate);
      window.removeEventListener("campusconnect_assignments_updated", handleUpdate);
      window.removeEventListener("campusconnect_submissions_updated", handleUpdate);
      window.removeEventListener("campusconnect_attendanceRecords_updated", handleUpdate);
    };
  }, [user, studentClassId]);

  const pendingAssignments = assignments.filter((a) => {
    const isSubmitted = submissions.some((s) => s.assignmentId === a.id);
    return !isSubmitted;
  });

  return (
    <DashboardLayout
      title={`Welcome, ${user?.fullName || "Scholar"}`}
      subtitle={`${myClass?.name || user?.className || "Enrolled Cohort"} • Roll #${user?.rollNumber || "101"}`}
      actions={
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          My Assignments
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Scholar Banner with Cohort & Attendance Meter */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Academic Status: Active Regular Scholar
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {myClass?.name || "B.Tech CSE - 2nd Year (Section A)"}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Student ID: <strong className="text-white">{user?.studentId || "STU-001"}</strong> • Room: <strong className="text-white">{myClass?.roomNumber || "Tech Hall 304"}</strong>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[200px] text-center space-y-1">
            <span className="text-[11px] font-semibold text-slate-300 block">Overall Attendance Rate</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-3xl font-extrabold ${attendanceStats.overallPercentage >= 75 ? "text-emerald-400" : "text-amber-400"}`}>
                {attendanceStats.overallPercentage}%
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              {attendanceStats.totalAttended} of {attendanceStats.totalHeld} lectures attended
            </p>
          </div>
        </div>

        {/* Low Attendance Alert if < 75% */}
        {attendanceStats.overallPercentage < 75 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="block font-bold">Attendance Advisory: Below Minimum 75% Threshold</strong>
              <span>
                Your current attendance is {attendanceStats.overallPercentage}%. Please consult with your course faculty to avoid semester exam hall-ticket debarment.
              </span>
            </div>
          </div>
        )}

        {/* Dual Grid: Coursework Deadlines & Study Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upcoming Assignment Deadlines */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Coursework Deadlines</h3>
              </div>
              <Link to="/student/assignments" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                View all ({assignments.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No assignments due right now.</p>
              ) : (
                assignments.map((asg) => {
                  const sub = submissions.find((s) => s.assignmentId === asg.id);

                  return (
                    <div
                      key={asg.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                          {asg.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub?.status === "graded"
                              ? "bg-emerald-100 text-emerald-800"
                              : sub
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sub?.status === "graded"
                            ? `Score: ${sub.marksAwarded}/${asg.maxMarks}`
                            : sub
                            ? "Submitted"
                            : "Pending"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{asg.subjectName}</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          Due: {new Date(asg.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Class Study Materials */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Class Lecture Notes</h3>
              </div>
              <Link to="/student/materials" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                Download library
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {materials.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No notes published for your class yet.</p>
              ) : (
                materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{mat.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{mat.subjectName} • {mat.topic}</p>
                      <span className="text-[10px] text-slate-400">By: {mat.teacherName}</span>
                    </div>

                    <a
                      href={mat.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold shrink-0 transition-colors"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Circulars and Announcements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Official Circulars For My Cohort</h3>
            </div>
            <Link to="/student/notices" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              Notice board
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  {ann.category}
                </span>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{ann.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
                <span className="text-[10px] text-slate-400 block pt-1">{ann.publishDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
