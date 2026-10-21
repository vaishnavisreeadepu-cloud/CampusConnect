import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { useAuth } from "../../contexts/AuthContext";
import { announcementService } from "../../services/announcementService";
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Paperclip,
  X,
  CheckCircle2,
  Clock,
  Download,
} from "lucide-react";

export const AnnouncementManagement = () => {
  const { user } = useAuth();
  const { departments, classes } = useCollege();
  const [announcements, setAnnouncements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const initialForm = {
    title: "",
    content: "",
    category: "academic",
    priority: "medium",
    audience: "all",
    publishDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
  };
  const [formData, setFormData] = useState(initialForm);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const items = await announcementService.getAnnouncements(user);
      setAnnouncements(items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    const handleUpdate = () => loadAnnouncements();
    window.addEventListener("campusconnect_announcements_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_announcements_updated", handleUpdate);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await announcementService.createAnnouncement(
        {
          ...formData,
          authorId: user.uid || user.id,
          authorName: user.fullName || "Chief Academic Officer",
          authorRole: user.role,
        },
        attachmentFile
      );

      setFeedback({ type: "success", message: "College Announcement broadcasted successfully." });
      setModalOpen(false);
      setFormData(initialForm);
      setAttachmentFile(null);
      loadAnnouncements();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Archive and delete this announcement?")) {
      await announcementService.deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  return (
    <DashboardLayout
      title="College Announcements & Circulars"
      subtitle="Publish institutional notices, exam schedules, and holiday notifications"
      actions={
        <button
          onClick={() => {
            setFormData(initialForm);
            setAttachmentFile(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Broadcast Announcement
        </button>
      }
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs space-y-3 ${
                ann.priority === "high" ? "border-red-200 bg-red-50/10" : "border-slate-200/80"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === "exam"
                        ? "bg-red-100 text-red-800"
                        : ann.category === "holiday"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ann.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    Audience: {ann.audience}
                  </span>
                  {ann.priority === "high" && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white">
                      High Priority
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Published: {ann.publishDate}
                  </span>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Issued by: <strong className="text-slate-800">{ann.authorName}</strong></span>
                {ann.attachmentUrl && (
                  <a
                    href={ann.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {ann.attachmentName || "Attached Circular"}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">Broadcast College Announcement</h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule for End-Semester Practical Examinations"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="exam">Examination</option>
                      <option value="holiday">Holiday</option>
                      <option value="event">Event / Conclave</option>
                      <option value="academic">Academic Circular</option>
                      <option value="emergency">Urgent Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Priority *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Audience *</label>
                    <select
                      value={formData.audience}
                      onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="all">Entire College (All)</option>
                      <option value="teachers">All Teachers</option>
                      <option value="students">All Students</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>Dept: {d.name}</option>
                      ))}
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>Class: {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Publication Date</label>
                    <input
                      type="date"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notice Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full details of the announcement..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Optional Circular File Attachment</label>
                  <input
                    type="file"
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    {submitting ? "Publishing..." : "Publish Circular"}
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
