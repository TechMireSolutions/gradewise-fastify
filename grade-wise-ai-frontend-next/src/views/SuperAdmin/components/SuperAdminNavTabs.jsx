"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";
import {
  FaTachometerAlt,
  FaUsers,
  FaKey,
  FaChartBar,
  FaHeartbeat,
} from "react-icons/fa";

const SUPER_ADMIN_TABS = [
  {
    name: "Overview",
    href: "/super-admin/dashboard",
    icon: FaTachometerAlt,
  },
  {
    name: "Users & Roles",
    href: "/super-admin/users",
    icon: FaUsers,
  },
  {
    name: "AI Configuration",
    href: "/super-admin/api-config",
    icon: FaKey,
  },
  {
    name: "Platform Analytics",
    href: "/super-admin/analytics",
    icon: FaChartBar,
  },
  {
    name: "System Health",
    href: "/super-admin/system",
    icon: FaHeartbeat,
  },
];

export default function SuperAdminNavTabs({ className = "" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Super Admin Portal Navigation"
      className={cn(
        "bg-input border border-border rounded-2xl p-1.5 shadow-sm mb-6 sm:mb-8 flex items-center gap-1.5 overflow-x-auto overscroll-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch]",
        className
      )}
    >
      {SUPER_ADMIN_TABS.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap min-h-[44px] cursor-pointer",
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 font-semibold"
                : "text-secondary-foreground hover:text-foreground hover:bg-surface-elevated",
              focusRing
            )}
          >
            <IconComponent
              className={cn(
                "w-4 h-4 flex-shrink-0",
                isActive ? "text-white" : "text-indigo-500 dark:text-indigo-400"
              )}
              aria-hidden="true"
            />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
