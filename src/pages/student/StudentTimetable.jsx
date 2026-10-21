import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { collegeService } from "../../services/collegeService";
import { Calendar, Clock, MapPin } from "lucide-react";

export const StudentTimetable = () => {
  const { user } = useAuth();
  const { classes } = useCollege();
  const [timetable, setTimetable] = useState([]);

  const studentClassId = user?.classId || "cse-y2-a";
  const myClass = classes.find((c) => c.id === studentClassId);

  useEffect(() => {
    const fetchTimetable = async () => {
      const all = await collegeService.getTimetable(studentClassId);
      setTimetable(all);
    };
    fetchTimetable();
  }, [studentClassId]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <DashboardLayout
      title="Weekly Class Timetable"
      subtitle={`Lecture schedules, laboratories, and room locations for ${myClass?.name || "My Class"}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const daySlots = timetable.filter((t) => t.dayOfWeek === day);

          return (
            <div
              key={day}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{day}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {daySlots.length} Classes
                </span>
              </div>

              <div className="space-y-2.5">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No lectures on {day}</p>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                    >
                      <span className="font-bold text-slate-900 text-xs block">
                        {slot.subjectName}
                      </span>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {slot.timeSlot}
                        </span>
                        <span className="font-semibold text-blue-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {slot.roomNumber}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Faculty: {slot.teacherName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};
