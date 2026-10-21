import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCollege } from "../../contexts/CollegeContext";
import { useAuth } from "../../contexts/AuthContext";
import { announcementService } from "../../services/announcementService";
import { collegeService } from "../../services/collegeService";
import {
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  ArrowRight,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Cpu,
  Send,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Search,
} from "lucide-react";

export const HomePage = () => {
  const { settings, departments } = useCollege();
  const { switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [enquiryForm, setEnquiryForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    programInterested: "B.Tech Computer Science & Engineering",
    previousEducation: "",
    message: "",
  });
  const [enquiryStatus, setEnquiryStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    const unsub = announcementService.subscribeAnnouncements(null, (items) => {
      setAnnouncements(items.slice(0, 4));
    });
    return () => unsub();
  }, []);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryForm.fullName || !enquiryForm.email || !enquiryForm.phone) {
      setEnquiryStatus({ loading: false, success: false, error: "Please provide your name, email, and contact number." });
      return;
    }

    setEnquiryStatus({ loading: true, success: false, error: null });
    try {
      await collegeService.submitEnquiry(enquiryForm);
      setEnquiryStatus({ loading: false, success: true, error: null });
      setEnquiryForm({
        fullName: "",
        email: "",
        phone: "",
        programInterested: "B.Tech Computer Science & Engineering",
        previousEducation: "",
        message: "",
      });
    } catch (err) {
      setEnquiryStatus({ loading: false, success: false, error: err.message || "Failed to submit enquiry." });
    }
  };

  const facilities = [
    {
      title: "Advanced AI & Cloud Computing Labs",
      description: "Equipped with high-performance GPU clusters, workstation pods, and Gigabit optical fiber backbone.",
      icon: Cpu,
      tag: "Technology",
    },
    {
      title: "Central Digital Library & Research Center",
      description: "Over 60,000 physical volumes, access to IEEE, ACM, Springer digital journals, and 24/7 quiet study pods.",
      icon: BookOpen,
      tag: "Academics",
    },
    {
      title: "Modern Robotics & IoT Fabrication Center",
      description: "Rapid prototyping 3D printers, laser cutters, embedded hardware testing jigs, and drone flight zone.",
      icon: Award,
      tag: "Innovation",
    },
    {
      title: "Olympic Standard Sports Arena",
      description: "Indoor multi-sport gymnasium, synthetic basketball courts, Olympic lap pool, and professional coaching.",
      icon: Sparkles,
      tag: "Athletics",
    },
  ];

  const facultyMembers = [
    {
      name: "Dr. Eleanor Vance",
      role: "Dean of Academic Affairs & Professor",
      dept: "Computer Science & Engineering",
      qual: "Ph.D. (MIT), Fellow of ACM",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Prof. Alan Turing",
      role: "Head of Department & Associate Professor",
      dept: "Computer Science & Engineering",
      qual: "Ph.D. (Cambridge), Algorithms & Graph Theory",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Dr. Katherine Johnson",
      role: "Head of Department & Professor",
      dept: "Electronics & Communication",
      qual: "Ph.D. (Caltech), VLSI & Telecommunications",
      img: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Prof. Arthur Pendelton",
      role: "Head of Department & Professor",
      dept: "Mechanical Engineering & Robotics",
      qual: "M.Tech, Ph.D. (Stanford), Thermal Fluid Mechanics",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Background Image with Navy Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.jpg"
            alt="Campus Architecture"
            className="w-full h-full object-cover object-center opacity-35 filter brightness-95 scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-blue-950/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.25),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Admissions Open for Academic Year {settings?.academicYear || "2026-2027"}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {settings?.collegeName || "Apex Institute of Science & Technology"}
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
                {settings?.tagLine || "Empowering Minds, Shaping Tomorrow"}. A premier center of higher learning, engineering excellence, and transformative multidisciplinary research.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#admissions-section"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                >
                  Apply for Admission
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all"
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  College Portal Sign In
                </Link>
              </div>

              {/* Verified Institutional Badges */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>State Tech University Affiliated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AICTE Approved Programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ISO 9001:2015 Certified Campus</span>
                </div>
              </div>
            </div>

            {/* Quick Portal Entry Cards */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl shadow-2xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Direct Role Entry Points
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Select your portal to log in or test live workflows:
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      switchDemoRole("admin");
                      navigate("/admin");
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="block font-bold">Admin Portal</span>
                        <span className="text-[10px] text-amber-400/80">Manage Students, Teachers & Settings</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole("teacher");
                      navigate("/teacher");
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="block font-bold">Teacher Portal</span>
                        <span className="text-[10px] text-emerald-400/80">Take Attendance, Notes & Grade</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole("student");
                      navigate("/student");
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold text-xs transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="block font-bold">Student Portal</span>
                        <span className="text-[10px] text-blue-400/80">View Notes, Timetable & Attendance</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* College Overview & Mission / Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Institutional Heritage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Legacy of Technical Innovation & Integrity
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Established in {settings?.establishedYear || "1998"}, {settings?.collegeName} stands at the intersection of rigorous scientific inquiry and transformative engineering practice. Our state-of-the-art campus brings together world-class faculty, driven scholars, and cutting-edge research laboratories.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="font-bold text-blue-900 text-sm mb-1">Our Mission</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To nurture technically adept, ethically sound, and entrepreneurial engineers capable of solving complex societal challenges.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Our Vision</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  To be universally recognized as a premier technical university fostering innovation, interdisciplinary research, and academic leadership.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-700">4</span>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Engineering Departments</p>
                <p className="text-[11px] text-slate-500">CSE, ECE, MECH & AI-DS</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-700">65+</span>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Doctoral Faculty</p>
                <p className="text-[11px] text-slate-500">Dedicated mentorship</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-700">30+</span>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Advanced Labs</p>
                <p className="text-[11px] text-slate-500">High performance computing</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-700">96%</span>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Career Placement</p>
                <p className="text-[11px] text-slate-500">Tier-1 technology firms</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Departments Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Programs & Curricula
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Academic Departments
            </h2>
          </div>
          <Link
            to="/departments"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            Explore all departments
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {dept.code}
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {dept.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>HOD: {dept.headOfDepartment.split(",")[0]}</span>
                <span className="font-semibold text-blue-600">{dept.totalCourses} Programs</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Published Notices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Latest College Announcements
                </h2>
                <p className="text-xs text-slate-400">
                  Official notices, examination schedules, and campus updates
                </p>
              </div>
            </div>

            <Link
              to="/notices"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              View Notice Board
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === "exam"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : ann.category === "holiday"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ann.publishDate}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm leading-snug">
                  {ann.title}
                </h4>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/50">
                  <span>Issued by: {ann.authorName}</span>
                  <span className="text-blue-400 font-semibold">Audience: {ann.audience}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Facilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            World-Class Infrastructure
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Campus Learning Facilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Designed to foster intellectual curiosity, practical experimentation, and physical well-being.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  {fac.tag}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1 mb-2">
                  {fac.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {fac.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Faculty Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Scholarly Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Meet Our Faculty Leaders
            </h2>
          </div>
          <Link
            to="/about"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            Academic leadership directory
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facultyMembers.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="h-48 overflow-hidden bg-slate-100">
                <img
                  src={fac.img}
                  alt={fac.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">{fac.name}</h4>
                <p className="text-xs font-semibold text-blue-700">{fac.role}</p>
                <p className="text-[11px] text-slate-500">{fac.dept}</p>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">{fac.qual}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admissions Enquiry Section */}
      <section id="admissions-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Join Our Next Cohort
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Admissions Enquiry & Program Advising
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect with our academic counselors to learn about curriculum structure, merit scholarship programs, lab facilities, and hostel accommodations.
              </p>

              <div className="space-y-4 pt-4 border-t border-blue-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <span>{settings?.address || "420 Knowledge Boulevard, Tech Park Campus"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </div>
                  <span>{settings?.phone || "+1 (555) 349-8800"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <span>{settings?.email || "admissions@apex-tech.edu"}</span>
                </div>
              </div>
            </div>

            {/* Interactive Form */}
            <div className="lg:col-span-7 bg-white text-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Candidate Information Form
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                All inquiries are stored persistently in the admissions management pipeline.
              </p>

              {enquiryStatus.success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-4 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Enquiry Registered Successfully!</span>
                    <p className="mt-0.5">
                      Our admissions office will contact you via email and phone shortly.
                    </p>
                  </div>
                </div>
              )}

              {enquiryStatus.error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
                  {enquiryStatus.error}
                </div>
              )}

              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={enquiryForm.fullName}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 555-0192"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Program of Interest *
                    </label>
                    <select
                      value={enquiryForm.programInterested}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, programInterested: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option>B.Tech Computer Science & Engineering</option>
                      <option>B.Tech Electronics & Communication</option>
                      <option>B.Tech Mechanical Engineering</option>
                      <option>B.Tech Artificial Intelligence & Data Science</option>
                      <option>M.Tech Software Engineering</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Previous Academic Qualification / Scores
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High School GPA 3.9 / 12th Standard 92%"
                    value={enquiryForm.previousEducation}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, previousEducation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Questions or Specific Areas of Interest
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ask about scholarships, hostel availability, curriculum details..."
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enquiryStatus.loading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {enquiryStatus.loading ? (
                    <span>Registering enquiry...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Admissions Enquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white pt-12 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-900 p-1.5 flex items-center justify-center">
                  <img src="/logo.svg" alt="College Emblem" className="w-full h-full object-contain" />
                </div>
                <span className="font-extrabold text-slate-900 text-base">CampusConnect</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {settings?.collegeName} academic management infrastructure, providing real-time workflows for administrators, faculty, and scholars.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/about" className="hover:text-blue-600">About College</Link></li>
                <li><Link to="/academics" className="hover:text-blue-600">Academic Regulations</Link></li>
                <li><Link to="/departments" className="hover:text-blue-600">Departments & Syllabi</Link></li>
                <li><Link to="/facilities" className="hover:text-blue-600">Campus Facilities</Link></li>
                <li><Link to="/notices" className="hover:text-blue-600">Notice Board</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">Portals</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-blue-600 font-semibold text-blue-700">Unified Portal Sign In</Link></li>
                <li><button onClick={() => { switchDemoRole("admin"); navigate("/admin"); }} className="hover:text-blue-600 text-left">Admin Console</button></li>
                <li><button onClick={() => { switchDemoRole("teacher"); navigate("/teacher"); }} className="hover:text-blue-600 text-left">Faculty Dashboard</button></li>
                <li><button onClick={() => { switchDemoRole("student"); navigate("/student"); }} className="hover:text-blue-600 text-left">Student Information System</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">Campus Contact</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                {settings?.address}
              </p>
              <p className="text-xs text-slate-700 font-medium">Email: {settings?.email}</p>
              <p className="text-xs text-slate-700 font-medium">Tel: {settings?.phone}</p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>© {new Date().getFullYear()} {settings?.collegeName}. All rights reserved.</span>
            <span>Security Architecture: Cloud Firestore Rules + Firebase Auth + Firebase Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
