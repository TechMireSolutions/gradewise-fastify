import AmbientBackground from "./AmbientBackground.jsx";
import { cn } from "@/lib/cn.js";
import { page } from "@/lib/ui.js";

export default function PageShell({ children, className = "" }) {
  return (
    <div className={cn(page, className)}>
      <AmbientBackground />
      <div className="relative z-10 mx-auto w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {children}
      </div>
    </div>
  );
}
