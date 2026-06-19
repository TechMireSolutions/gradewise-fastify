import { cn } from "@/lib/cn.js";
import { btn, card, cardInteractive, eyebrowPill, headingGradient, heroTitle, iconBadgeTeal, page } from "@/lib/ui.js";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import { Link } from "react-router-dom"
import useAuthStore from "@/features/auth/store.js"
import AmbientBackground from "../components/layout/AmbientBackground.jsx";
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
    description: "Intelligent automated grading that understands context and delivers explainable feedback.",
    iconBg:      "from-teal-500 to-cyan-500",
    shadowColor: "shadow-teal-500/25",
  },
  {
    Icon:        FaChartLine,
    title:       "Learning Analytics",
    description: "Track student progress, spot knowledge gaps, and guide instruction with data-driven insights.",
    iconBg:      "from-indigo-500 to-violet-600",
    shadowColor: "shadow-indigo-500/25",
  },
  {
    Icon:        FaUsers,
    title:       "Built for Every Role",
    description: "Purpose-built portals for administrators, instructors, and students in one platform.",
    iconBg:      "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/25",
  },
  {
    Icon:        FaShieldAlt,
    title:       "Secure by Design",
    description: "Enterprise-grade security with role-based access and privacy-first assessment workflows.",
    iconBg:      "from-sky-500 to-indigo-600",
    shadowColor: "shadow-sky-500/25",
  },
]

const BENEFITS = [
  "Save 10+ hours per week on grading",
  "Instant, explainable feedback for learners",
  "Actionable analytics for every classroom",
  "Designed for modern education teams",
]

