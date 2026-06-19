import LoadingSpinner from "./LoadingSpinner.jsx";
import AmbientBackground from "../layout/AmbientBackground.jsx";

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
      <AmbientBackground />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" type="spinner" color="blue" />
        {message && <p className="text-slate-400 text-sm">{message}</p>}
      </div>
    </div>
  );
}
