import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { attendanceService } from "../../services/attendanceService";
import { CheckSquare, Calendar, Users, Filter, Clock } from "lucide-react";

export const AttendanceOverview = () => {
  const { classes } = useCollege();
  const [sessions, setSessions] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await attendanceService.getSessions();
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    const handleUpdate = () => fetchSessions();
    window.addEventListener("campusconnect_attendanceSessions_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_attendanceSessions_updated", handleUpdate);
  }, []);

  const filtered = selectedClass === "all" ? sessions : sessions.filter((s) => s.classId === selectedClass);

  const totalSessions = sessions.length;
  const totalPresentLogs = sessions.reduce((acc, curr) => acc + (curr.presentCount || 0), 0);
  const totalAbsences = sessions.reduce((acc, curr) => acc + (curr.absentCount || 0), 0);

  return (
    <DashboardLayout
      title="Institutional Attendance Overview"
      subtitle="Audit lecture roll-call sessions, student attendance rates, and compliance logs"
    >
      <div className="space-y-6">
        {/* Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recorded Sessions</span>
            <p className="text-3xl font-extrabold text-slate-900">{totalSessions}</p>
            <p className="text-[11px] text-slate-400">Classroom lectures conducted</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Presences</span>
            <p className="text-3xl font-extrabold text-emerald-600">{totalPresentLogs}</p>
            <p className="text-[11px] text-slate-400">Recorded present or late check-in</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Absences</span>
            <p className="text-3xl font-extrabold text-rose-600">{totalAbsences}</p>
            <p className="text-[11px] text-slate-400">Recorded absences</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Filter By Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:outline-none"
            >
              <option value="all">All Academic Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Present</th>
                  <th className="py-3 px-4">Absent</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No attendance sessions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const cls = classes.find((c) => c.id === s.classId);
                    const total = s.totalStudents || (s.presentCount + s.absentCount + (s.lateCount || 0)) || 1;
                    const pct = Math.round(((s.presentCount + (s.lateCount || 0)) / total) * 100);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{s.date}</span>
                          <span className="text-[10px] text-slate-400">{s.sessionTime || "Regular slot"}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {cls?.name || s.classId}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-blue-700">{s.subjectName || "Subject"}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          {s.presentCount} Scholars
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-700">
                          {s.absentCount} Scholars
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 75 ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
