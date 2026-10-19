import { cn } from "@/lib/cn.js";
import AmbientBackground from "./AmbientBackground.jsx";
import { page } from "@/lib/ui.js";

export default function PageShell({ children, className = "", narrow = false }) {
  return (
    <div className={cn(page, className)}>
      <AmbientBackground />
      <div className={cn("relative z-10 mx-auto w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8", narrow ? "max-w-5xl" : "max-w-7xl")}>
        {children}
      </div>
    </div>
  );
}
