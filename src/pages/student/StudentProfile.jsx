import React, { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import { User, Mail, Phone, Lock, Save, CheckCircle2, ShieldCheck, Heart } from "lucide-react";

export const StudentProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    phone: user?.phone || "+1 (555) 654-3210",
    emergencyContact: user?.emergencyContact || "+1 (555) 999-1234",
    bloodGroup: user?.bloodGroup || "O+",
    address: user?.address || "742 Evergreen Terrace, Tech District",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateUserProfile(user.uid || user.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Scholar Profile & Records"
      subtitle="Institutional student dossier, official academic registration, and contact information"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Personal contact information updated successfully.</span>
          </div>
        )}

        {/* Read-Only Academic Record Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80"}
              alt={user?.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-600/30"
            />
            <div>
              <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
              <p className="text-xs text-blue-700 font-semibold">{user?.className || "Computer Science Scholar"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                  Student ID: {user?.studentId || "STU-001"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  Roll: #{user?.rollNumber || "101"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Protected Official Academic Data (Immutable)
              </span>
              <span className="text-[10px] text-slate-400">Maintained by College Registrar</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <strong className="text-slate-800">{user?.email}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Enrollment Year</span>
                <strong className="text-slate-800">{user?.enrollmentYear || "2024"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Academic Year</span>
                <strong className="text-slate-800">{user?.year || "2nd Year"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Semester</span>
                <strong className="text-slate-800">{user?.semester || "4th Semester"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cohort Section</span>
                <strong className="text-slate-800">Section {user?.section || "A"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Account Status</span>
                <strong className="text-emerald-700">Active Good Standing</strong>
              </div>
            </div>
          </div>

          {/* Permitted Editable Personal Fields Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Permitted Personal Contact Updates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Personal Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                <input
                  type="text"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving changes..." : "Save Personal Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
