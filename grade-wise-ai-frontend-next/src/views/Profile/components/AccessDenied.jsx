import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";
import Link from "next/link";
import { FaShieldAlt, FaUser } from "react-icons/fa";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 flex items-center justify-center mb-6">
        <FaShieldAlt className="text-4xl text-red-400" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2 text-wrap-balance">
        Access Denied
      </h3>
      <p className={cn("text-muted-foreground", "max-w-sm", "mb-8", "text-sm", "sm:text-base", "text-wrap-pretty")}>
        Please log in to view your profile.
      </p>
      <Link
        href="/login"
        className={cn(btn.primary, "inline-flex items-center gap-2 px-5 py-3", "min-h-[44px]")}
      >
        <FaUser />
        <span>Go to Login</span>
      </Link>
    </div>
  );
}
