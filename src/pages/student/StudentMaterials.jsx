import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { materialService } from "../../services/materialService";
import { FileText, Download, Search, Filter, BookOpen, Clock, ShieldCheck } from "lucide-react";

export const StudentMaterials = () => {
  const { user } = useAuth();
  const { subjects, classes } = useCollege();

  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(true);

  // STRICT CLASS ISOLATION: Only fetch materials belonging to the student's enrolled class
  const studentClassId = user?.classId || "cse-y2-a";
  const myClass = classes.find((c) => c.id === studentClassId);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const items = await materialService.getMaterials(studentClassId);
        setMaterials(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
    const handleUpdate = () => fetchMaterials();
    window.addEventListener("campusconnect_materials_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_materials_updated", handleUpdate);
  }, [studentClassId]);

  const filtered = materials.filter((mat) => {
    const matchSub = selectedSubject === "all" || mat.subjectId === selectedSubject;
    const matchSearch =
      mat.title.toLowerCase().includes(search.toLowerCase()) ||
      mat.topic?.toLowerCase().includes(search.toLowerCase()) ||
      mat.teacherName?.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  return (
    <DashboardLayout
      title="Class Study Materials & Digital Repository"
      subtitle={`Course lecture notes and documents for ${myClass?.name || "Enrolled Class"}`}
    >
      <div className="space-y-6">
        {/* Security & Isolation Badge */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Authorized repository for <strong>{myClass?.name}</strong>. Out-of-class course notes are isolated per Firestore Security Rules.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-blue-600 bg-white px-2 py-0.5 rounded shadow-xs">
            Secured Access
          </span>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm">No study materials found for this subject filter.</p>
            </div>
          ) : (
            filtered.map((mat) => (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {mat.subjectName || "Subject"}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Uploaded: {mat.uploadDate}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{mat.title}</h3>
                  {mat.topic && (
                    <p className="text-xs font-semibold text-blue-600">Module: {mat.topic}</p>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {mat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-medium text-slate-700 block">
                      Instructor: {mat.teacherName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {mat.fileName} • {mat.fileSize}
                    </span>
                  </div>

                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
