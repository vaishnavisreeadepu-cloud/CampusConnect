import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { NotificationBell } from "../notifications/NotificationBell";
import {
  GraduationCap,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export const Navbar = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const { settings } = useCollege();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/about" ||
    location.pathname === "/academics" ||
    location.pathname === "/departments" ||
    location.pathname === "/facilities" ||
    location.pathname === "/notices" ||
    location.pathname === "/contact" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Academics", path: "/academics" },
    { name: "Departments", path: "/departments" },
    { name: "Facilities", path: "/facilities" },
    { name: "Notices", path: "/notices" },
    { name: "Contact", path: "/contact" },
  ];

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "teacher") return "/teacher";
    if (user.role === "student") return "/student";
    return "/";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      {/* Top emergency announcement ticker or quick role switch ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white tracking-wide uppercase">
            {settings?.collegeCode || "CAMPUS"}
          </span>
          <span className="truncate max-w-xs sm:max-w-md text-slate-300 font-medium">
            {settings?.tagLine || "Empowering Minds, Shaping Tomorrow"}
          </span>
        </div>

        {/* Demo Role Quick Switcher */}
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <span className="text-[11px] text-slate-400 hidden md:inline">Quick Role Switch:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => switchDemoRole("admin")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                user?.role === "admin"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => switchDemoRole("teacher")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                user?.role === "teacher"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => switchDemoRole("student")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                user?.role === "student"
                  ? "bg-blue-500 text-white font-bold shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              Student
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & College Name */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 p-2">
              <img src="/logo.svg" alt="College Crest" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors block leading-tight">
                {settings?.collegeName || "CampusConnect"}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest hidden sm:block">
                Academic Management Portal
              </span>
            </div>
          </Link>

          {/* Public Desktop Navigation Links */}
          {isPublicPage && (
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-blue-700 bg-blue-50/80 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Action buttons / Auth status */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notification Bell */}
                <NotificationBell />

                {/* Dashboard Shortcut */}
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  My Dashboard
                </Link>

                {/* Profile pill & dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80 text-left"
                  >
                    <img
                      src={
                        user.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
                      }
                      alt={user.fullName}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-600/20"
                    />
                    <div className="hidden md:block leading-tight pr-1">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                        {user.fullName}
                      </p>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                            {user.role} portal
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`${getDashboardPath()}/profile`}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile & Settings
                      </Link>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        Go to Dashboard
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Shield className="w-4 h-4" />
                  Portal Login
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            {isPublicPage && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && isPublicPage && (
          <div className="lg:hidden py-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    location.pathname === link.path
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <div className="pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-blue-900 text-white font-bold text-sm shadow-sm"
                  >
                    <Shield className="w-4 h-4" />
                    Sign In to Portal
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
