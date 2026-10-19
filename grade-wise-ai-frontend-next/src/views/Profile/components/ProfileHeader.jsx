import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";

export default function ProfileHeader({ RoleIcon }) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className={cn(card, "shadow-2xl", "p-6", "sm:p-8")}>
        <div className="flex items-center gap-4">
          <div className={cn("p-2.5", "rounded-xl", iconBadge, "flex-shrink-0")}>
            <RoleIcon className="text-foreground text-xl" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-wrap-balance">
              My Profile
            </h1>
            <p className={cn("text-muted-foreground", "text-sm", "mt-1", "text-wrap-pretty")}>
              Manage your account information and settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
