import React, { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { collegeService } from "../../services/collegeService";
import { Building2, Plus, Edit2, Trash2, X, CheckCircle2, AlertCircle } from "lucide-react";

export const DepartmentManagement = () => {
  const { departments, refreshCollegeData } = useCollege();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    headOfDepartment: "",
    description: "",
    totalCourses: 4,
  });
  const [status, setStatus] = useState({ loading: false, message: null, error: null });

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        code: dept.code,
        name: dept.name,
        headOfDepartment: dept.headOfDepartment,
        description: dept.description,
        totalCourses: dept.totalCourses || 4,
      });
    } else {
      setEditingDept(null);
      setFormData({
        code: "",
        name: "",
        headOfDepartment: "",
        description: "",
        totalCourses: 4,
      });
    }
    setStatus({ loading: false, message: null, error: null });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: null, error: null });

    try {
      if (editingDept) {
        await collegeService.updateDepartment(editingDept.id, formData);
        setStatus({ loading: false, message: "Department updated successfully.", error: null });
      } else {
        await collegeService.createDepartment(formData);
        setStatus({ loading: false, message: "New Department instituted successfully.", error: null });
      }
      refreshCollegeData();
      setTimeout(() => setModalOpen(false), 800);
    } catch (err) {
      setStatus({ loading: false, message: null, error: err.message });
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove the ${name} department?`)) {
      await collegeService.deleteDepartment(id);
      refreshCollegeData();
    }
  };

  return (
    <DashboardLayout
      title="Academic Departments & Faculties"
      subtitle="Configure academic divisions, head appointments, and curricula scope"
      actions={
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    {dept.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 pt-1">{dept.name}</h3>
                  <p className="text-xs font-semibold text-blue-700">HOD: {dept.headOfDepartment}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(dept)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{dept.description}</p>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>Degree Programs: <strong>{dept.totalCourses} Programs</strong></span>
                <span className="text-emerald-600 font-semibold">Active Division</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">
                {editingDept ? "Edit Department" : "Create New Department"}
              </h3>

              {status.message && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              {status.error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{status.error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-DS"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artificial Intelligence & Data Science"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Head of Department (HOD) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sophia Chen, Ph.D."
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Research focus and specialization areas..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    {status.loading ? "Saving..." : "Save Department"}
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
