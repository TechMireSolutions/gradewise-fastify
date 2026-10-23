"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";
import { FaTrash, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { Button } from "@/components/ui/index.js";
import { getRoleBadgeColor, formatRole } from "@/utils/roleDisplay.js";

export default function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onConfirm,
  loading = false,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    },
    [onClose, loading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !user) return null;

  const targetName = user.name || user.userName || "this user";
  const targetEmail = user.email || user.userEmail || "";
  const targetRole = user.role || "";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto overscroll-contain flex items-center justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-modal-title"
        className="bg-card border border-red-500/30 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto overscroll-contain transition-all duration-300 relative my-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-input/95 backdrop-blur-md px-6 py-5 border-b border-border flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25">
              <FaTrash className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 id="delete-user-modal-title" className="text-xl font-bold text-red-700 dark:text-red-400 truncate">
                Confirm User Deletion
              </h2>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Permanent account removal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className={cn(
              "p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-btn-secondary transition-all active:scale-95 disabled:opacity-50 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center",
              focusRing
            )}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* User Details Box */}
          <div className="p-4 rounded-xl bg-input border border-border">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <span className="font-bold text-foreground text-base">{targetName}</span>
              {targetRole && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(targetRole)}`}>
                  {formatRole(targetRole)}
                </span>
              )}
            </div>
            {targetEmail && <p className="text-xs text-muted-foreground">{targetEmail}</p>}
          </div>

          {/* Warning Callout */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm">
            <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-red-700 dark:text-red-400 font-semibold mb-1">
                This action is irreversible
              </strong>
              <p className="text-secondary-foreground leading-relaxed">
                All account sessions will be invalidated immediately. Any question blocks created by this user will remain safely with their respective assessments, but author attribution will be cleared.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onConfirm}
              loading={loading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
