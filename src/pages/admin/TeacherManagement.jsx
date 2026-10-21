import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { authService } from "../../services/authService";
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  BookOpen,
} from "lucide-react";

export const TeacherManagement = () => {
  const { departments, classes, subjects } = useCollege();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    employeeId: "",
    designation: "Assistant Professor",
    qualification: "M.Tech / Ph.D.",
    departmentId: departments[0]?.id || "dept-cse",
    assignedClasses: [classes[0]?.id || "cse-y2-a"],
    assignedSubjects: [subjects[0]?.id || "sub-dsa"],
    password: "Teacher@123",
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadTeachers = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      setTeachers(allUsers.filter((u) => u.role === "teacher"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    const handleUpdate = () => loadTeachers();
    window.addEventListener("campusconnect_users_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_users_updated", handleUpdate);
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await authService.provisionUser({
        ...formData,
        role: "teacher",
      });

      setFeedback({ type: "success", message: `Faculty member ${formData.fullName} appointed successfully.` });
      setAddModalOpen(false);
      setFormData(initialForm);
      loadTeachers();
    } catch (err) {
      setFormError(err.message || "Failed to appoint faculty member.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (teacher) => {
    try {
      const newStatus = !teacher.active;
      await authService.updateUserProfile(teacher.uid || teacher.id, { active: newStatus });
      setFeedback({
        type: "success",
        message: `Teacher ${teacher.fullName} has been ${newStatus ? "reactivated" : "deactivated"}.`,
      });
      loadTeachers();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const filtered = teachers.filter((t) => {
    const matchSearch =
      t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === "all" || t.departmentId === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <DashboardLayout
      title="Faculty & Teacher Directory"
      subtitle="Manage faculty credentials, academic ranks, and class allocations"
      actions={
        <button
          onClick={() => {
            setFormData(initialForm);
            setFormError(null);
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Appoint New Faculty
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

        {/* Filter and Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by faculty name or Employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Faculty ID</th>
                  <th className="py-3 px-4">Name & Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Classes & Subjects</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No faculty members found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((teacher) => {
                    const dept = departments.find((d) => d.id === teacher.departmentId);

                    return (
                      <tr key={teacher.id || teacher.uid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {teacher.employeeId || "FAC-000"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={teacher.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"}
                              alt={teacher.fullName}
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{teacher.fullName}</span>
                              <span className="text-[10px] text-blue-700 font-medium">{teacher.designation || "Faculty"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{dept?.name || "Dept"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-700 block font-medium">
                              Classes: {teacher.assignedClasses?.join(", ") || "None"}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Subjects: {teacher.assignedSubjects?.join(", ") || "None"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              teacher.active !== false
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {teacher.active !== false ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => setViewTeacher(teacher)}
                            title="View faculty dossier"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(teacher)}
                            title={teacher.active !== false ? "Deactivate account" : "Reactivate account"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              teacher.active !== false
                                ? "text-slate-500 hover:text-red-600 hover:bg-red-50"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {teacher.active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appoint Faculty Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
              <button
                onClick={() => setAddModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Appoint Faculty Member</h3>
                <p className="text-xs text-slate-500">
                  Provision teacher login credentials and assign authorized classes and subjects.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTeacher} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Alan Turing"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="alan.turing@campusconnect.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID (Unique) *</label>
                    <input
                      type="text"
                      required
                      placeholder="FAC-201"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="Associate Professor"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Qualification</label>
                    <input
                      type="text"
                      placeholder="Ph.D. in Computer Science"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Classes</label>
                  <select
                    multiple
                    value={formData.assignedClasses}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                      setFormData({ ...formData, assignedClasses: selected });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none h-20"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400">Hold Cmd/Ctrl to select multiple classes</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    {submitting ? "Appointing..." : "Appoint Faculty"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Teacher Modal */}
        {viewTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
              <button
                onClick={() => setViewTeacher(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <img
                  src={viewTeacher.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"}
                  alt={viewTeacher.fullName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-600/30"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewTeacher.fullName}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Employee ID: {viewTeacher.employeeId || "N/A"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 text-xs border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Designation</span>
                  <span className="font-bold text-slate-800">{viewTeacher.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Qualification</span>
                  <span className="font-bold text-slate-800">{viewTeacher.qualification || "Ph.D."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Classes</span>
                  <span className="font-bold text-blue-700">{viewTeacher.assignedClasses?.join(", ") || "None"}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{viewTeacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{viewTeacher.phone || "No phone listed"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
