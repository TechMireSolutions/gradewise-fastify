import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";
import { FaCalendarAlt } from "react-icons/fa";
import WelcomeBanner from "@/components/layout/WelcomeBanner.jsx";

export default function InstructorHeader({ userName }) {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <WelcomeBanner
      eyebrow="Instructor Portal"
      title={`Welcome back, ${userName || "Instructor"}!`}
      description="Manage assessments, track student performance, and orchestrate curriculum resources."
      aside={
        <div className={cn("hidden sm:flex flex-col items-center", card, "p-4 min-w-[120px]")}>
          <div className={cn(iconBadge, "mb-2 p-2")}>
            <FaCalendarAlt className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground text-center">
            {formattedDate}
          </p>
        </div>
      }
    />
  );
}
