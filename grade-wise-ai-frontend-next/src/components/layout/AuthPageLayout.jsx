import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import AmbientBackground from "./AmbientBackground.jsx";

export default function AuthPageLayout({
  children,
  backTo = "/",
  backLabel = "Back to Home Page",
  maxWidth = "max-w-md",
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-12">
      <AmbientBackground />
      <div className={`relative w-full ${maxWidth}`}>
        <div className="mb-6">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-150 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-150" />
            <span className="text-sm font-medium">{backLabel}</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
