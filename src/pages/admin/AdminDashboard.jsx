import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { authService } from "../../services/authService";
import { announcementService } from "../../services/announcementService";
import { collegeService } from "../../services/collegeService";
import {
  Users,
  GraduationCap,
  Building2,
  FolderOpen,
  BookOpen,
  Bell,
  HelpCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export const AdminDashboard = () => {
  const { settings, departments, classes, subjects } = useCollege();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allUsers, annList, enqList] = await Promise.all([
          authService.getAllUsers(),
          announcementService.getAnnouncements(),
          collegeService.getEnquiries(),
        ]);

        setStudents(allUsers.filter((u) => u.role === "student"));
        setTeachers(allUsers.filter((u) => u.role === "teacher"));
        setAnnouncements(annList);
        setEnquiries(enqList);
      } catch (err) {
        console.error("Failed to load admin metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen to changes
    const reload = () => fetchData();
    window.addEventListener("campusconnect_users_updated", reload);
    window.addEventListener("campusconnect_announcements_updated", reload);
    window.addEventListener("campusconnect_enquiries_updated", reload);

    return () => {
      window.removeEventListener("campusconnect_users_updated", reload);
      window.removeEventListener("campusconnect_announcements_updated", reload);
      window.removeEventListener("campusconnect_enquiries_updated", reload);
    };
  }, []);

  const pendingEnquiriesCount = enquiries.filter((e) => e.status === "pending").length;

  const statCards = [
    {
      label: "Total Students",
      count: students.length,
      icon: GraduationCap,
      color: "bg-blue-600 text-white",
      link: "/admin/students",
      sub: `${students.filter((s) => s.active !== false).length} active enrollments`,
    },
    {
      label: "Total Faculty",
      count: teachers.length,
      icon: Users,
      color: "bg-emerald-600 text-white",
      link: "/admin/teachers",
      sub: "Across all departments",
    },
    {
      label: "Departments",
      count: departments.length,
      icon: Building2,
      color: "bg-purple-600 text-white",
      link: "/admin/departments",
      sub: `${subjects.length} active subjects`,
    },
    {
      label: "Classes & Sections",
      count: classes.length,
      icon: FolderOpen,
      color: "bg-indigo-600 text-white",
      link: "/admin/classes",
      sub: `${settings?.academicYear || "2026-2027"} Cohort`,
    },
    {
      label: "Published Notices",
      count: announcements.length,
      icon: Bell,
      color: "bg-amber-600 text-white",
      link: "/admin/announcements",
      sub: "Live circulars & orders",
    },
    {
      label: "Admissions Enquiries",
      count: enquiries.length,
      icon: HelpCircle,
      color: "bg-rose-600 text-white",
      link: "/admin/enquiries",
      sub: `${pendingEnquiriesCount} pending reviews`,
    },
  ];

  return (
    <DashboardLayout
      title="Administrative Governance Portal"
      subtitle={`Overseeing ${settings?.collegeName || "CampusConnect"} Institutional Systems`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Enroll Student
          </Link>
          <Link
            to="/admin/announcements"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            New Notice
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link
                key={idx}
                to={stat.link}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex items-start justify-between"
              >
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {stat.label}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {loading ? "..." : stat.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{stat.sub}</p>
                </div>

                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform ${stat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Dual Grid: Recent Enquiries & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Pending Admission Enquiries */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Admissions Enquiries
                </h3>
              </div>
              <Link
                to="/admin/enquiries"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View all ({enquiries.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {enquiries.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No enquiries received yet.</p>
              ) : (
                enquiries.slice(0, 4).map((enq) => (
                  <div
                    key={enq.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{enq.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{enq.programInterested}</p>
                      <span className="text-[10px] text-slate-400">{enq.email} • {enq.phone}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
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
                ))
              )}
            </div>
          </div>

          {/* Active Announcements */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Published College Announcements
                </h3>
              </div>
              <Link
                to="/admin/announcements"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Manage Notices
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No circulars published yet.</p>
              ) : (
                announcements.slice(0, 4).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 truncate">{ann.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{ann.publishDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{ann.content}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                      <span>Audience: <strong className="text-blue-600">{ann.audience}</strong></span>
                      <span>•</span>
                      <span>Category: <strong className="uppercase">{ann.category}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold">Academic Configuration & Reports</h3>
            <p className="text-xs text-slate-300">
              Configure class timetables, audit attendance trends, and export compliant CSV records.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/timetable"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              Class Timetables
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Export CSV Reports
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