function Home() {
  const { user } = useAuthStore()

  const UserIcon = user ? (ROLE_ICON_MAP[user.role] ?? FaUserCircle) : FaUserCircle
  const dashboardLink = user ? (DASHBOARD_MAP[user.role] ?? "/") : "/login"

  return (
    <div className={cn(page, "overflow-x-hidden")}>

      <AmbientBackground />

      <MainLandmark className="relative z-10">
      {/* Hero */}
      <section className="relative" aria-labelledby="home-hero-heading">
        <div className="absolute top-10 sm:top-20 right-4 sm:right-10 opacity-[0.07] dark:opacity-[0.05] animate-float pointer-events-none" aria-hidden="true">
          <FaGraduationCap className="text-6xl sm:text-8xl lg:text-9xl text-violet-500" />
        </div>
        <div className="absolute bottom-10 sm:bottom-20 left-4 sm:left-10 opacity-[0.07] dark:opacity-[0.05] animate-float animation-delay-2000 pointer-events-none" aria-hidden="true">
          <FaBook className="text-6xl sm:text-8xl lg:text-9xl text-indigo-500" />
        </div>

        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="text-center max-w-5xl mx-auto">
            <div className={cn(eyebrowPill, "mb-6")}>
              <FaGraduationCap className="text-teal-500 dark:text-teal-400 text-xs" />
              <span>Modern Learning Platform</span>
            </div>

            <h1 id="home-hero-heading" className={cn(heroTitle, "mb-4", "sm:mb-6", "px-2")}>
              Teach smarter.{" "}
              <span className={cn(headingGradient, "animate-gradient")}>
                Assess better.
              </span>
            </h1>

            <p className={cn("text-base", "sm:text-lg", "md:text-xl", "text-secondary-foreground", "mb-8", "sm:mb-10", "max-w-3xl", "mx-auto", "leading-relaxed", "px-4")}>
              Gradewise AI helps educators create assessments, grade with confidence, and give students{" "}
              <span className="font-semibold text-teal-600 dark:text-teal-300">clear, explainable feedback</span>
              {" "}in one place.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto mb-10 sm:mb-12 px-4">
              {BENEFITS.map((text) => (
                <div
                  key={text}
                  className={cn("flex", "items-center", "gap-3", card, "px-4", "py-3", cardInteractive, "text-left")}
                >
                  <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-lg shrink-0" />
                  <span className={cn("text-sm", "text-secondary-foreground", "font-medium")}>{text}</span>
                </div>
              ))}
            </div>

            {user ? (
              <div className="animate-fade-in max-w-md mx-auto">
                <div className={cn(card, cardInteractive, "shadow-2xl", "p-8", "sm:p-10")}>
                  <div className={cn(iconBadgeTeal, "w-fit", "mx-auto", "mb-6", "p-4")}>
                    <UserIcon className="text-3xl sm:text-4xl" />
                  </div>
                  <h2 className={cn("text-xl", "sm:text-2xl", "font-bold", "text-foreground", "mb-2")}>
                    Hello, {user.name}!
                  </h2>
                  <p className={cn("text-sm", "sm:text-base", "text-muted-foreground", "mb-8")}>
                    You are logged in as{" "}
                    <span className={cn("font-bold", headingGradient)}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </p>
                  <div className="space-y-3">
                    <Link to={dashboardLink} className={cn(btn.primary, "w-full")}>
                      <FaTachometerAlt />
                      Go to Dashboard
                      <FaArrowRight />
                    </Link>
                    <Link to="/profile" className={cn(btn.secondary, "w-full")}>
                      <FaUserCircle />
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center px-4 animate-fade-in max-w-lg mx-auto sm:max-w-none">
                <Link to="/login" className={cn(btn.primary, "px-8", "py-4", "text-base", "w-full", "sm:w-auto")}>
                  <FaRocket />
                  Get Started
                  <FaArrowRight />
                </Link>
                <Link to="/signup" className={cn(btn.secondary, "px-8", "py-4", "text-base", "w-full", "sm:w-auto")}>
                  <FaUsers />
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className={cn(eyebrowPill, "mb-6")}>
              <FaStar className="text-amber-500 dark:text-amber-400 text-xs" />
              <span>Built for educators</span>
            </div>
            <h2 className={cn("text-2xl", "sm:text-3xl", "md:text-4xl", "font-bold", "text-foreground", "mb-4", "tracking-tight", "px-4")}>
              Everything you need to{" "}
              <span className={headingGradient}>run smarter assessments</span>
            </h2>
            <p className={cn("text-base", "sm:text-lg", "text-muted-foreground", "max-w-2xl", "mx-auto", "px-4", "leading-relaxed")}>
              Discover the features that make Gradewise AI the perfect solution for modern education.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((feature) => {
              const Icon = feature.Icon
              return (
                <article
                  key={feature.title}
                  className={cn("group", card, cardInteractive, "shadow-xl", "p-6", "sm:p-8", "text-center", "hover:-translate-y-1")}
                >
                  <div className={`bg-gradient-to-br ${feature.iconBg} w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <h3 className={cn("text-lg", "font-semibold", "text-foreground", "mb-3")}>
                    {feature.title}
                  </h3>
                  <p className={cn("text-sm", "text-muted-foreground", "leading-relaxed")}>
                    {feature.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent dark:via-indigo-500/30" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent dark:via-violet-500/30" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className={cn(eyebrowPill, "mb-6", "sm:mb-8")}>
            <FaBolt className="text-amber-500 dark:text-amber-400 text-xs" />
            <span>Start teaching smarter today</span>
          </div>
          <h2 className={cn("text-2xl", "sm:text-3xl", "md:text-4xl", "font-bold", "text-foreground", "mb-4", "sm:mb-6", "leading-tight", "tracking-tight", "px-4")}>
            Ready to transform your classroom assessments?
          </h2>
          <p className={cn("text-base", "sm:text-lg", "text-muted-foreground", "mb-8", "sm:mb-10", "max-w-2xl", "mx-auto", "leading-relaxed", "px-4")}>
            Join educators using Gradewise AI to enhance teaching and save valuable time.
          </p>
          {!user && (
            <Link to="/signup" className={cn(btn.primary, "px-8", "sm:px-12", "py-4", "text-base")}>
              <FaRocket />
              Start Your Free Trial
              <FaArrowRight />
            </Link>
          )}
        </div>
      </section>
      </MainLandmark>
    </div>
  )
}

export default Home
