"use client";

import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";
import Link from "next/link";
import {
  FaCrown,
  FaShieldAlt,
  FaUsers,
  FaKey,
  FaUserPlus,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { Button } from "@/components/ui/index.js";

export default function SuperAdminHeader({
  user,
  totalUsers = 0,
  onOpenCreateModal,
  onOpenApiConfigModal,
}) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className={cn(card, "shadow-2xl p-6 sm:p-8 lg:p-10")}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Column: Greeting & Privileges */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              System Control Center
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3 mb-2 text-balance">
              <span className={cn("p-2.5 rounded-xl text-yellow-300 shadow-md", iconBadge)}>
                <FaCrown className="w-5 h-5 text-yellow-300" />
              </span>
              Super Admin Dashboard
            </h1>

            <p className="text-secondary-foreground leading-relaxed mb-4 text-pretty">
              Welcome back, <span className="text-foreground font-semibold">{user?.name}</span>. Full administrative access to users, roles, and AI provider configurations.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 inline-flex items-start gap-3 max-w-2xl">
              <FaShieldAlt className="text-amber-500 dark:text-amber-400 text-lg flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <strong className="block text-amber-700 dark:text-amber-300 mb-0.5">
                  Full Authority
                </strong>
                <span className="text-muted-foreground leading-relaxed">
                  Manage all users, reassign account roles, and maintain system AI API keys.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Stats & Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
            {/* Quick Stat Tiles */}
            <div className="flex items-center gap-3">
              <div className="bg-input border border-border rounded-2xl p-3.5 sm:p-4 text-center flex-1 sm:min-w-[100px]">
                <FaUsers className="w-6 h-6 mx-auto mb-1 text-indigo-500 dark:text-indigo-400" />
                <p className="text-2xl font-bold text-foreground leading-none mb-1">{totalUsers}</p>
                <p className="text-xs text-muted-foreground font-medium">Total Users</p>
              </div>

              <Link
                href="/super-admin/api-config"
                className="bg-input hover:bg-btn-secondary border border-border hover:border-indigo-500/30 rounded-2xl p-3.5 sm:p-4 text-center transition-all duration-200 group flex-1 sm:min-w-[100px]"
                title="Open dedicated API Configuration page"
              >
                <div className="flex items-center justify-center gap-1 text-indigo-500 dark:text-indigo-400 mb-1">
                  <FaKey className="w-5 h-5 group-hover:scale-110 transition-transform duration-150" />
                  <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-60" />
                </div>
                <p className="text-xs font-semibold text-secondary-foreground group-hover:text-foreground transition-colors">
                  API Page
                </p>
                <p className="text-[10px] text-muted-foreground">Full Settings</p>
              </Link>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 pt-1">
              <Button
                type="button"
                variant="primary"
                onClick={onOpenCreateModal}
                className="w-full justify-center"
              >
                <FaUserPlus className="w-3.5 h-3.5 me-2" />
                Add User
              </Button>

              {onOpenApiConfigModal && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onOpenApiConfigModal}
                  className="w-full justify-center"
                >
                  <FaKey className="w-3.5 h-3.5 me-2 text-indigo-500 dark:text-indigo-400" />
                  Configure AI Keys
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
