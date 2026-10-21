import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { materialService } from "../../services/materialService";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
} from "lucide-react";

export const TeacherNotes = () => {
  const { user } = useAuth();
  const { classes, subjects } = useCollege();

  const [materials, setMaterials] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const assignedClassIds = user?.assignedClasses || ["cse-y2-a"];
  const myClasses = classes.filter((c) => assignedClassIds.includes(c.id));

  const initialForm = {
    title: "",
    description: "",
    classId: myClasses[0]?.id || "cse-y2-a",
    subjectId: subjects[0]?.id || "sub-dsa",
    topic: "",
  };
  const [formData, setFormData] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadMaterials = async () => {
    try {
      const all = await materialService.getMaterials();
      // Show only materials uploaded by this teacher
      setMaterials(all.filter((m) => m.teacherId === (user?.uid || user?.id)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMaterials();
    const handleUpdate = () => loadMaterials();
    window.addEventListener("campusconnect_materials_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_materials_updated", handleUpdate);
  }, [user]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!file) {
      setFormError("Please select a document or presentation file to upload.");
      return;
    }

    setUploading(true);
    try {
      const sub = subjects.find((s) => s.id === formData.subjectId);

      await materialService.uploadMaterial(
        {
          ...formData,
          subjectName: sub?.name || "Subject",
          teacherId: user?.uid || user?.id,
          teacherName: user?.fullName || "Professor",
        },
        file
      );

      setFeedback({ type: "success", message: `Study document "${formData.title}" uploaded and shared with enrolled class.` });
      setModalOpen(false);
      setFormData(initialForm);
      setFile(null);
      loadMaterials();
    } catch (err) {
      setFormError(err.message || "Failed to upload study material.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete study material "${title}"?`)) {
      try {
        await materialService.deleteMaterial(id, user?.uid || user?.id);
        loadMaterials();
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      }
    }
  };

  return (
    <DashboardLayout
      title="Study Materials & Lecture Notes"
      subtitle="Upload and manage syllabus documents, lecture presentations, and course notes"
      actions={
        <button
          onClick={() => {
            setFormData(initialForm);
            setFile(null);
            setFormError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload New Material
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm">No lecture materials uploaded yet.</p>
              <p className="text-xs text-slate-500 mt-1">Upload PDF, DOCX, or PPTX slides for your classes.</p>
            </div>
          ) : (
            materials.map((mat) => {
              const cls = classes.find((c) => c.id === mat.classId);

              return (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {mat.subjectName || "Subject"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Class: <strong className="text-slate-700">{cls?.name || mat.classId}</strong>
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{mat.title}</h3>
                    {mat.topic && (
                      <p className="text-xs font-semibold text-blue-600">Topic: {mat.topic}</p>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {mat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-slate-400">
                      {mat.fileName} • {mat.fileSize}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={mat.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 font-bold"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(mat.id, mat.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Upload Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">Upload Course Study Material</h3>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 3: Graph Algorithms & Minimum Spanning Trees"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Syllabus Module</label>
                  <input
                    type="text"
                    placeholder="e.g. Prim's & Kruskal's Algorithms"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Reading Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Provide overview of key concepts covered..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select File (PDF, DOCX, PPTX, Images • Max 25MB) *
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files[0])}
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
                    disabled={uploading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {uploading ? "Uploading file..." : "Publish Material"}
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
