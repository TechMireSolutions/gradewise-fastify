import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";
import { FaCrown, FaUsers } from "react-icons/fa";

export default function AdminHeader({ user, totalUsers = 0 }) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className={cn(card, "shadow-2xl", "p-6", "sm:p-8", "lg:p-10", "hover:border-indigo-500/30", "transition-all", "duration-200")}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-2")}>
              Admin Portal
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2 sm:mb-3 flex items-center gap-3 text-balance">
              <span className={cn("p-2.5", "rounded-xl", iconBadge, "text-white")}>
                <FaCrown className="w-5 h-5" aria-hidden="true" />
              </span>
              Admin Dashboard
            </h1>
            <p className={cn("text-secondary-foreground", "leading-relaxed", "text-sm", "sm:text-base", "text-pretty")}>
              Welcome back, <span className="text-indigo-400 font-semibold">{user?.name}</span>! Manage your platform and oversee all operations.
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="bg-input backdrop-blur-sm border border-border rounded-xl p-4 lg:p-6 text-center">
              <div className={cn("p-2.5", "rounded-xl", iconBadge, "inline-flex", "items-center", "justify-center", "mb-3")}>
                <FaUsers className="w-8 h-8 lg:w-10 lg:h-10 text-white" aria-hidden="true" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">{totalUsers}</p>
              <p className={cn("text-xs", "text-muted-foreground", "mt-0.5")}>Total Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
