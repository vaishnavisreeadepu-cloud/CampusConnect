import React, { useState } from "react";
import { useCollege } from "../../contexts/CollegeContext";
import { collegeService } from "../../services/collegeService";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

export const ContactPage = () => {
  const { settings } = useCollege();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    programInterested: "General Inquiry",
    previousEducation: "N/A",
    message: "",
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    try {
      await collegeService.submitEnquiry(formData);
      setStatus({ loading: false, success: true, error: null });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        programInterested: "General Inquiry",
        previousEducation: "N/A",
        message: "",
      });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Campus Office & Direction
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact College Administration
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Reach out to our registrar, admissions office, or department deans for assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 text-sm">Campus Address</h4>
              <p>{settings?.address}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 text-sm">Telephone Hotline</h4>
              <p>{settings?.phone}</p>
              <p className="text-[11px] text-slate-400">Office hours: Mon – Sat, 9:00 AM – 5:00 PM</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 text-sm">Official Email</h4>
              <p>{settings?.email}</p>
              <p className="text-[11px] text-slate-400">Registrar: registrar@apex-tech.edu</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-base mb-1">Send a Direct Message</h3>
          <p className="text-xs text-slate-500 mb-6">
            Inquiries will be routed directly to the appropriate dean or administrative officer.
          </p>

          {status.success && (
            <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! Your inquiry has been dispatched to college administration.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Email *</label>
                <input
                  type="email"
                  required
                  placeholder="email@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+1 555-0100"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
              <textarea
                rows={4}
                required
                placeholder="How can our administration assist you?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {status.loading ? "Sending..." : "Transmit Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
