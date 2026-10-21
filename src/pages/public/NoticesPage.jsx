import React, { useState, useEffect } from "react";
import { announcementService } from "../../services/announcementService";
import { useAuth } from "../../contexts/AuthContext";
import { Bell, Search, Filter, Calendar, Clock, Download, AlertCircle } from "lucide-react";

export const NoticesPage = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const unsub = announcementService.subscribeAnnouncements(user, (items) => {
      setAnnouncements(items);
    });
    return () => unsub();
  }, [user]);

  const categories = [
    { label: "All Notices", value: "all" },
    { label: "Examinations", value: "exam" },
    { label: "Holidays", value: "holiday" },
    { label: "Events & Hackathons", value: "event" },
    { label: "Academic Guidance", value: "academic" },
    { label: "Urgent Alerts", value: "emergency" },
  ];

  const filtered = announcements.filter((ann) => {
    const matchCat = selectedCategory === "all" || ann.category === selectedCategory;
    const matchSearch =
      ann.title.toLowerCase().includes(search.toLowerCase()) ||
      ann.content.toLowerCase().includes(search.toLowerCase()) ||
      ann.authorName?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Official Notice Board
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          College Announcements & Circulars
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Stay up to date with official college orders, semester schedules, holiday notifications, and examinations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === c.value
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Announcement List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No announcements match your search criteria.</p>
          </div>
        ) : (
          filtered.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs transition-shadow hover:shadow-md space-y-3 ${
                ann.priority === "high"
                  ? "border-red-200 bg-red-50/10"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === "exam"
                        ? "bg-red-100 text-red-800"
                        : ann.category === "holiday"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ann.category}
                  </span>
                  {ann.priority === "high" && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      High Priority
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Published: {ann.publishDate}
                  </span>
                  {ann.expiryDate && (
                    <span>Valid until: {ann.expiryDate}</span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {ann.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-3">
                  <span>Issued By: <strong className="text-slate-700">{ann.authorName}</strong></span>
                  <span>Target Audience: <strong className="text-blue-600">{ann.audience}</strong></span>
                </div>

                {ann.attachmentUrl && (
                  <a
                    href={ann.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {ann.attachmentName || "View Circular Attachment"}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
