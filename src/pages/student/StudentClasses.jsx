import React from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { FolderOpen, BookOpen, User, Building, Award } from "lucide-react";

export const StudentClasses = () => {
  const { user } = useAuth();
  const { classes, subjects, departments } = useCollege();

  const studentClassId = user?.classId || "cse-y2-a";
  const myClass = classes.find((c) => c.id === studentClassId);
  const myDept = departments.find((d) => d.id === (myClass?.departmentId || user?.departmentId));

  // Subjects for student's department/semester
  const classSubjects = subjects.filter((s) => s.departmentId === myClass?.departmentId);

  return (
    <DashboardLayout
      title="My Enrolled Cohort & Subjects"
      subtitle="Official academic batch registration, course curriculum, and instructional syllabi"
    >
      <div className="space-y-6">
        {/* Cohort Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Registered Class
              </span>
              <h2 className="text-xl font-bold text-slate-900">{myClass?.name || user?.className}</h2>
              <p className="text-xs text-slate-500">{myDept?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Academic Year</span>
              <strong className="text-slate-800">{myClass?.academicYear || "2026-2027"}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Current Semester</span>
              <strong className="text-slate-800">{myClass?.semester || "4th Semester"}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Lecture Hall</span>
              <strong className="text-slate-800">{myClass?.roomNumber || "Tech Hall 304"}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Section</span>
              <strong className="text-blue-700">Section {myClass?.section || "A"}</strong>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Taught Subjects This Term</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(classSubjects.length > 0 ? classSubjects : subjects).map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {sub.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base pt-1">{sub.name}</h4>
                    <span className="text-xs text-blue-700 font-semibold">{sub.type}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{sub.description}</p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Semester: <strong>{sub.semester}</strong></span>
                  <span className="font-bold text-slate-900">{sub.credits} Credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
