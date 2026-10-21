import React from "react";
import { useCollege } from "../../contexts/CollegeContext";
import { Calendar, GraduationCap, CheckCircle, FileText, Clock } from "lucide-react";

export const AcademicsPage = () => {
  const { settings } = useCollege();

  const semesters = [
    { name: "Odd Semester (Fall)", months: "August – December", focus: "Core Theory, Foundation Labs & Mid-Terms" },
    { name: "Winter Internship Break", months: "December – January", focus: "Industrial Internships & Capstone Preparation" },
    { name: "Even Semester (Spring)", months: "January – May", focus: "Advanced Specialization Electives & Major Projects" },
    { name: "Summer Research Term", months: "June – July", focus: "Faculty Research & International Exchanges" },
  ];

  const gradingSystem = [
    { grade: "O", range: "90% – 100%", points: "10.0", desc: "Outstanding" },
    { grade: "A+", range: "80% – 89%", points: "9.0", desc: "Excellent" },
    { grade: "A", range: "70% – 79%", points: "8.0", desc: "Very Good" },
    { grade: "B+", range: "60% – 69%", points: "7.0", desc: "Good" },
    { grade: "B", range: "50% – 59%", points: "6.0", desc: "Above Average" },
    { grade: "C", range: "40% – 49%", points: "5.0", desc: "Pass" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          Curriculum & Academic Structure
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Academic Framework & Calendar
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Structured Choice Based Credit System (CBCS) adhering to international engineering accreditation standards.
        </p>
      </div>

      {/* Academic Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">Academic Calendar Overview ({settings?.academicYear})</h3>
            <p className="text-xs text-slate-500">Currently in {settings?.currentSemester}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {semesters.map((sem, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Period {idx + 1}</span>
              <h4 className="font-bold text-slate-900 text-sm">{sem.name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {sem.months}
              </p>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-200">{sem.focus}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CBCS Grading Scheme Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">Choice Based Credit System (CBCS) Evaluation Scheme</h3>
            <p className="text-xs text-slate-500">Standard 10-Point Grade Point Average (GPA) calculations</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Letter Grade</th>
                <th className="py-3 px-4">Marks Range</th>
                <th className="py-3 px-4">Grade Points</th>
                <th className="py-3 px-4">Qualitative Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradingSystem.map((g, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-blue-700">{g.grade}</td>
                  <td className="py-3 px-4">{g.range}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{g.points}</td>
                  <td className="py-3 px-4">{g.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
