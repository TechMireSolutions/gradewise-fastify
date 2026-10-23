import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";
import { FaCrown, FaUsers, FaUserPlus } from "react-icons/fa";
import { Button } from "@/components/ui/index.js";

export default function AdminHeader({ user, totalUsers = 0, onOpenCreateModal }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className={cn(card, "@container shadow-2xl p-6 sm:p-8 lg:p-10 hover:border-indigo-500/30 transition-all duration-200")}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Admin Authority Portal
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2 sm:mb-3 flex items-center gap-3 text-balance">
              <span className={cn("p-2.5 rounded-xl text-white", iconBadge)}>
                <FaCrown className="w-5 h-5" aria-hidden="true" />
              </span>
              Admin Dashboard
            </h1>
            <p className="text-secondary-foreground leading-relaxed text-sm sm:text-base text-pretty">
              Welcome back, <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{user?.name}</span>. Manage platform accounts, reassign roles, and oversee institutional governance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {onOpenCreateModal && (
              <Button
                variant="primary"
                onClick={onOpenCreateModal}
                className="justify-center gap-2 min-h-[44px]"
              >
                <FaUserPlus className="w-4 h-4" />
                Add New User
              </Button>
            )}

            <div className="bg-input backdrop-blur-sm border border-border rounded-xl px-5 py-3 text-center flex sm:flex-col items-center justify-between sm:justify-center gap-2">
              <div className="flex items-center gap-2">
                <span className={cn("p-1.5 rounded-lg text-white", iconBadge)}>
                  <FaUsers className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-xs text-muted-foreground sm:hidden">Total Users:</span>
              </div>
              <div className="text-right sm:text-center">
                <p className="text-lg sm:text-2xl font-bold text-foreground leading-none">{totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Total Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
