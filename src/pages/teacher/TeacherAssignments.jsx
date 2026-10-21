import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { assignmentService } from "../../services/assignmentService";
import {
  ClipboardList,
  Plus,
  Trash2,
  Clock,
  Download,
  CheckCircle2,
  Eye,
  FileCheck,
  X,
  AlertCircle,
} from "lucide-react";

export const TeacherAssignments = () => {
  const { user } = useAuth();
  const { classes, subjects } = useCollege();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Create Assignment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const assignedClassIds = user?.assignedClasses || ["cse-y2-a"];
  const myClasses = classes.filter((c) => assignedClassIds.includes(c.id));

  const initialForm = {
    title: "",
    description: "",
    classId: myClasses[0]?.id || "cse-y2-a",
    subjectId: subjects[0]?.id || "sub-dsa",
    maxMarks: 50,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
  };
  const [formData, setFormData] = useState(initialForm);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // Grade Submission Modal
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeMarks, setGradeMarks] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState(null);

  const loadData = async () => {
    try {
      const [asgs, subs] = await Promise.all([
        assignmentService.getAssignments(),
        assignmentService.getSubmissionsForAssignment(null),
      ]);

      const myAsgs = asgs.filter((a) => assignedClassIds.includes(a.classId));
      setAssignments(myAsgs);
      setSubmissions(subs);
      if (myAsgs.length > 0 && !selectedAssignment) {
        setSelectedAssignment(myAsgs[0]);
      }
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
  }, [user]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const sub = subjects.find((s) => s.id === formData.subjectId);
      const cls = classes.find((c) => c.id === formData.classId);

      await assignmentService.createAssignment(
        {
          ...formData,
          subjectName: sub?.name || "Subject",
          className: cls?.name || "Class",
          teacherId: user?.uid || user?.id,
          teacherName: user?.fullName || "Professor",
        },
        attachmentFile
      );

      setFeedbackAlert({ type: "success", message: `Assignment "${formData.title}" published successfully.` });
      setCreateModalOpen(false);
      setFormData(initialForm);
      setAttachmentFile(null);
      loadData();
    } catch (err) {
      setFeedbackAlert({ type: "error", message: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setSubmittingGrade(true);

    try {
      await assignmentService.gradeSubmission(
        gradingSubmission.id,
        gradeMarks,
        gradeFeedback,
        user?.uid || user?.id
      );

      setFeedbackAlert({ type: "success", message: `Grade & feedback published for ${gradingSubmission.studentName}.` });
      setGradingSubmission(null);
      loadData();
    } catch (err) {
      setFeedbackAlert({ type: "error", message: err.message });
    } finally {
      setSubmittingGrade(false);
    }
  };

  const activeSubmissions = selectedAssignment
    ? submissions.filter((s) => s.assignmentId === selectedAssignment.id)
    : [];

  return (
    <DashboardLayout
      title="Assignments & Submission Grading"
      subtitle="Issue coursework briefs, evaluate student answers, and publish marks"
      actions={
        <button
          onClick={() => {
            setFormData(initialForm);
            setAttachmentFile(null);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      }
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Assignment List Column */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Active Courseworks ({assignments.length})
            </h3>

            {assignments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No assignments created yet. Click "Create Assignment" above.
              </div>
            ) : (
              assignments.map((asg) => {
                const isSelected = selectedAssignment?.id === asg.id;
                const asgSubs = submissions.filter((s) => s.assignmentId === asg.id);

                return (
                  <div
                    key={asg.id}
                    onClick={() => setSelectedAssignment(asg)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/10 shadow-sm"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {asg.subjectName}
                      </span>
                      <span className="text-[10px] text-amber-600 font-bold">
                        Max Marks: {asg.maxMarks}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{asg.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{asg.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                      <span className="font-bold text-slate-700">
                        {asgSubs.length} Submissions
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Submissions & Grading Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            {selectedAssignment ? (
              <>
                <div className="pb-4 border-b border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Reviewing Submissions For:
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{selectedAssignment.title}</h3>
                  <p className="text-xs text-slate-500">
                    Target Class: <strong>{selectedAssignment.className}</strong> • Maximum Points: <strong>{selectedAssignment.maxMarks}</strong>
                  </p>
                </div>

                <div className="space-y-3">
                  {activeSubmissions.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-1">
                      <ClipboardList className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <p className="text-xs font-semibold">No students have submitted this assignment yet.</p>
                      <p className="text-[11px] text-slate-400">Submissions will appear here live when students submit.</p>
                    </div>
                  ) : (
                    activeSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{sub.studentName}</span>
                            <span className="text-[10px] text-slate-400">
                              Roll: #{sub.studentRoll} • Submitted: {new Date(sub.submittedAt).toLocaleString()}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              sub.status === "graded"
                                ? "bg-emerald-100 text-emerald-800"
                                : sub.status === "late"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {sub.status === "graded" ? `Graded: ${sub.marksAwarded}/${selectedAssignment.maxMarks}` : sub.status}
                          </span>
                        </div>

                        {sub.textContent && (
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                            <strong className="block text-[10px] text-slate-400 mb-0.5">Written Solution:</strong>
                            <p className="whitespace-pre-line leading-relaxed">{sub.textContent}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          {sub.fileUrl ? (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {sub.fileName || "Student Attachment"}
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">No file attached</span>
                          )}

                          <button
                            onClick={() => {
                              setGradingSubmission(sub);
                              setGradeMarks(sub.marksAwarded || "");
                              setGradeFeedback(sub.feedback || "");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
                          >
                            {sub.status === "graded" ? "Edit Grade / Remarks" : "Grade Submission"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">Select an assignment to inspect submissions.</p>
            )}
          </div>
        </div>

        {/* Create Assignment Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">Create New Coursework Assignment</h3>

              <form onSubmit={handleCreateAssignment} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assignment 2: Complex SQL Queries & Triggers"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Class *</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
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
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Due Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Points (Marks) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.maxMarks}
                      onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instructions / Problem Statement *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide detailed submission requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Problem Sheet / Attachment (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    {creating ? "Publishing..." : "Publish Assignment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grade Submission Modal */}
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
              <button
                onClick={() => setGradingSubmission(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">
                Grade Submission: {gradingSubmission.studentName}
              </h3>
              <p className="text-xs text-slate-500">
                Roll Number: #{gradingSubmission.studentRoll} • Assignment Max: {selectedAssignment.maxMarks} Points
              </p>

              <form onSubmit={handleSaveGrade} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marks Awarded *</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedAssignment.maxMarks}
                    required
                    placeholder={`0 – ${selectedAssignment.maxMarks}`}
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Feedback & Remarks *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide constructive assessment and review..."
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGrade}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    {submittingGrade ? "Saving Grade..." : "Publish Grade & Feedback"}
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
