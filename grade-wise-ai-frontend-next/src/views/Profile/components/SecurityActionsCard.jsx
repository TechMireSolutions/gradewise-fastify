import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";
import Link from "next/link";
import { FaTachometerAlt, FaKey } from "react-icons/fa";

export default function SecurityActionsCard({ dashboardLink, onChangePassword }) {
  return (
    <div className="pt-6 border-t border-border">
      <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <FaTachometerAlt className="text-indigo-500 dark:text-indigo-400" />
        Quick Actions
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          href={dashboardLink}
          className={cn(btn.primary, "flex items-center justify-center gap-2 px-5 py-3", "min-h-[44px]")}
        >
          <FaTachometerAlt />
          <span>Go to Dashboard</span>
        </Link>
        <button
          type="button"
          onClick={onChangePassword}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2.5",
            "bg-btn-secondary hover:bg-surface-elevated border border-border",
            "text-secondary-foreground hover:text-foreground rounded-xl font-medium text-sm",
            "transition-all duration-200 active:scale-95 cursor-pointer min-h-[44px]"
          )}
        >
          <FaKey />
          <span>Change Password</span>
        </button>
      </div>
    </div>
  );
}
