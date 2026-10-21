import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { authService } from "../../services/authService";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";

export const StudentManagement = () => {
  const { departments, classes } = useCollege();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    studentId: "",
    rollNumber: "",
    departmentId: departments[0]?.id || "dept-cse",
    classId: classes[0]?.id || "cse-y2-a",
    year: "2nd Year",
    semester: "4th Semester",
    section: "A",
    enrollmentYear: "2024",
    password: "Student@123",
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadStudents = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      setStudents(allUsers.filter((u) => u.role === "student"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    const handleUpdate = () => loadStudents();
    window.addEventListener("campusconnect_users_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_users_updated", handleUpdate);
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const targetClass = classes.find((c) => c.id === formData.classId);
      await authService.provisionUser({
        ...formData,
        role: "student",
        className: targetClass?.name || "Class",
        departmentId: targetClass?.departmentId || formData.departmentId,
      });

      setFeedback({ type: "success", message: `Student ${formData.fullName} enrolled successfully.` });
      setAddModalOpen(false);
      setFormData(initialForm);
      loadStudents();
    } catch (err) {
      setFormError(err.message || "Failed to provision student.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (student) => {
    try {
      const newStatus = !student.active;
      await authService.updateUserProfile(student.uid || student.id, { active: newStatus });
      setFeedback({
        type: "success",
        message: `Student ${student.fullName} has been ${newStatus ? "reactivated" : "deactivated"}.`,
      });
      loadStudents();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === "all" || s.departmentId === selectedDept;
    const matchClass = selectedClass === "all" || s.classId === selectedClass;
    return matchSearch && matchDept && matchClass;
  });

  return (
    <DashboardLayout
      title="Student Directory & Enrollment"
      subtitle="Manage student admissions, batch allocations, and profile credentials"
      actions={
        <button
          onClick={() => {
            setFormData(initialForm);
            setFormError(null);
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Enroll New Student
        </button>
      }
    >
      <div className="space-y-6">
        {/* Feedback Alert */}
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

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, roll, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student ID / Roll</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Department & Class</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => {
                    const dept = departments.find((d) => d.id === student.departmentId);
                    const cls = classes.find((c) => c.id === student.classId);

                    return (
                      <tr key={student.id || student.uid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{student.studentId || "N/A"}</span>
                          <span className="text-[10px] text-slate-400">Roll: #{student.rollNumber || "N/A"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={student.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=128&q=80"}
                              alt={student.fullName}
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{student.fullName}</span>
                              <span className="text-[10px] text-slate-500">{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">{dept?.name || "Dept"}</span>
                          <span className="text-[10px] text-blue-600 font-medium">{cls?.name || student.className || "Class"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-600 block">{student.phone || "N/A"}</span>
                          <span className="text-[10px] text-slate-400">Enrolled: {student.enrollmentYear || "2024"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              student.active !== false
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {student.active !== false ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => setViewStudent(student)}
                            title="View student profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(student)}
                            title={student.active !== false ? "Deactivate account" : "Reactivate account"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              student.active !== false
                                ? "text-slate-500 hover:text-red-600 hover:bg-red-50"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {student.active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

        {/* Enroll Student Modal */}
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
                <h3 className="text-lg font-bold text-slate-900">Enroll New Scholar</h3>
                <p className="text-xs text-slate-500">
                  Provisions Firebase Auth credentials and sets up the student's academic dossier.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateStudent} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Lee"
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
                      placeholder="jordan.lee@campusconnect.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student ID (Unique) *</label>
                    <input
                      type="text"
                      required
                      placeholder="STU-2024-009"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="109"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assign Class & Section *</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 432-1000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                    <input
                      type="text"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">Can be changed by student after first login</span>
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
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    {submitting ? "Enrolling..." : "Enroll Scholar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Student Profile Modal */}
        {viewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
              <button
                onClick={() => setViewStudent(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <img
                  src={viewStudent.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80"}
                  alt={viewStudent.fullName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-600/30"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewStudent.fullName}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    ID: {viewStudent.studentId || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll Number</span>
                  <span className="font-bold text-slate-800">{viewStudent.rollNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Enrollment Year</span>
                  <span className="font-bold text-slate-800">{viewStudent.enrollmentYear || "2024"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Class Cohort</span>
                  <span className="font-bold text-slate-800">{viewStudent.className || "Class"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status</span>
                  <span className="font-bold text-emerald-700">
                    {viewStudent.active !== false ? "Active Enrolled" : "Suspended"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{viewStudent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{viewStudent.phone || "No phone listed"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
