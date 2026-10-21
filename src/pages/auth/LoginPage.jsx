import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCollege } from "../../contexts/CollegeContext";
import { authService } from "../../services/authService";
import {
  Shield,
  Users,
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  Sparkles,
} from "lucide-react";

export const LoginPage = () => {
  const { login, loginWithGoogle, user } = useAuth();
  const { settings } = useCollege();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected role tab ('admin' | 'teacher' | 'student')
  const [activeRole, setActiveRole] = useState("student");
  const [email, setEmail] = useState("student@campusconnect.edu");
  const [password, setPassword] = useState("Student@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle(activeRole);
      const destination =
        loggedUser.role === "admin"
          ? "/admin"
          : loggedUser.role === "teacher"
          ? "/teacher"
          : "/student";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please verify popup permissions.");
    } finally {
      setLoading(false);
    }
  };


  // Forgot Password Modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ loading: false, message: null, error: null });

  // If already logged in, redirect to respective dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "teacher") navigate("/teacher", { replace: true });
      else if (user.role === "student") navigate("/student", { replace: true });
    }
  }, [user, navigate]);

  const handleRoleTabChange = (role) => {
    setActiveRole(role);
    setError(null);
    if (role === "admin") {
      setEmail("admin@campusconnect.edu");
      setPassword("Admin@123");
    } else if (role === "teacher") {
      setEmail("teacher@campusconnect.edu");
      setPassword("Teacher@123");
    } else if (role === "student") {
      setEmail("student@campusconnect.edu");
      setPassword("Student@123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please provide both email address and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      // Validate role match
      if (loggedUser.role !== activeRole) {
        console.warn(`User is registered as ${loggedUser.role}, redirecting accordingly.`);
      }
      
      const destination =
        loggedUser.role === "admin"
          ? "/admin"
          : loggedUser.role === "teacher"
          ? "/teacher"
          : "/student";
      
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotStatus({ loading: false, message: null, error: "Please enter your registered college email." });
      return;
    }

    setForgotStatus({ loading: true, message: null, error: null });
    try {
      await authService.resetPassword(forgotEmail);
      setForgotStatus({
        loading: false,
        message: `Password reset instructions dispatched to ${forgotEmail}. Please check your inbox.`,
        error: null,
      });
    } catch (err) {
      setForgotStatus({
        loading: false,
        message: null,
        error: err.message || "Failed to initiate password reset.",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-blue-600 p-2.5 shadow-lg shadow-blue-900/40">
            <img src="/logo.svg" alt="College Emblem" className="w-full h-full object-contain" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          CampusConnect Portal Access
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          {settings?.collegeName || "Integrated College Management System"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Role Selection Tabs */}
          <div className="flex p-1 bg-slate-950/70 rounded-2xl border border-slate-800/80 mb-6">
            <button
              type="button"
              id="role-tab-student"
              onClick={() => handleRoleTabChange("student")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "student"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>

            <button
              type="button"
              id="role-tab-teacher"
              onClick={() => handleRoleTabChange("teacher")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "teacher"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Teacher
            </button>

            <button
              type="button"
              id="role-tab-admin"
              onClick={() => handleRoleTabChange("admin")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "admin"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Role Description Banner */}
          <div className="mb-6 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span>
              Signing in as:{" "}
              <strong className="text-white capitalize font-semibold">{activeRole}</strong>
            </span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              {activeRole === "admin"
                ? "Full Governance"
                : activeRole === "teacher"
                ? "Instructional"
                : "Scholastic"}
            </span>
          </div>

          {/* Google 1-Click Sign-In */}
          <div className="mb-6 space-y-4">
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 active:scale-[0.99]"
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
              <span>Continue with Google as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider relative z-10">
                Or with Email & Password
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@campusconnect.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotModalOpen(true);
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                activeRole === "admin"
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                  : activeRole === "teacher"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
              }`}
            >
              {loading ? (
                <span>Authenticating credentials...</span>
              ) : (
                <>
                  <span>Sign In as {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-400">
              New to CampusConnect?{" "}
              <Link
                to="/signup"
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
              >
                Create an Account / Sign Up &rarr;
              </Link>
            </p>
          </div>

          {/* Quick Demo Pre-fill Pill Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Evaluation Credentials Ready
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleTabChange("admin")}
                className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-400 font-semibold truncate border border-slate-700"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange("teacher")}
                className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-400 font-semibold truncate border border-slate-700"
              >
                Teacher Demo
              </button>
              <button
                type="button"
                onClick={() => handleRoleTabChange("student")}
                className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-blue-400 font-semibold truncate border border-slate-700"
              >
                Student Demo
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Role changes and administrative credentials are secured via Firebase Security Rules and trusted functions.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-white space-y-4">
            <button
              onClick={() => {
                setForgotModalOpen(false);
                setForgotStatus({ loading: false, message: null, error: null });
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold">Reset College Password</h3>
              <p className="text-xs text-slate-400">
                Enter your registered college email to receive password reset instructions.
              </p>
            </div>

            {forgotStatus.message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{forgotStatus.message}</span>
              </div>
            )}

            {forgotStatus.error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {forgotStatus.error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@campusconnect.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotStatus.loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  {forgotStatus.loading ? "Sending link..." : "Send Reset Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
