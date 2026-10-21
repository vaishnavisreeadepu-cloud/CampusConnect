import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { materialService } from "../../services/materialService";
import { assignmentService } from "../../services/assignmentService";
import { attendanceService } from "../../services/attendanceService";
import { authService } from "../../services/authService";
import {
  FolderOpen,
  BookOpen,
  Users,
  FileText,
  ClipboardList,
  CheckSquare,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const { classes, subjects } = useCollege();

  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter only classes assigned to this teacher
  const assignedClassIds = user?.assignedClasses || ["cse-y2-a"];
  const myClasses = classes.filter((c) => assignedClassIds.includes(c.id));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mats, asgs, subs, allUsers] = await Promise.all([
          materialService.getMaterials(),
          assignmentService.getAssignments(),
          assignmentService.getSubmissionsForAssignment(null),
          authService.getAllUsers(),
        ]);

        // Materials uploaded by this teacher
        setMaterials(mats.filter((m) => m.teacherId === (user?.uid || user?.id)));
        
        // Assignments created for this teacher's classes
        const myAsgs = asgs.filter((a) => assignedClassIds.includes(a.classId));
        setAssignments(myAsgs);

        const myAsgIds = myAsgs.map((a) => a.id);
        setSubmissions(subs.filter((s) => myAsgIds.includes(s.assignmentId)));

        // Students in assigned classes
        const students = allUsers.filter(
          (u) => u.role === "student" && assignedClassIds.includes(u.classId)
        );
        setEnrolledStudents(students);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const pendingGradingCount = submissions.filter((s) => s.status !== "graded").length;

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.fullName || "Professor"}`}
      subtitle={`${user?.designation || "Faculty"} • Department of Computer Science & Engineering`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/teacher/attendance"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Take Attendance
          </Link>
          <Link
            to="/teacher/notes"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Notes
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Assigned Classes</span>
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{myClasses.length}</p>
            <p className="text-[11px] text-slate-500">{enrolledStudents.length} enrolled scholars</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Study Materials</span>
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{materials.length}</p>
            <p className="text-[11px] text-slate-500">PDFs, lecture slides & notes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Assignments</span>
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{assignments.length}</p>
            <p className="text-[11px] text-slate-500">{submissions.length} total submissions</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Grading</span>
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-extrabold text-amber-600">{pendingGradingCount}</p>
            <p className="text-[11px] text-slate-500">Submissions awaiting review</p>
          </div>
        </div>

        {/* Assigned Classes Quick View */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              My Authorized Class Cohorts
            </h3>
            <Link to="/teacher/classes" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View student lists
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myClasses.map((cls) => {
              const classScholars = enrolledStudents.filter((s) => s.classId === cls.id);
              return (
                <div key={cls.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      Section {cls.section}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{cls.name}</h4>
                    <p className="text-xs text-slate-500">Room: {cls.roomNumber} • {classScholars.length} Enrolled</p>
                  </div>
                  <Link
                    to="/teacher/students"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    View Roster
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Course Materials & Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Recently Uploaded Notes</h3>
              <Link to="/teacher/notes" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                Manage all
              </Link>
            </div>
            <div className="space-y-2.5">
              {materials.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No materials uploaded yet.</p>
              ) : (
                materials.slice(0, 3).map((mat) => (
                  <div key={mat.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 truncate">{mat.title}</span>
                      <span className="text-[10px] text-slate-400">{mat.fileSize}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{mat.subjectName} • {mat.topic}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Coursework Assignments</h3>
              <Link to="/teacher/assignments" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                Grade & review
              </Link>
            </div>
            <div className="space-y-2.5">
              {assignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No assignments published.</p>
              ) : (
                assignments.slice(0, 3).map((asg) => (
                  <div key={asg.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 truncate">{asg.title}</span>
                      <span className="text-[10px] text-amber-600 font-semibold">Max: {asg.maxMarks} Marks</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Due: {new Date(asg.dueDate).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
