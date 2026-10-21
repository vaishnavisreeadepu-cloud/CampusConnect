import React, { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { collegeService } from "../../services/collegeService";
import { FolderOpen, Plus, Trash2, Edit2, X, CheckCircle2 } from "lucide-react";

export const ClassManagement = () => {
  const { classes, departments, refreshCollegeData, settings } = useCollege();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    departmentId: departments[0]?.id || "dept-cse",
    year: "2nd Year",
    semester: "4th Semester",
    section: "A",
    roomNumber: "Tech Hall 304",
    academicYear: settings?.academicYear || "2026-2027",
    capacity: 60,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === formData.departmentId);
    await collegeService.createClass({
      ...formData,
      departmentName: dept?.name || "Department",
    });
    refreshCollegeData();
    setModalOpen(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete class ${name}?`)) {
      await collegeService.deleteClass(id);
      refreshCollegeData();
    }
  };

  return (
    <DashboardLayout
      title="Classes & Cohort Sections"
      subtitle="Organize batch allocations, assigned classrooms, and semester cohorts"
      actions={
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const dept = departments.find((d) => d.id === cls.departmentId);
            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      Section {cls.section}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm pt-1">{cls.name}</h3>
                    <p className="text-xs text-slate-500">{dept?.name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(cls.id, cls.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Room Allocation</span>
                    <strong className="text-slate-800">{cls.roomNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cohort Capacity</span>
                    <strong className="text-slate-800">{cls.capacity || 60} Scholars</strong>
                  </div>
                </div>
              </div>
            );
          })}
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

              <h3 className="text-lg font-bold text-slate-900">Create Academic Class</h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech CSE - 3rd Year (Section A)"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Room Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tech Hall 304"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
                    <input
                      type="text"
                      required
                      placeholder="A"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
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
                    Save Class
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
