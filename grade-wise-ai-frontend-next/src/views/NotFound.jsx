import { cn } from "@/lib/cn.js";
import { card, cardInteractive, page } from "@/lib/ui.js";
import { Link } from "react-router-dom"
import { FaHome, FaArrowLeft, FaQuestionCircle, FaBookOpen } from "react-icons/fa"
import AmbientBackground from "../components/layout/AmbientBackground.jsx";

function NotFound() {
  return (
    <div className={cn(page, "flex", "flex-col")}>

      {/* Ambient blobs */}
      <AmbientBackground />

      {/* Centered Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative">
        <div className={cn("max-w-lg", "w-full", card, cardInteractive, "shadow-2xl", "overflow-hidden")}>
          <div className="pt-10 sm:pt-12 pb-12 sm:pb-16 px-6 sm:px-8 text-center">

            {/* Icon with gradient background */}
            <div className="relative mb-8">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaBookOpen className="text-white text-4xl sm:text-5xl" />
                </div>
              </div>
            </div>

            {/* 404 + Title */}
            <div className="mb-8">
              <h1 className="text-7xl sm:text-8xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-4">
                404
              </h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Page Not Found</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 mx-auto rounded-full"></div>
            </div>

            {/* Description */}
            <p className={cn("text-secondary-foreground", "text-base", "sm:text-lg", "leading-relaxed", "max-w-md", "mx-auto", "mb-10")}>
              Oops! The page you're looking for doesn't exist or has been moved to a different location.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4 max-w-xs mx-auto">
              <Link
                to="/"
                className="group flex items-center justify-center gap-3 w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <FaHome className="group-hover:scale-110 transition-transform" />
                <span>Return to Dashboard</span>
              </Link>

              <button
                onClick={() => window.history.back()}
                className={cn("group", "flex", "items-center", "justify-center", "gap-3", "w-full", "px-4", "py-2.5", "bg-btn-secondary", "hover:bg-surface-elevated", "border", "border-border", "text-secondary-foreground", "hover:text-foreground", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer")}
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>Go Back</span>
              </button>
            </div>

            {/* Help Section */}
            <div className="mt-10 pt-6 border-t border-border">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl">
                <FaQuestionCircle />
                <p className="text-sm font-semibold">
                  Need help? Contact your instructor or admin.
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6">
              <p className={cn("text-xs", "text-muted-foreground")}>
                Error Code: 404 | Page Not Found
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}

export default NotFound
