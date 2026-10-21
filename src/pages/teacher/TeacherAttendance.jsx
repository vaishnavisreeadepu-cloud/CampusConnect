import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { attendanceService } from "../../services/attendanceService";
import { authService } from "../../services/authService";
import {
  CheckSquare,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Check,
  X,
  Clock,
  Sparkles,
} from "lucide-react";

export const TeacherAttendance = () => {
  const { user } = useAuth();
  const { classes, subjects } = useCollege();

  const assignedClassIds = user?.assignedClasses || ["cse-y2-a"];
  const myClasses = classes.filter((c) => assignedClassIds.includes(c.id));

  // Selection state
  const [selectedClassId, setSelectedClassId] = useState(myClasses[0]?.id || "cse-y2-a");
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "sub-dsa");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTime, setSessionTime] = useState("09:00 - 10:00");

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: 'present' | 'absent' | 'late' }
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Load students for active class
  useEffect(() => {
    const fetchStudents = async () => {
      const allUsers = await authService.getAllUsers();
      const enrolled = allUsers.filter(
        (u) => u.role === "student" && u.classId === selectedClassId
      );
      setStudents(enrolled);

      // Default all to 'present' for easy roll-call
      const initialMap = {};
      enrolled.forEach((st) => {
        initialMap[st.uid || st.id] = "present";
      });
      setAttendanceMap(initialMap);
    };

    fetchStudents();
  }, [selectedClassId]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((st) => {
      updated[st.uid || st.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    setFeedback(null);
    if (students.length === 0) {
      setFeedback({ type: "error", message: "No enrolled students found in this class." });
      return;
    }

    setSaving(true);
    try {
      const sub = subjects.find((s) => s.id === selectedSubjectId);

      const records = students.map((st) => ({
        studentId: st.uid || st.id,
        studentName: st.fullName,
        rollNumber: st.rollNumber || "N/A",
        status: attendanceMap[st.uid || st.id] || "present",
      }));

      await attendanceService.recordAttendanceSession(
        {
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          subjectName: sub?.name || "Subject",
          teacherId: user?.uid || user?.id,
          date,
          sessionTime,
        },
        records
      );

      setFeedback({
        type: "success",
        message: `Attendance session for ${date} successfully recorded (${records.length} scholars logged).`,
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === "present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "absent").length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === "late").length;

  return (
    <DashboardLayout
      title="Roll-Call Attendance Ledger"
      subtitle="Record and commit daily classroom attendance with duplicate session prevention"
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Configuration Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Class *</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {myClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lecture Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
              <select
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option>09:00 - 10:00</option>
                <option>10:15 - 11:15</option>
                <option>11:15 - 12:15</option>
                <option>12:15 - 13:15</option>
                <option>14:00 - 15:00</option>
                <option>15:15 - 16:15</option>
              </select>
            </div>
          </div>

          {/* Quick status bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Quick Mark:</span>
              <button
                type="button"
                onClick={() => handleMarkAll("present")}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll("absent")}
                className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
              >
                All Absent
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-emerald-700">{presentCount} Present</span>
              <span className="text-red-700">{absentCount} Absent</span>
              <span className="text-amber-700">{lateCount} Late</span>
            </div>
          </div>
        </div>

        {/* Student Roll-Call Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Scholar Name</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No scholars enrolled in this class.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => {
                    const stId = st.uid || st.id;
                    const currentStatus = attendanceMap[stId] || "present";

                    return (
                      <tr key={stId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          #{st.rollNumber || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={st.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=128&q=80"}
                              alt={st.fullName}
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <span className="font-bold text-slate-900">{st.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {st.studentId || "STU"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/70">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(stId, "present")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                currentStatus === "present"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(stId, "late")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                currentStatus === "late"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(stId, "absent")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                currentStatus === "absent"
                                  ? "bg-red-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Submit Attendance Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Session: <strong>{date} ({sessionTime})</strong>
            </span>
            <button
              onClick={handleSaveAttendance}
              disabled={saving || students.length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Committing records..." : "Commit Attendance Session"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
