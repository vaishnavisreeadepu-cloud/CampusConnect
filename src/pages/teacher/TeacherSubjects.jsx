import React from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { BookOpen, Award, CheckCircle } from "lucide-react";

export const TeacherSubjects = () => {
  const { user } = useAuth();
  const { subjects, departments } = useCollege();

  const assignedSubjectIds = user?.assignedSubjects || ["sub-dsa", "sub-dbms"];
  const mySubjects = subjects.filter((s) => assignedSubjectIds.includes(s.id));

  return (
    <DashboardLayout
      title="My Assigned Instructional Subjects"
      subtitle="Curriculum syllabi, laboratory requirements, and credit allocations"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mySubjects.map((sub) => {
          const dept = departments.find((d) => d.id === sub.departmentId);

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                    {sub.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 pt-1">{sub.name}</h3>
                  <p className="text-xs text-slate-500">{dept?.name}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{sub.description}</p>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 text-xs border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">Credits</span>
                  <strong className="text-slate-800">{sub.credits} Credits</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Semester</span>
                  <strong className="text-slate-800">{sub.semester}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Format</span>
                  <strong className="text-blue-700">{sub.type}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};
