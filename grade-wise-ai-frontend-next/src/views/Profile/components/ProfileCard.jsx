import { cn } from "@/lib/cn.js";
import { accentPanel, card, cardInteractive } from "@/lib/ui.js";
import { FaCheckCircle } from "react-icons/fa";

export default function ProfileCard({ user, theme, RoleIcon }) {
  return (
    <div className={cn(card, cardInteractive, "shadow-2xl", "overflow-hidden")}>
      {/* Avatar area */}
      <div className="px-6 py-8 text-center border-b border-border bg-input">
        <div className={cn(accentPanel, "w-20 h-20 sm:w-24 sm:h-24 rounded-full", "flex items-center justify-center mx-auto mb-4 shadow-lg")}>
          <RoleIcon className="text-4xl text-indigo-500 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 leading-tight text-wrap-balance">
          {user.name}
        </h2>
        <p className={cn("text-muted-foreground", "text-sm", "break-all", "leading-relaxed")}>
          {user.email}
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4">
          {/* Role badge */}
          <span className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap ${theme.badge}`}>
            <RoleIcon className="text-xs" />
            {theme.label}
          </span>

          {/* Verified indicator */}
          <div className="w-full pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <FaCheckCircle className="text-emerald-500 dark:text-emerald-400 text-base flex-shrink-0" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Email Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
