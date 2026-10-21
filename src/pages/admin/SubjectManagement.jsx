import React, { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { collegeService } from "../../services/collegeService";
import { BookOpen, Plus, Trash2, Edit2, X } from "lucide-react";

export const SubjectManagement = () => {
  const { subjects, departments, refreshCollegeData } = useCollege();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    departmentId: departments[0]?.id || "dept-cse",
    credits: 4,
    semester: "4th Semester",
    type: "Theory + Lab",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await collegeService.createSubject(formData);
    refreshCollegeData();
    setModalOpen(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete subject ${name}?`)) {
      await collegeService.deleteSubject(id);
      refreshCollegeData();
    }
  };

  return (
    <DashboardLayout
      title="Subjects & Course Syllabus"
      subtitle="Define course credits, semester association, and lab modules"
      actions={
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const dept = departments.find((d) => d.id === sub.departmentId);
            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {sub.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm pt-1">{sub.name}</h3>
                    <p className="text-xs text-slate-500">{dept?.name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(sub.id, sub.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px] text-center border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Credits</span>
                    <strong className="text-slate-800">{sub.credits} Credits</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Semester</span>
                    <strong className="text-slate-800">{sub.semester}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Format</span>
                    <strong className="text-blue-700">{sub.type}</strong>
                  </div>
                </div>
              </div>
            );
          })}
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

              <h3 className="text-lg font-bold text-slate-900">Define Academic Subject</h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS404"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs uppercase focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Credit Hours *</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      required
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineering & Design Patterns"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option>Theory + Lab</option>
                      <option>Theory Only</option>
                      <option>Lab Only</option>
                      <option>Seminar / Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                    <input
                      type="text"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
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
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    Save Subject
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
