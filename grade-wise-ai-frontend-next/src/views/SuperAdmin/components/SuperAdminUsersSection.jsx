"use client";

import { cn } from "@/lib/cn.js";
import { card, select } from "@/lib/ui.js";
import { FaUsers, FaSync, FaUserPlus } from "react-icons/fa";
import { SearchField, Button } from "@/components/ui/index.js";
import UserManagementTable from "@/components/admin/UserManagementTable.jsx";

export default function SuperAdminUsersSection({
  users,
  currentUserId,
  actionLoading,
  onRefresh,
  onOpenCreateModal,
  onOpenRoleModal,
  onDelete,
  searchQuery = "",
  onSearchChange,
  roleFilter = "",
  onRoleFilterChange,
}) {
  return (
    <div className={cn(card, "shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200")}>
      {/* Section Header & Toolbar */}
      <div className="px-6 py-4 border-b border-border bg-input">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Account Directory
            </p>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FaUsers className="text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
              Platform Users
              <span className="text-xs font-normal text-muted-foreground ms-1">
                ({users.length} active account{users.length !== 1 ? "s" : ""})
              </span>
            </h2>
          </div>

          {/* Search, Filter & Action Toolbar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {onSearchChange && (
              <div className="w-full sm:w-64">
                <SearchField
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onClear={() => onSearchChange("")}
                  className="h-10 text-xs"
                />
              </div>
            )}

            {onRoleFilterChange && (
              <select
                value={roleFilter}
                onChange={(e) => onRoleFilterChange(e.target.value)}
                className={cn(select, "py-2 px-3 text-xs h-10 w-auto min-w-[120px]")}
                aria-label="Filter by role"
              >
                <option value="">All Roles</option>
                <option value="admin">Admins</option>
                <option value="instructor">Instructors</option>
                <option value="student">Students</option>
              </select>
            )}

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-btn-secondary hover:bg-surface-elevated text-secondary-foreground hover:text-foreground border border-border rounded-xl font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer min-h-[40px]"
              aria-label="Refresh user list"
            >
              <FaSync aria-hidden="true" className={actionLoading === "fetch" ? "animate-spin" : ""} />
              Refresh
            </button>

            {onOpenCreateModal && (
              <Button
                type="button"
                variant="primary"
                onClick={onOpenCreateModal}
                className="text-xs px-3.5 py-2 min-h-[40px] whitespace-nowrap"
              >
                <FaUserPlus className="w-3.5 h-3.5 me-1.5" />
                Add User
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* User Table (Modal-guarded actions) */}
      <UserManagementTable
        users={users}
        currentUserId={currentUserId}
        actionLoading={actionLoading}
        onOpenRoleModal={onOpenRoleModal}
        onDelete={onDelete}
        canDelete
      />
    </div>
  );
}
