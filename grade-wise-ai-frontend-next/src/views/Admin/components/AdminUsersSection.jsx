import { cn } from "@/lib/cn.js";
import { btn, card, inputPlain, select } from "@/lib/ui.js";
import { FaUsers, FaSync, FaSearch } from "react-icons/fa";
import UserManagementTable from "@/components/admin/UserManagementTable.jsx";

export default function AdminUsersSection({
  users,
  currentUserId,
  actionLoading,
  onRoleChange,
  onRefresh,
  searchQuery = "",
  onSearchChange,
  roleFilter = "",
  onRoleFilterChange,
}) {
  return (
    <div className={cn(card, "shadow-2xl", "overflow-hidden", "hover:border-indigo-500/30", "transition-all", "duration-200")}>
      <div className="px-6 py-4 border-b border-border bg-input">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-1")}>
              Management
            </p>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FaUsers className="text-indigo-400" aria-hidden="true" />
              All Users
            </h2>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {onSearchChange && (
              <div className="relative flex-1 sm:w-64">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={cn(inputPlain, "pl-9 py-2 text-xs h-10")}
                  aria-label="Search users"
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
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
              </select>
            )}

            <button
              onClick={onRefresh}
              className={cn(btn.primary, "inline-flex items-center gap-2 px-4 py-2 text-xs", "cursor-pointer min-h-[40px]")}
              aria-label="Refresh user list"
            >
              <FaSync aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <UserManagementTable
        users={users}
        currentUserId={currentUserId}
        actionLoading={actionLoading}
        onRoleChange={onRoleChange}
      />
    </div>
  );
}
