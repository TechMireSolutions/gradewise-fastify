import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/features/auth/store.js";
import { Card, CardHeader, CardContent } from "../components/ui/Card.jsx";
import {
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaCheckCircle,
  FaTachometerAlt,
  FaKey,
  FaCrown,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaUserShield,
} from "react-icons/fa";

const ROLE_THEME = {
  super_admin: {
    gradient:     "from-violet-600 via-violet-600 to-indigo-700",
    darkGradient: "dark:from-violet-700 dark:via-violet-700 dark:to-indigo-800",
    badge:        "bg-violet-500/15 text-violet-400 border border-violet-500/20",
    label:        "Super Admin",
    Icon:         FaCrown,
  },
  admin: {
    gradient:     "from-rose-500 via-rose-500 to-violet-600",
    darkGradient: "dark:from-rose-600 dark:via-rose-700 dark:to-violet-800",
    badge:        "bg-red-500/15 text-red-400 border border-red-500/20",
    label:        "Admin",
    Icon:         FaUserShield,
  },
  instructor: {
    gradient:     "from-indigo-500 via-indigo-600 to-violet-600",
    darkGradient: "dark:from-indigo-600 dark:via-indigo-700 dark:to-violet-800",
    badge:        "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
    label:        "Instructor",
    Icon:         FaChalkboardTeacher,
  },
  student: {
    gradient:     "from-emerald-500 via-emerald-500 to-indigo-600",
    darkGradient: "dark:from-emerald-600 dark:via-emerald-700 dark:to-indigo-800",
    badge:        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    label:        "Student",
    Icon:         FaGraduationCap,
  },
};

const DEFAULT_THEME = {
  gradient:     "from-slate-500 to-slate-600",
  darkGradient: "dark:from-slate-600 dark:to-slate-700",
  badge:        "bg-slate-700/60 text-slate-400 border border-slate-600/40",
  label:        "User",
  Icon:         FaUser,
};

const DASHBOARD_MAP = {
  super_admin: "/super-admin/dashboard",
  admin:       "/admin/dashboard",
  instructor:  "/instructor/dashboard",
  student:     "/student/dashboard",
};

function Profile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const theme    = user ? (ROLE_THEME[user.role] ?? DEFAULT_THEME) : DEFAULT_THEME;
  const RoleIcon = theme.Icon;

  const getDashboardLink = () => (user ? (DASHBOARD_MAP[user.role] ?? "/") : "/");

  const handleChangePassword = () => {
    if (user) navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {user ? (
          <>
            {/* ── Hero ────────────────────────────────────────── */}
            <div className="mb-8 sm:mb-10">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex-shrink-0">
                    <RoleIcon className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      My Profile
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                      Manage your account information and settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

              {/* ── Profile card ─────────────────────────────── */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">

                  {/* Avatar area */}
                  <div className="px-6 py-8 text-center border-b border-slate-700/50 bg-slate-800/60">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <RoleIcon className="text-4xl text-indigo-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight">
                      {user.name}
                    </h2>
                    <p className="text-slate-400 text-sm break-all leading-relaxed">
                      {user.email}
                    </p>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col items-center gap-4">

                      {/* Role badge */}
                      <span className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full ${theme.badge}`}>
                        <RoleIcon className="text-xs" />
                        {theme.label}
                      </span>

                      {/* Verified indicator */}
                      <div className="w-full pt-4 border-t border-slate-700/50">
                        <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                          <FaCheckCircle className="text-emerald-400 text-base flex-shrink-0" />
                          <span className="text-sm font-semibold text-emerald-400">
                            Email Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Details card ─────────────────────────────── */}
              <div className="lg:col-span-2">
                <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200">

                  {/* Card header */}
                  <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FaUser className="text-indigo-400" />
                      Account Information
                    </h3>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="space-y-6">

                      {/* Info fields grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                        {/* Full Name */}
                        <div>
                          <label className="block text-slate-400 text-sm font-medium mb-1.5">
                            <span className="flex items-center gap-2">
                              <FaUser className="text-slate-500 text-xs" />
                              Full Name
                            </span>
                          </label>
                          <div className="bg-slate-800/60 border border-slate-700/60 px-4 py-3 rounded-xl">
                            <p className="text-slate-200 font-semibold text-sm">
                              {user.name}
                            </p>
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-slate-400 text-sm font-medium mb-1.5">
                            <span className="flex items-center gap-2">
                              <FaEnvelope className="text-slate-500 text-xs" />
                              Email Address
                            </span>
                          </label>
                          <div className="bg-slate-800/60 border border-slate-700/60 px-4 py-3 rounded-xl break-all">
                            <p className="text-slate-200 font-semibold text-sm">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Role */}
                        <div>
                          <label className="block text-slate-400 text-sm font-medium mb-1.5">
                            <span className="flex items-center gap-2">
                              <FaShieldAlt className="text-slate-500 text-xs" />
                              Role
                            </span>
                          </label>
                          <div className="bg-slate-800/60 border border-slate-700/60 px-4 py-3 rounded-xl">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${theme.badge}`}>
                              <RoleIcon className="text-xs" />
                              {theme.label}
                            </span>
                          </div>
                        </div>

                        {/* Account Status */}
                        <div>
                          <label className="block text-slate-400 text-sm font-medium mb-1.5">
                            <span className="flex items-center gap-2">
                              <FaCheckCircle className="text-slate-500 text-xs" />
                              Account Status
                            </span>
                          </label>
                          <div className="bg-slate-800/60 border border-slate-700/60 px-4 py-3 rounded-xl">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                              Active
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Quick Actions ─────────────────────── */}
                      <div className="pt-6 border-t border-slate-700/50">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <FaTachometerAlt className="text-indigo-400" />
                          Quick Actions
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <Link
                            to={getDashboardLink()}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 min-h-[44px]"
                          >
                            <FaTachometerAlt />
                            <span>Go to Dashboard</span>
                          </Link>
                          <button
                            onClick={handleChangePassword}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer min-h-[44px]"
                          >
                            <FaKey />
                            <span>Change Password</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        ) : (
          /* ── Access Denied ──────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-28 text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mb-6">
              <FaShieldAlt className="text-4xl text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h3>
            <p className="text-slate-400 max-w-sm mb-8 text-sm sm:text-base">
              Please log in to view your profile.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <FaUser />
              <span>Go to Login</span>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;
