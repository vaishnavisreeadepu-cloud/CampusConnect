import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { assignmentService } from "../../services/assignmentService";
import { ClipboardList, Clock, CheckCircle2, FileText, Download } from "lucide-react";

export const AssignmentOverview = () => {
  const { classes } = useCollege();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const [asgs, subs] = await Promise.all([
          assignmentService.getAssignments(),
          assignmentService.getSubmissionsForAssignment(null),
        ]);
        setAssignments(asgs);
        setSubmissions(subs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
    const handleUpdate = () => fetchAssignments();
    window.addEventListener("campusconnect_assignments_updated", handleUpdate);
    window.addEventListener("campusconnect_submissions_updated", handleUpdate);
    return () => {
      window.removeEventListener("campusconnect_assignments_updated", handleUpdate);
      window.removeEventListener("campusconnect_submissions_updated", handleUpdate);
    };
  }, []);

  return (
    <DashboardLayout
      title="Academic Assignments Overview"
      subtitle="Track active coursework, deadlines, student submission quotas, and grading progress"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Courseworks</span>
            <p className="text-3xl font-extrabold text-slate-900">{assignments.length}</p>
            <p className="text-[11px] text-slate-400">Total assignments across classes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</span>
            <p className="text-3xl font-extrabold text-blue-600">{submissions.length}</p>
            <p className="text-[11px] text-slate-400">Student answers submitted</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Graded Tasks</span>
            <p className="text-3xl font-extrabold text-emerald-600">
              {submissions.filter((s) => s.status === "graded").length}
            </p>
            <p className="text-[11px] text-slate-400">Marks published with faculty feedback</p>
          </div>
        </div>

        <div className="space-y-4">
          {assignments.map((asg) => {
            const asgSubs = submissions.filter((s) => s.assignmentId === asg.id);
            const gradedCount = asgSubs.filter((s) => s.status === "graded").length;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {asg.subjectName || "Subject"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Class: <strong>{asg.className || asg.classId}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {new Date(asg.dueDate).toLocaleString()}
                    </span>
                    <span className="font-semibold text-slate-700">Max Marks: {asg.maxMarks}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{asg.description}</p>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-4">
                    <span>Submissions: <strong className="text-slate-800">{asgSubs.length} Received</strong></span>
                    <span>•</span>
                    <span>Evaluations: <strong className="text-emerald-700">{gradedCount} Graded</strong></span>
                  </div>

                  {asg.fileUrl && (
                    <a
                      href={asg.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {asg.fileName || "Assignment Sheet"}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};
