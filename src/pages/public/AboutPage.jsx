import React from "react";
import { useCollege } from "../../contexts/CollegeContext";
import { Award, BookOpen, CheckCircle, ShieldCheck, Target, Users } from "lucide-react";

export const AboutPage = () => {
  const { settings } = useCollege();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
          About Our Institution
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {settings?.collegeName}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Pioneering higher engineering education, scientific inquiry, and technological leadership since {settings?.establishedYear}.
        </p>
      </div>

      {/* Leadership & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"
            alt="Campus Quad"
            className="w-full h-80 object-cover"
          />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Strategic Mission & Philosophy
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our pedagogical philosophy is centered on experiential learning: bridging abstract mathematical foundations with hands-on systems implementation. We empower graduates with the intellectual agility needed for lifelong technological adaptation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
              Accreditation & Approvals
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {settings?.accreditation || "Affiliated with State Technical University | Approved by AICTE | Accredited with Grade A"}
            </p>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Academic Rigor</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Curricula engineered in close partnership with academic councils and leading technology enterprises.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Applied Research</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Over $3.5M in competitive research grants supporting labs in Machine Learning, IoT, and Clean Energy.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Ethical Leadership</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cultivating civic responsibility, professional ethics, and sustainable societal impact in all engineers.
          </p>
        </div>
      </div>
    </div>
  );
};
