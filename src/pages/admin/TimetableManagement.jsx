import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useCollege } from "../../contexts/CollegeContext";
import { collegeService } from "../../services/collegeService";
import { authService } from "../../services/authService";
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Building2,
  Filter,
} from "lucide-react";

export const TimetableManagement = () => {
  const { classes, subjects } = useCollege();
  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "cse-y2-a");
  const [modalOpen, setModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const initialForm = {
    classId: selectedClass,
    dayOfWeek: "Monday",
    timeSlot: "09:00 - 10:00",
    subjectId: subjects[0]?.id || "sub-dsa",
    teacherId: "",
    roomNumber: "Tech Hall 304",
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    try {
      const [tt, users] = await Promise.all([
        collegeService.getTimetable(),
        authService.getAllUsers(),
      ]);
      setTimetable(tt);
      const faculty = users.filter((u) => u.role === "teacher");
      setTeachers(faculty);
      if (faculty.length > 0 && !formData.teacherId) {
        setFormData((prev) => ({ ...prev, teacherId: faculty[0].uid || faculty[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("campusconnect_timetable_updated", handleUpdate);
    return () => window.removeEventListener("campusconnect_timetable_updated", handleUpdate);
  }, []);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "09:00 - 10:00",
    "10:15 - 11:15",
    "11:15 - 12:15",
    "12:15 - 13:15",
    "14:00 - 15:00",
    "15:15 - 16:15",
  ];

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setConflictWarning(null);
    setSuccessMsg(null);

    const sub = subjects.find((s) => s.id === formData.subjectId);
    const tea = teachers.find((t) => t.uid === formData.teacherId || t.id === formData.teacherId);

    try {
      await collegeService.createTimetableEntry({
        ...formData,
        subjectName: sub?.name || "Subject",
        teacherName: tea?.fullName || "Professor",
      });

      setSuccessMsg("Timetable entry scheduled without conflicts.");
      setModalOpen(false);
      loadData();
    } catch (err) {
      // Conflict detection warning display
      setConflictWarning(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this lecture time-slot?")) {
      await collegeService.deleteTimetableEntry(id);
      loadData();
    }
  };

  const classTimetable = timetable.filter((t) => t.classId === selectedClass);

  return (
    <DashboardLayout
      title="Class Timetable & Conflict Engine"
      subtitle="Intelligent schedule allocation with automated classroom & teacher double-booking prevention"
      actions={
        <button
          onClick={() => {
            setFormData({ ...initialForm, classId: selectedClass });
            setConflictWarning(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Schedule Slot
        </button>
      }
    >
      <div className="space-y-6">
        {/* Alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Class Selector Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Displaying Timetable For:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable Weekly Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((day) => {
            const dayEntries = classTimetable.filter((e) => e.dayOfWeek === day);

            return (
              <div
                key={day}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{day}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {dayEntries.length} Slots
                  </span>
                </div>

                <div className="space-y-2.5">
                  {dayEntries.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No lectures scheduled</p>
                  ) : (
                    dayEntries.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{slot.subjectName}</span>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                            title="Remove lecture"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {slot.timeSlot}
                          </span>
                          <span className="text-blue-700 font-medium">Room: {slot.roomNumber}</span>
                        </div>

                        <p className="text-[10px] text-slate-400">Instructor: {slot.teacherName}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Schedule Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900">Schedule Class Lecture</h3>

              {/* Conflict Detection Banner */}
              {conflictWarning && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Schedule Conflict Detected!</strong>
                    <span>{conflictWarning}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateEntry} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Class *</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week *</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {timeSlots.map((ts) => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Instructor *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {teachers.map((t) => (
                      <option key={t.uid || t.id} value={t.uid || t.id}>
                        {t.fullName} ({t.employeeId || "Faculty"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Classroom / Lab *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tech Hall 304"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                  >
                    Schedule Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
