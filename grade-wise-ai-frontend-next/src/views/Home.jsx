import { Link } from "react-router-dom"
import useAuthStore from "@/features/auth/store.js"
import { Card, CardContent } from "../components/ui/Card.jsx"
import {
  FaRocket,
  FaChartLine,
  FaUsers,
  FaShieldAlt,
  FaArrowRight,
  FaStar,
  FaCheckCircle,
  FaBolt,
  FaTachometerAlt,
  FaUserCircle,
  FaCrown,
  FaUserShield,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaBook,
} from "react-icons/fa"

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin:       "Admin",
  instructor:  "Instructor",
  student:     "Student",
}

const ROLE_ICON_MAP = {
  super_admin: FaCrown,
  admin:       FaUserShield,
  instructor:  FaChalkboardTeacher,
  student:     FaGraduationCap,
}

const DASHBOARD_MAP = {
  super_admin: "/super-admin/dashboard",
  admin:       "/admin/dashboard",
  instructor:  "/instructor/dashboard",
  student:     "/student/dashboard",
}

const FEATURES = [
  {
    Icon:        FaBolt,
    title:       "AI-Powered Grading",
    description: "Intelligent automated grading system that understands context and provides detailed feedback.",
    iconBg:      "from-violet-500 to-indigo-500",
    shadowColor: "shadow-violet-500/25",
  },
  {
    Icon:        FaChartLine,
    title:       "Analytics Dashboard",
    description: "Comprehensive insights into student performance and learning patterns.",
    iconBg:      "from-indigo-500 to-violet-600",
    shadowColor: "shadow-indigo-500/25",
  },
  {
    Icon:        FaUsers,
    title:       "Multi-Role Support",
    description: "Seamless experience for administrators, instructors, and students.",
    iconBg:      "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/25",
  },
  {
    Icon:        FaShieldAlt,
    title:       "Secure & Reliable",
    description: "Enterprise-grade security with role-based access control.",
    iconBg:      "from-rose-500 to-violet-600",
    shadowColor: "shadow-rose-500/25",
  },
]

const BENEFITS = [
  "Save 10+ hours per week on grading",
  "Instant feedback for students",
  "Detailed analytics and insights",
  "Easy to use interface",
]

function Home() {
  const { user } = useAuthStore()

  const UserIcon    = user ? (ROLE_ICON_MAP[user.role] ?? FaUserCircle) : FaUserCircle
  const dashboardLink = user ? (DASHBOARD_MAP[user.role] ?? "/") : "/login"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">

      {/* ── Ambient blobs ─────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">

        {/* Floating decorative icons */}
        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 opacity-5 animate-float pointer-events-none">
          <FaGraduationCap className="text-6xl sm:text-8xl lg:text-9xl text-violet-400" />
        </div>
        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 opacity-5 animate-float animation-delay-2000 pointer-events-none">
          <FaBook className="text-6xl sm:text-8xl lg:text-9xl text-indigo-400" />
        </div>

        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="text-center">

            {/* Eyebrow label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 mb-6">
              <FaStar className="text-amber-400 text-xs" />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Intelligent Assessment Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight px-2">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
                Gradewise AI
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Your intelligent grading assistant that revolutionizes the way educators assess and provide feedback to
              students with{" "}
              <span className="font-bold text-violet-400">AI-powered precision</span>.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto mb-10 sm:mb-12 px-4">
              {BENEFITS.map((text, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-slate-800/40 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-200"
                >
                  <FaCheckCircle className="text-emerald-400 text-lg flex-shrink-0" />
                  <span className="text-sm text-slate-300 font-medium text-left">{text}</span>
                </div>
              ))}
            </div>

            {user ? (
              /* ── Logged-in card ── */
              <div className="animate-fade-in">
                <div className="max-w-md mx-auto bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 p-8 sm:p-10">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 w-fit mx-auto mb-6">
                    <UserIcon className="text-3xl sm:text-4xl text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Hello, {user.name}!
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400 mb-8">
                    You are logged in as{" "}
                    <span className="font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </p>
                  <div className="space-y-3">
                    <Link
                      to={dashboardLink}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 min-h-[44px]"
                    >
                      <FaTachometerAlt />
                      Go to Dashboard
                      <FaArrowRight />
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 min-h-[44px]"
                    >
                      <FaUserCircle />
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Guest CTAs ── */
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 animate-fade-in">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 w-full sm:w-auto min-h-[44px]"
                >
                  <FaRocket />
                  Get Started
                  <FaArrowRight />
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-semibold text-base transition-all duration-200 active:scale-95 w-full sm:w-auto min-h-[44px]"
                >
                  <FaUsers />
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Features Section ──────────────────────────────────────── */}
      <div className="relative py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 mb-6">
              <FaStar className="text-amber-400 text-xs" />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Features That Matter</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight px-4">
              Why Choose Gradewise AI?
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4 leading-relaxed">
              Discover the features that make Gradewise AI the perfect solution for modern education.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((feature, index) => {
              const Icon = feature.Icon
              return (
                <div
                  key={index}
                  className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 p-6 sm:p-8 text-center hover:-translate-y-1"
                >
                  <div className={`bg-gradient-to-br ${feature.iconBg} w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CTA Section ───────────────────────────────────────────── */}
      <div className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Subtle inner glow for CTA section */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 mb-6 sm:mb-8">
            <FaBolt className="text-amber-400 text-xs" />
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Start Your Journey Today</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight px-4">
            Ready to Transform Your Grading Experience?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Join thousands of educators who are already using Gradewise AI to enhance their teaching and save valuable time.
          </p>
          {!user && (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <FaRocket />
              Start Your Free Trial
              <FaArrowRight />
            </Link>
          )}
        </div>
      </div>

    </div>
  )
}

export default Home
