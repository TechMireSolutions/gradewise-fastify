import { Link } from "react-router-dom"
import { FaHome, FaArrowLeft, FaQuestionCircle, FaBookOpen } from "react-icons/fa"

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 right-1/3 w-72 h-72 bg-emerald-600/6 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Centered Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative">
        <div className="max-w-lg w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 overflow-hidden">
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
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Page Not Found</h2>
              <div className="w-20 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 mx-auto rounded-full"></div>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-10">
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
                className="group flex items-center justify-center gap-3 w-full px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>Go Back</span>
              </button>
            </div>

            {/* Help Section */}
            <div className="mt-10 pt-6 border-t border-slate-700/50">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl">
                <FaQuestionCircle />
                <p className="text-sm font-semibold">
                  Need help? Contact your instructor or admin.
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6">
              <p className="text-xs text-slate-500">
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
