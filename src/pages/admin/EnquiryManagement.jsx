import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { collegeService } from "../../services/collegeService";
import { HelpCircle, Mail, Phone, Calendar, Clock, CheckCircle2, X } from "lucide-react";

export const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadEnquiries = async () => {
    try {
      const list = await collegeService.getEnquiries();
      setEnquiries(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
    const handleUpdate = () => loadEnquiries();
    window.addEventListener("campusconnect_enquiries_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_enquiries_updated", handleUpdate);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await collegeService.updateEnquiryStatus(id, newStatus);
    loadEnquiries();
  };

  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  return (
    <DashboardLayout
      title="Admissions Enquiries & Prospect Leads"
      subtitle="Review incoming candidate applications, admission questions, and qualification records"
    >
      <div className="space-y-6">
        {/* Status Filter */}
        <div className="flex gap-2">
          {["all", "pending", "reviewed", "admitted", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === s
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Enquiries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              No admissions enquiries found in this category.
            </div>
          ) : (
            filtered.map((enq) => (
              <div
                key={enq.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{enq.fullName}</h3>
                    <p className="text-xs font-semibold text-blue-700">{enq.programInterested}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      enq.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : enq.status === "admitted"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{enq.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{enq.phone}</span>
                  </div>
                  {enq.previousEducation && (
                    <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                      Prior Record: <strong>{enq.previousEducation}</strong>
                    </div>
                  )}
                </div>

                {enq.message && (
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{enq.message}"
                  </p>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Logged: {new Date(enq.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="admitted">Admitted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
