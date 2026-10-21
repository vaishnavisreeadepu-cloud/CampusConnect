import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  BookOpen,
  FileText,
  ClipboardList,
  CheckSquare,
  MessageSquare,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  HelpCircle,
  FileBarChart,
  CalendarCheck,
} from "lucide-react";

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role;

  // Nav configurations per role
  const adminNav = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Student Management", path: "/admin/students", icon: GraduationCap },
    { name: "Teacher Management", path: "/admin/teachers", icon: Users },
    { name: "Departments", path: "/admin/departments", icon: Building2 },
    { name: "Classes & Sections", path: "/admin/classes", icon: FolderOpen },
    { name: "Subjects", path: "/admin/subjects", icon: BookOpen },
    { name: "Announcements", path: "/admin/announcements", icon: Bell },
    { name: "Timetable", path: "/admin/timetable", icon: Calendar },
    { name: "Attendance Overview", path: "/admin/attendance", icon: CheckSquare },
    { name: "Assignment Overview", path: "/admin/assignments", icon: ClipboardList },
    { name: "Admission Enquiries", path: "/admin/enquiries", icon: HelpCircle },
    { name: "Reports & CSV", path: "/admin/reports", icon: FileBarChart },
    { name: "College Settings", path: "/admin/settings", icon: Settings },
    { name: "Profile", path: "/admin/profile", icon: User },
  ];

  const teacherNav = [
    { name: "Dashboard", path: "/teacher", icon: LayoutDashboard },
    { name: "My Classes", path: "/teacher/classes", icon: FolderOpen },
    { name: "Student Lists", path: "/teacher/students", icon: GraduationCap },
    { name: "Study Materials", path: "/teacher/notes", icon: FileText },
    { name: "Assignments", path: "/teacher/assignments", icon: ClipboardList },
    { name: "Take Attendance", path: "/teacher/attendance", icon: CheckSquare },
    { name: "My Timetable", path: "/teacher/timetable", icon: Calendar },
    { name: "Student Messages", path: "/teacher/messages", icon: MessageSquare },
    { name: "Announcements", path: "/teacher/announcements", icon: Bell },
    { name: "Profile", path: "/teacher/profile", icon: User },
  ];

  const studentNav = [
    { name: "Dashboard", path: "/student", icon: LayoutDashboard },
    { name: "College Notices", path: "/student/notices", icon: Bell },
    { name: "My Class & Subjects", path: "/student/classes", icon: BookOpen },
    { name: "Notes & Materials", path: "/student/materials", icon: FileText },
    { name: "Assignments", path: "/student/assignments", icon: ClipboardList },
    { name: "My Attendance", path: "/student/attendance", icon: CheckSquare },
    { name: "Weekly Timetable", path: "/student/timetable", icon: CalendarCheck },
    { name: "Faculty Messages", path: "/student/messages", icon: MessageSquare },
    { name: "My Profile", path: "/student/profile", icon: User },
  ];

  let items = [];
  if (role === "admin") items = adminNav;
  else if (role === "teacher") items = teacherNav;
  else if (role === "student") items = studentNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out lg:static ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } ${isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header / Brand */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md p-2">
              <img src="/logo.svg" alt="Emblem" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-white text-base tracking-tight block">
                  CampusConnect
                </span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  {role} portal
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card Pill */}
        {!collapsed && user && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
            <img
              src={
                user.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
              }
              alt={user.fullName}
              className="w-9 h-9 rounded-lg object-cover ring-2 ring-blue-500/30 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {user.studentId || user.employeeId || user.email}
              </p>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen?.(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-950 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title="Sign out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
