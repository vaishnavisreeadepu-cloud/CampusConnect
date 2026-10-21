import React from "react";
import { useCollege } from "../../contexts/CollegeContext";
import { Building2, Users, BookOpen, GraduationCap } from "lucide-react";

export const DepartmentsPage = () => {
  const { departments, classes, subjects } = useCollege();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Academic Departments
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Specialized Engineering Disciplines
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Comprehensive degree programs structured with intensive lab practice and research opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {departments.map((dept) => {
          const deptClasses = classes.filter((c) => c.departmentId === dept.id);
          const deptSubjects = subjects.filter((s) => s.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                    Dept Code: {dept.code}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 pt-2">{dept.name}</h3>
                  <p className="text-xs font-semibold text-blue-700">HOD: {dept.headOfDepartment}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {dept.description}
              </p>

              {/* Sections & Subjects Count */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Active Cohorts & Sections</span>
                  <span className="font-bold text-slate-800">{deptClasses.length} Registered Classes</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Core & Elective Curricula</span>
                  <span className="font-bold text-slate-800">{deptSubjects.length || 4} Taught Subjects</span>
                </div>
              </div>

              {/* Available Subjects Preview */}
              {deptSubjects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Featured Core Subjects
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {deptSubjects.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                      >
                        {s.code}: {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
