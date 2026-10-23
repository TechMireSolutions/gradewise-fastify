"use client";

import { cn } from "@/lib/cn.js";
import { accentPanel, card, cardHeader, chip, chipTone, focusRing, iconBadge, tableHead, tableRowHover } from "@/lib/ui.js";
import { LoadingSpinner, SearchField } from "@/components/ui";
import { FaUsers, FaUserGraduate, FaUserMinus } from "react-icons/fa";

export default function EnrolledRosterTable({
  students = [],
  totalCount = 0,
  loading = false,
  searchTerm = "",
  onSearchChange,
  onRequestUnenroll,
}) {
  return (
    <div className={cn(card, "shadow-xl h-fit overflow-hidden")}>
      <div className={cardHeader}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", iconBadge)}>
              <FaUsers className="text-white text-sm" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground text-balance">Enrolled Roster</h2>
              <p className="text-xs text-muted-foreground">{totalCount} students enrolled</p>
            </div>
          </div>

          {totalCount > 3 && (
            <SearchField
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search enrolled..."
              className="w-full sm:w-56"
            />
          )}
        </div>
      </div>

      <div className="p-6">
        {loading && students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <LoadingSpinner size="lg" type="spinner" color="blue" />
            </div>
            <p className="text-muted-foreground text-sm">Loading enrolled students...</p>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className={cn(accentPanel, "w-16 h-16 rounded-2xl flex items-center justify-center mb-4")}>
              <FaUserGraduate className="text-indigo-500 dark:text-indigo-400 text-2xl" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1 text-balance">No Students Enrolled</h3>
            <p className="text-muted-foreground text-sm max-w-xs text-pretty">
              Use the form on the left to register or enroll students into this assessment.
            </p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No students match &quot;{searchTerm}&quot;.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-border">
              <table className="min-w-full">
                <thead className={tableHead}>
                  <tr>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Student Name
                    </th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Email
                    </th>
                    <th className="px-5 py-3 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card/40">
                  {students.map((s) => (
                    <tr key={s?.id} className={cn(tableRowHover, "transition-colors duration-150")}>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">
                        {s?.name}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {s?.email}
                      </td>
                      <td className="px-5 py-3.5 text-end">
                        <button
                          type="button"
                          onClick={() => onRequestUnenroll(s)}
                          className={cn(chip, chipTone.danger, focusRing)}
                          aria-label={`Unenroll ${s?.name}`}
                        >
                          <FaUserMinus className="text-xs" aria-hidden="true" />
                          <span>Unenroll</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {students.map((s) => (
                <div
                  key={s?.id}
                  style={{ contentVisibility: "auto", containIntrinsicSize: "auto 100px" }}
                  className="bg-input/60 rounded-xl border border-border p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate">{s?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRequestUnenroll(s)}
                    className={cn(chip, chipTone.danger, "shrink-0", focusRing)}
                    aria-label={`Unenroll ${s?.name}`}
                  >
                    <FaUserMinus className="text-xs" aria-hidden="true" />
                    <span>Unenroll</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
