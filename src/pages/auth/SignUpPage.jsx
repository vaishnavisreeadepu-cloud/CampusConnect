import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { INITIAL_DEPARTMENTS, INITIAL_CLASSES } from "../../services/seedData";
import {
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  BookOpen,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

export const SignUpPage = () => {
  const { register, loginWithGoogle, user } = useAuth();
  const { settings, departments: ctxDepts, classes: ctxClasses } = useCollege();
  const navigate = useNavigate();

  // Always use seed data as fallback so dropdowns work even before Firestore loads
  const departments = useMemo(
    () => (ctxDepts && ctxDepts.length > 0 ? ctxDepts : INITIAL_DEPARTMENTS),
    [ctxDepts]
  );
  const allClasses = useMemo(
    () => (ctxClasses && ctxClasses.length > 0 ? ctxClasses : INITIAL_CLASSES),
    [ctxClasses]
  );

  // Selected role: 'student' | 'teacher'
  const [selectedRole, setSelectedRole] = useState("student");

  // Common fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState(() => INITIAL_DEPARTMENTS[0]?.id || "");

  // Student specific fields
  const [classId, setClassId] = useState(() => INITIAL_CLASSES[0]?.id || "");
  const [rollNumber, setRollNumber] = useState("");
  const [studentId, setStudentId] = useState("");

  // Teacher specific fields
  const [designation, setDesignation] = useState("Assistant Professor");
  const [employeeId, setEmployeeId] = useState("");
  const [qualification, setQualification] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // When context departments finally load, sync selection if still on default
  useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      const firstDept = departments[0].id;
      setDepartmentId(firstDept);
      const firstClass = allClasses.find((c) => c.departmentId === firstDept);
      setClassId(firstClass ? firstClass.id : (allClasses[0]?.id || ""));
    }
  }, [departments, allClasses]); // eslint-disable-line

  // When department changes → reset classId to first class in that department
  const handleDepartmentChange = (newDeptId) => {
    setDepartmentId(newDeptId);
    const firstClass = allClasses.find((c) => c.departmentId === newDeptId);
    setClassId(firstClass ? firstClass.id : (allClasses[0]?.id || ""));
  };

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (user && !success) {
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "teacher") navigate("/teacher", { replace: true });
      else if (user.role === "student") navigate("/student", { replace: true });
    }
  }, [user, success, navigate]);

  // Filter classes by selected department; always show at least all classes
  const filteredClasses = useMemo(() => {
    const filtered = allClasses.filter((c) => c.departmentId === departmentId);
    return filtered.length > 0 ? filtered : allClasses;
  }, [allClasses, departmentId]);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Too weak", color: "bg-slate-700" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  // Handle Google 1-Click Sign-Up
  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const selectedDept = departments.find((d) => d.id === departmentId);
      const selectedClassObj = allClasses.find((c) => c.id === classId);

      const extraMetadata = {
        phone,
        departmentId: departmentId || (departments[0]?.id || "dept-cse"),
        ...(selectedRole === "student"
          ? {
              classId: classId || (classes[0]?.id || "cse-y2-a"),
              className: selectedClassObj?.name || "B.Tech CSE - 2nd Year (Section A)",
              rollNumber: rollNumber || `${Math.floor(100 + Math.random() * 900)}`,
              studentId: studentId || `STU-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
            }
          : {
              designation,
              employeeId: employeeId || `FAC-${Date.now().toString().slice(-3)}`,
              qualification: qualification || "M.Tech / Ph.D.",
            }),
      };

      const newUser = await loginWithGoogle(selectedRole, extraMetadata);
      setSuccess(true);
      setTimeout(() => {
        const dest = newUser.role === "teacher" ? "/teacher" : "/student";
        navigate(dest, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || "Google sign-up failed. Please verify popup permissions.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Email & Password Form Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError("Please provide your full legal name.");
      return;
    }
    if (!email.trim()) {
      setError("Please provide a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter identical passwords.");
      return;
    }

    setLoading(true);
    try {
      const selectedDept = departments.find((d) => d.id === departmentId);
      const selectedClassObj = allClasses.find((c) => c.id === classId);

      const registrationPayload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole,
        phone: phone.trim(),
        departmentId: departmentId || (departments[0]?.id || "dept-cse"),
        departmentName: selectedDept?.name || "Computer Science & Engineering",
      };

      if (selectedRole === "student") {
        registrationPayload.classId = classId || (classes[0]?.id || "cse-y2-a");
        registrationPayload.className =
          selectedClassObj?.name || "B.Tech CSE - 2nd Year (Section A)";
        registrationPayload.year = selectedClassObj?.year || "2nd Year";
        registrationPayload.semester = selectedClassObj?.semester || "4th Semester";
        registrationPayload.section = selectedClassObj?.section || "A";
        registrationPayload.rollNumber =
          rollNumber.trim() || `${Math.floor(100 + Math.random() * 900)}`;
        registrationPayload.studentId =
          studentId.trim() || `STU-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      } else if (selectedRole === "teacher") {
        registrationPayload.designation = designation;
        registrationPayload.employeeId =
          employeeId.trim() || `FAC-${Date.now().toString().slice(-3)}`;
        registrationPayload.qualification = qualification.trim() || "M.Tech / Ph.D.";
        registrationPayload.assignedClasses = classId ? [classId] : ["cse-y2-a"];
        registrationPayload.assignedSubjects = ["sub-dsa"];
      }

      const registeredUser = await register(registrationPayload);
      setSuccess(true);

      setTimeout(() => {
        const dest = registeredUser.role === "teacher" ? "/teacher" : "/student";
        navigate(dest, { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Registration failed. Please check the provided information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-blue-600 p-2.5 shadow-lg shadow-blue-900/40">
            <img src="/logo.svg" alt="College Emblem" className="w-full h-full object-contain" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Your CampusConnect Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          {settings?.collegeName || "Integrated College Management System"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Role Selection Tabs */}
          <div className="flex p-1 bg-slate-950/70 rounded-2xl border border-slate-800/80 mb-6">
            <button
              type="button"
              id="signup-role-student"
              onClick={() => {
                setSelectedRole("student");
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === "student"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Registration
            </button>

            <button
              type="button"
              id="signup-role-teacher"
              onClick={() => {
                setSelectedRole("teacher");
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === "teacher"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Teacher / Faculty
            </button>
          </div>

          {/* Role Description Banner */}
          <div className="mb-6 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${selectedRole === "student" ? "bg-blue-400" : "bg-emerald-400"}`} />
              <span>Enrolling as: <strong className="text-white capitalize">{selectedRole}</strong></span>
            </span>
            <span className="text-[10px] text-slate-400">
              Admin access is assigned by Dean Office
            </span>
          </div>

          {/* Google 1-Click Sign-Up */}
          <div className="mb-6 space-y-4">
            <button
              type="button"
              id="google-signup-btn"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign up with Google as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider relative z-10">
                Or Complete Registration Form
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Account created successfully!</p>
                <p className="text-xs text-emerald-300/80">
                  Profile registered in Firebase. Entering your {selectedRole} portal...
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === "student" ? "Alex Rivera" : "Dr. Alan Turing"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                College or Personal Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder={
                    selectedRole === "student"
                      ? "student@campusconnect.edu"
                      : "professor@campusconnect.edu"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Department & Academic Cohort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Department / Branch <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <select
                    value={departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRole === "student" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Enrolled Class & Section <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {filteredClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Academic Designation <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor & HOD">Professor & HOD</option>
                      <option value="Senior Lecturer">Senior Lecturer</option>
                      <option value="Adjunct Faculty">Adjunct Faculty</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Role Specific Identifier (Roll No / Employee ID) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedRole === "student" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Roll Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 101 or leave blank"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Student ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Employee ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FAC-102 or leave blank"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Highest Degree / Qualification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ph.D. in Computer Science"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Create Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border text-white text-xs placeholder:text-slate-600 focus:outline-none ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-500 focus:ring-2 focus:ring-red-500"
                        : confirmPassword && password === confirmPassword
                        ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                        : "border-slate-800 focus:ring-2 focus:ring-blue-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>
            </div>

            {/* Terms & Agreement Note */}
            <div className="pt-2 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                By registering, your account will be authenticated via Firebase Auth and stored securely in Cloud Firestore subject to academic conduct policies.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="signup-submit-btn"
              disabled={loading || success}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                selectedRole === "teacher"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
              }`}
            >
              {loading ? (
                <span>Registering account in Firebase...</span>
              ) : success ? (
                <span>Registration Complete! Redirecting...</span>
              ) : (
                <>
                  <span>Create {selectedRole === "teacher" ? "Teacher" : "Student"} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have a CampusConnect account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
              >
                Sign In to Portal &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-4 text-center text-[11px] text-slate-500">
          CampusConnect accounts are secured via Firebase Authentication and verified Firestore collections.
        </p>
      </div>
    </div>
  );
};
