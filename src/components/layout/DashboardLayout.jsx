import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Top Global Bar */}
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Role Sidebar */}
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

        {/* Content Body */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Dashboard Sub-Header */}
          <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {title || "Dashboard Overview"}
                  </h1>
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons (e.g. Add Student, Create Assignment) */}
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>

          {/* Page Child View */}
          <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
