import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { authService } from "../../services/authService";
import { messageService } from "../../services/messageService";
import { FolderOpen, Search, MessageSquare, Eye, Users, Mail, Phone, X, CheckSquare } from "lucide-react";

export const TeacherClasses = () => {
  const { user } = useAuth();
  const { classes, departments, subjects } = useCollege();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [search, setSearch] = useState("");
  const [viewStudent, setViewStudent] = useState(null);

  const assignedClassIds = user?.assignedClasses || ["cse-y2-a"];
  const myClasses = classes.filter((c) => assignedClassIds.includes(c.id));

  useEffect(() => {
    if (myClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(myClasses[0].id);
    }
  }, [myClasses, selectedClassId]);

  useEffect(() => {
    const fetchStudents = async () => {
      const allUsers = await authService.getAllUsers();
      setStudents(allUsers.filter((u) => u.role === "student"));
    };
    fetchStudents();
  }, []);

  const handleMessageStudent = async (student) => {
    try {
      const conv = await messageService.getOrCreateConversation(user, student, selectedClassId);
      navigate("/teacher/messages", { state: { conversationId: conv.id } });
    } catch (err) {
      console.error("Message initialization error:", err);
    }
  };

  const activeClass = myClasses.find((c) => c.id === selectedClassId);
  const enrolledStudents = students.filter((s) => s.classId === selectedClassId);

  const filteredStudents = enrolledStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="My Assigned Classes & Student Rosters"
      subtitle="Authorized class cohorts, student lists, and direct instructional channels"
    >
      <div className="space-y-6">
        {/* Class Selection Tabs */}
        <div className="flex flex-wrap gap-2">
          {myClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedClassId === cls.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              {cls.name}
            </button>
          ))}
        </div>

        {/* Selected Class Details Banner */}
        {activeClass && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Cohort Details
              </span>
              <h3 className="text-base font-bold text-slate-900">{activeClass.name}</h3>
              <p className="text-xs text-slate-500">
                Room: <strong>{activeClass.roomNumber}</strong> • Year: <strong>{activeClass.year}</strong> • Semester: <strong>{activeClass.semester}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/teacher/attendance"
                className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                Mark Attendance
              </Link>
            </div>
          </div>
        )}

        {/* Student Search & List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search students in this class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {filteredStudents.length} Enrolled Scholars
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Roll / ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Contact Coordinates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No scholars found in this cohort matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st.id || st.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">Roll: #{st.rollNumber || "N/A"}</span>
                        <span className="text-[10px] text-slate-400">{st.studentId || "N/A"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={st.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=128&q=80"}
                            alt={st.fullName}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{st.fullName}</span>
                            <span className="text-[10px] text-slate-500">{st.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 block">{st.phone || "No phone"}</span>
                        <span className="text-[10px] text-slate-400">Blood Group: {st.bloodGroup || "N/A"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Enrolled
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setViewStudent(st)}
                          title="View Scholar Profile"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMessageStudent(st)}
                          title="Message Student (1-on-1)"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Profile Modal */}
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
                  <p className="text-xs text-blue-700 font-semibold">Roll Number: {viewStudent.rollNumber || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student ID</span>
                  <span className="font-bold text-slate-800">{viewStudent.studentId}</span>
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
                  <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                  <span className="font-bold text-slate-800">{viewStudent.emergencyContact || "N/A"}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setViewStudent(null);
                    handleMessageStudent(viewStudent);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  Initiate 1-on-1 Direct Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
