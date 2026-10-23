"use client";

import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
import { FaUsers, FaSync, FaUserPlus } from "react-icons/fa";
import { SearchField, Button, Select } from "@/components/ui/index.js";
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
    <div className={cn(card, "@container shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200")}>
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
                  className="h-11 text-xs"
                />
              </div>
            )}

            {onRoleFilterChange && (
              <div className="w-auto min-w-[130px]">
                <Select
                  value={roleFilter}
                  onChange={(e) => onRoleFilterChange(e.target.value)}
                  aria-label="Filter by role"
                  className="py-2 px-3 text-xs h-11 w-auto"
                >
                  <option value="">All Roles</option>
                  <option value="super_admin">Super Admins</option>
                  <option value="admin">Admins</option>
                  <option value="instructor">Instructors</option>
                  <option value="student">Students</option>
                </Select>
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={onRefresh}
              aria-label="Refresh user list"
              className="text-xs px-3.5 min-h-[44px] gap-2"
            >
              <FaSync aria-hidden="true" className={actionLoading === "fetch" ? "animate-spin" : ""} />
              Refresh
            </Button>

            {onOpenCreateModal && (
              <Button
                type="button"
                variant="primary"
                onClick={onOpenCreateModal}
                className="text-xs px-3.5 min-h-[44px] whitespace-nowrap gap-1.5"
              >
                <FaUserPlus className="w-3.5 h-3.5" />
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
