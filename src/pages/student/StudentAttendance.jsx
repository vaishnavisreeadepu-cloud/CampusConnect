import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { attendanceService } from "../../services/attendanceService";
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";

export const StudentAttendance = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalHeld: 0,
    totalAttended: 0,
    totalAbsent: 0,
    overallPercentage: 100,
    subjectBreakdown: [],
    history: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await attendanceService.getStudentAttendanceAnalytics(user?.uid || user?.id);
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const handleUpdate = () => fetchAnalytics();
    window.addEventListener("campusconnect_attendanceRecords_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_attendanceRecords_updated", handleUpdate);
  }, [user]);

  return (
    <DashboardLayout
      title="My Academic Attendance Records"
      subtitle="Subject-wise percentage calculations, presence audit trail, and regulatory compliance"
    >
      <div className="space-y-6">
        {/* Attendance Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</span>
            <p className={`text-3xl font-extrabold ${analytics.overallPercentage >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
              {analytics.overallPercentage}%
            </p>
            <p className="text-[11px] text-slate-400">75% required by Academic Council</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Lectures Held</span>
            <p className="text-3xl font-extrabold text-slate-900">{analytics.totalHeld}</p>
            <p className="text-[11px] text-slate-400">Class sessions conducted</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classes Attended</span>
            <p className="text-3xl font-extrabold text-emerald-600">{analytics.totalAttended}</p>
            <p className="text-[11px] text-slate-400">Marked present or late</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recorded Absences</span>
            <p className="text-3xl font-extrabold text-rose-600">{analytics.totalAbsent}</p>
            <p className="text-[11px] text-slate-400">Excused and unexcused absences</p>
          </div>
        </div>

        {/* Warning Alert if Attendance < 75% */}
        {analytics.overallPercentage < 75 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="block font-bold">Attendance Debarment Notice:</strong>
              <span>
                Your overall rate is below the statutory 75% requirement. Attend remaining scheduled sessions to preserve examination eligibility.
              </span>
            </div>
          </div>
        )}

        {/* Subject-wise breakdown cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Subject-Wise Attendance Breakdown</h3>

          {analytics.subjectBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No attendance sessions registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.subjectBreakdown.map((sub) => (
                <div
                  key={sub.subjectId}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{sub.subjectName}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        sub.percentage >= 75
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sub.percentage >= 75 ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Held: <strong>{sub.total}</strong></span>
                    <span>Present: <strong className="text-emerald-700">{sub.present}</strong></span>
                    <span>Late: <strong className="text-amber-700">{sub.late}</strong></span>
                    <span>Absent: <strong className="text-rose-700">{sub.absent}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historical Roll-Call Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Official Attendance Audit History</h3>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Verified by Faculty Signatures
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Lecture Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Recorded Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.history.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      No individual logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  analytics.history.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{rec.date}</td>
                      <td className="py-3 px-4 text-blue-700 font-medium">{rec.subjectName || "Subject"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rec.status === "present"
                              ? "bg-emerald-100 text-emerald-800"
                              : rec.status === "late"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{rec.remarks || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
