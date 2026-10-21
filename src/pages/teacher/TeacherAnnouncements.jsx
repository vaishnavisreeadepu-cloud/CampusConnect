import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { announcementService } from "../../services/announcementService";
import { Bell, Plus, Trash2, Clock, X, CheckCircle2, AlertCircle } from "lucide-react";

export const TeacherAnnouncements = () => {
  const { user } = useAuth();
  const { classes } = useCollege();

  const assignedClassIds = user?.assignedClasses || ["cse-y2-a"];
  const myClasses = classes.filter((c) => assignedClassIds.includes(c.id));

  const [announcements, setAnnouncements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "academic",
    priority: "medium",
    audience: myClasses[0]?.id || "cse-y2-a",
  });
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const all = await announcementService.getAnnouncements(user);
      setAnnouncements(all.filter((a) => a.authorId === (user?.uid || user?.id)));
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
      await announcementService.createAnnouncement({
        ...formData,
        authorId: user.uid || user.id,
        authorName: user.fullName || "Professor",
        authorRole: "teacher",
        publishDate: new Date().toISOString().split("T")[0],
      });

      setFeedback({ type: "success", message: "Class notice published for enrolled scholars." });
      setModalOpen(false);
      setFormData({
        title: "",
        content: "",
        category: "academic",
        priority: "medium",
        audience: myClasses[0]?.id || "cse-y2-a",
      });
      loadAnnouncements();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Archive and delete this notice?")) {
      await announcementService.deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  return (
    <DashboardLayout
      title="Class Academic Announcements"
      subtitle="Publish syllabus guidelines, lab schedules, and examination instructions to your assigned cohorts"
      actions={
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post Class Notice
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
          {announcements.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold">No class notices posted yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Post announcements targeted directly to your students.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    Cohort: {ann.audience}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ann.publishDate}
                    </span>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{ann.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>
              </div>
            ))
          )}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">Post Class Academic Notice</h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Class *</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {myClasses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notice Heading *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Extra Guidance Session on Graph Traversal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Details & Instructions *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full description for the class..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
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
                    {submitting ? "Publishing..." : "Post to Class"}
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
