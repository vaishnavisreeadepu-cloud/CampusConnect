import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { assignmentService } from "../../services/assignmentService";
import {
  ClipboardList,
  Upload,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  X,
  AlertCircle,
  Award,
} from "lucide-react";

export const StudentAssignments = () => {
  const { user } = useAuth();
  const { classes } = useCollege();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submitModalAssignment, setSubmitModalAssignment] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState(null);

  const studentClassId = user?.classId || "cse-y2-a";

  const loadData = async () => {
    try {
      const [asgs, subs] = await Promise.all([
        assignmentService.getAssignments(studentClassId),
        assignmentService.getStudentSubmissions(user?.uid || user?.id),
      ]);
      setAssignments(asgs);
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("campusconnect_assignments_updated", handleUpdate);
    window.addEventListener("campusconnect_submissions_updated", handleUpdate);
    return () => {
      window.removeEventListener("campusconnect_assignments_updated", handleUpdate);
      window.removeEventListener("campusconnect_submissions_updated", handleUpdate);
    };
  }, [user, studentClassId]);

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!textContent.trim() && !file) {
      setFeedbackAlert({ type: "error", message: "Please enter text answers or upload your solution document." });
      return;
    }

    setSubmitting(true);
    try {
      await assignmentService.submitAssignment(
        submitModalAssignment.id,
        user,
        textContent,
        file
      );

      setFeedbackAlert({ type: "success", message: `Assignment "${submitModalAssignment.title}" submitted successfully.` });
      setSubmitModalAssignment(null);
      setTextContent("");
      setFile(null);
      loadData();
    } catch (err) {
      setFeedbackAlert({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Coursework Assignments & Submissions"
      subtitle="View curriculum deadlines, submit solution artifacts, and inspect published feedback"
    >
      <div className="space-y-6">
        {feedbackAlert && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              feedbackAlert.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedbackAlert.message}</span>
            </div>
            <button onClick={() => setFeedbackAlert(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {assignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm">No assignments active for your class cohort.</p>
            </div>
          ) : (
            assignments.map((asg) => {
              // Find student's own submission
              const sub = submissions.find((s) => s.assignmentId === asg.id);
              const isPastDue = new Date() > new Date(asg.dueDate);

              return (
                <div
                  key={asg.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {asg.subjectName || "Subject"}
                      </span>
                      <span className="text-xs text-slate-400">
                        Instructor: <strong className="text-slate-700">{asg.teacherName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {new Date(asg.dueDate).toLocaleString()}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sub?.status === "graded"
                            ? "bg-emerald-100 text-emerald-800"
                            : sub?.status === "late"
                            ? "bg-amber-100 text-amber-800"
                            : sub
                            ? "bg-blue-100 text-blue-800"
                            : isPastDue
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {sub?.status === "graded"
                          ? `Graded: ${sub.marksAwarded}/${asg.maxMarks}`
                          : sub?.status === "late"
                          ? "Submitted Late"
                          : sub
                          ? "Submitted"
                          : isPastDue
                          ? "Overdue"
                          : "Pending Submission"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{asg.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 whitespace-pre-line">
                      {asg.description}
                    </p>
                  </div>

                  {asg.fileUrl && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600">Attached Problem Specifications:</span>
                      <a
                        href={asg.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {asg.fileName || "Download Problem File"}
                      </a>
                    </div>
                  )}

                  {/* Submission Status or Graded Feedback Card */}
                  {sub && (
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-blue-600" />
                          My Submitted Work
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      {sub.textContent && (
                        <p className="text-xs text-slate-700 whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-200/60">
                          {sub.textContent}
                        </p>
                      )}

                      {sub.fileUrl && (
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {sub.fileName || "My Solution Document"}
                          </a>
                        </div>
                      )}

                      {/* Faculty Marks & Feedback */}
                      {sub.status === "graded" && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1">
                              <Award className="w-4 h-4 text-emerald-600" />
                              Official Evaluation
                            </span>
                            <span className="text-xs font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-xs">
                              {sub.marksAwarded} / {asg.maxMarks} Marks
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 pt-1 leading-relaxed">
                            <strong>Faculty Feedback:</strong> {sub.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit / Re-submit Action */}
                  <div className="pt-2 flex justify-end">
                    {sub?.status === "graded" ? (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Final marks recorded
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSubmitModalAssignment(asg);
                          setTextContent(sub?.textContent || "");
                          setFile(null);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-4 h-4" />
                        {sub ? "Update Submission" : "Turn In Assignment"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submit Modal */}
        {submitModalAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4">
              <button
                onClick={() => setSubmitModalAssignment(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">
                Submit Solution: {submitModalAssignment.title}
              </h3>
              <p className="text-xs text-slate-500">
                Max Marks: {submitModalAssignment.maxMarks} Points • Due: {new Date(submitModalAssignment.dueDate).toLocaleString()}
              </p>

              <form onSubmit={handleSubmitWork} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Written Answer / Solution Text
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide written answers, code snippets, or methodology description..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Solution Document (PDF, DOCX, ZIP, Images • Max 25MB)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSubmitModalAssignment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    {submitting ? "Submitting..." : "Confirm & Turn In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
