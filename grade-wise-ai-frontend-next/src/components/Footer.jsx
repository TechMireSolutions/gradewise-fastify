import { cn } from "@/lib/cn.js";
import { card, cardInteractive, headingGradient, nav } from "@/lib/ui.js";
import useAuthStore from "@/features/auth/store.js";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaEnvelope,
  FaHeart,
  FaCheckCircle,
  FaCrown,
  FaUserShield,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaUser,
} from "react-icons/fa";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  instructor: "Instructor",
  student: "Student",
};

const ROLE_ICON_MAP = {
  super_admin: FaCrown,
  admin: FaUserShield,
  instructor: FaChalkboardTeacher,
  student: FaGraduationCap,
};

function Footer() {
  const { user } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const UserRoleIcon = user ? (ROLE_ICON_MAP[user.role] ?? FaUser) : FaUser;

  return (
    <footer className={cn(nav, "border-t", "border-border", "text-foreground", "relative", "overflow-hidden", "mt-auto")}>
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-violet-600/5 to-indigo-600/5 pointer-events-none" />

      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mx-auto">

          {/* Brand + Social */}
          <div className="text-center md:text-left mb-8 lg:mb-10">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 shadow-lg shadow-teal-500/25 flex items-center justify-center flex-shrink-0">
                <FaGraduationCap className="text-white text-base" />
              </div>
              <span className={cn("text-2xl", "sm:text-3xl", "font-bold", headingGradient, "tracking-tight")}>
                Gradewise AI
              </span>
            </div>

            <p className={cn("text-muted-foreground", "text-sm", "leading-relaxed", "max-w-2xl", "mx-auto", "md:mx-0", "mb-5")}>
              Empowering educators with intelligent grading solutions. Transform your teaching experience with
              AI-powered assessment tools that save time and enhance learning outcomes.
            </p>

            {/* Social icons */}
            <div className="flex justify-center md:justify-start space-x-3">
              <a
                href="#"
                className={cn("w-11", "h-11", "bg-input", "border", "border-border", "rounded-xl", "flex", "items-center", "justify-center", "text-muted-foreground", "hover:text-foreground", "hover:bg-indigo-500/20", "hover:border-indigo-500/30", "transition-all", "duration-200", "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-indigo-500/50")}
                aria-label="Facebook"
              >
                <FaFacebookF className="text-sm" />
              </a>
              <a
                href="#"
                className={cn("w-11", "h-11", "bg-input", "border", "border-border", "rounded-xl", "flex", "items-center", "justify-center", "text-muted-foreground", "hover:text-foreground", "hover:bg-violet-500/20", "hover:border-violet-500/30", "transition-all", "duration-200", "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-violet-500/50")}
                aria-label="Twitter"
              >
                <FaTwitter className="text-sm" />
              </a>
              <a
                href="#"
                className={cn("w-11", "h-11", "bg-input", "border", "border-border", "rounded-xl", "flex", "items-center", "justify-center", "text-muted-foreground", "hover:text-foreground", "hover:bg-indigo-500/20", "hover:border-indigo-500/30", "transition-all", "duration-200", "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-indigo-500/50")}
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="text-sm" />
              </a>
              <a
                href="mailto:support@gradewiseai.com"
                className={cn("w-11", "h-11", "bg-input", "border", "border-border", "rounded-xl", "flex", "items-center", "justify-center", "text-muted-foreground", "hover:text-foreground", "hover:bg-rose-500/20", "hover:border-rose-500/30", "transition-all", "duration-200", "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-rose-500/50")}
                aria-label="Email"
              >
                <FaEnvelope className="text-sm" />
              </a>
            </div>
          </div>

          {/* Logged-in user card */}
          {user && (
            <div className="border-t border-border mt-7 pt-6">
              <div className={cn(card, cardInteractive, "shadow-2xl", "p-5", "sm:p-6", "max-w-4xl", "mx-auto")}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-400 text-xl flex-shrink-0">
                      <UserRoleIcon />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-base sm:text-lg">
                        {user.name}
                      </div>
                      <div className={cn("text-xs", "text-muted-foreground", "mt-0.5")}>
                        Logged in as{" "}
                        <span className="text-indigo-400 font-semibold">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    <div className="size-2 animate-pulse rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 motion-reduce:animate-none" aria-hidden="true" />
                    Online · Active Now
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="border-t border-border mt-8 sm:mt-10 pt-7 sm:pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left gap-3 mb-5">
              <div className={cn("text-sm", "text-muted-foreground", "font-medium")}>
                © {currentYear} Gradewise AI. All rights reserved.
              </div>
              <div className={cn("flex", "flex-col", "sm:flex-row", "items-center", "gap-3", "sm:gap-4", "text-xs", "text-muted-foreground", "justify-center")}>
                <span className="flex items-center gap-2 font-medium">
                  Made with <FaHeart className="animate-pulse text-rose-500 motion-reduce:animate-none" aria-hidden="true" /> for educators
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  <FaCheckCircle className="text-emerald-500" />
                  All systems operational
                </div>
              </div>
            </div>

            {/* reCAPTCHA notice */}
            <div className="bg-input rounded-xl border border-border p-4 sm:p-5 max-w-4xl mx-auto">
              <p className={cn("text-xs", "text-muted-foreground", "text-center", "leading-relaxed")}>
                This site is protected by reCAPTCHA and the Google{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline hover:text-indigo-300 transition-colors duration-150 font-medium"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline hover:text-indigo-300 transition-colors duration-150 font-medium"
                >
                  Terms of Service
                </a>{" "}
                apply.
              </p>
            </div>

            <div className="text-center mt-4">
              <p className={cn("text-xs", "text-muted-foreground", "italic")}>
                Revolutionizing education, one assessment at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
    </footer>
  );
}

export default Footer;
