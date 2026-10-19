import { cn } from "@/lib/cn.js";
import { card, cardHeader, cardInteractive } from "@/lib/ui.js";
import { FaUser, FaEnvelope, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import SecurityActionsCard from "./SecurityActionsCard.jsx";

export default function AccountDetailsCard({
  user,
  theme,
  RoleIcon,
  dashboardLink,
  onChangePassword,
}) {
  return (
    <div className={cn(card, cardInteractive, "shadow-2xl")}>
      {/* Card header */}
      <div className={cardHeader}>
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FaUser className="text-indigo-400" />
          Account Information
        </h3>
      </div>

      <div className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Info fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Name */}
            <div>
              <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                <span className="flex items-center gap-2">
                  <FaUser className={cn("text-muted-foreground", "text-xs")} />
                  Full Name
                </span>
              </label>
              <div className="bg-input border border-border px-4 py-3 rounded-xl">
                <p className={cn("text-secondary-foreground", "font-semibold", "text-sm")}>
                  {user.name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                <span className="flex items-center gap-2">
                  <FaEnvelope className={cn("text-muted-foreground", "text-xs")} />
                  Email Address
                </span>
              </label>
              <div className="bg-input border border-border px-4 py-3 rounded-xl break-all">
                <p className={cn("text-secondary-foreground", "font-semibold", "text-sm")}>
                  {user.email}
                </p>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                <span className="flex items-center gap-2">
                  <FaShieldAlt className={cn("text-muted-foreground", "text-xs")} />
                  Role
                </span>
              </label>
              <div className="bg-input border border-border px-4 py-3 rounded-xl">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${theme.badge}`}>
                  <RoleIcon className="text-xs" />
                  {theme.label}
                </span>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className={cn("block", "text-muted-foreground", "text-sm", "font-medium", "mb-1.5")}>
                <span className="flex items-center gap-2">
                  <FaCheckCircle className={cn("text-muted-foreground", "text-xs")} />
                  Account Status
                </span>
              </label>
              <div className="bg-input border border-border px-4 py-3 rounded-xl">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <SecurityActionsCard
            dashboardLink={dashboardLink}
            onChangePassword={onChangePassword}
          />
        </div>
      </div>
    </div>
  );
}
