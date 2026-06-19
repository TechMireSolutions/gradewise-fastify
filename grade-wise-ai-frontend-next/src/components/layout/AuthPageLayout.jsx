import { cn } from "@/lib/cn.js";
import { focusRing, page } from "@/lib/ui.js";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import AmbientBackground from "./AmbientBackground.jsx";
import MainLandmark from "./MainLandmark.jsx";
import ThemeToggle from "@/components/ThemeToggle.jsx";

export default function AuthPageLayout({
  children,
  backTo = "/",
  backLabel = "Back to Home Page",
  maxWidth = "max-w-md",
}) {
  return (
    <div className={cn(page, "flex", "items-center", "justify-center", "px-4", "py-12")}>
      <AmbientBackground />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <MainLandmark className={`relative w-full ${maxWidth}`}>
        <div className="mb-6">
          <Link
            to={backTo}
            className={cn(
              "group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-accent",
              focusRing
            )}
          >
            <FaArrowLeft className="transition-transform duration-150 group-hover:-translate-x-1" aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </div>
        {children}
      </MainLandmark>
    </div>
  );
}
