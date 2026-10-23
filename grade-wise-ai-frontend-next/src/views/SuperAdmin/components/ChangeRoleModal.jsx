"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";
import {
  FaTimes,
  FaShieldAlt,
  FaCrown,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaExclamationTriangle,
  FaCheck,
} from "react-icons/fa";
import { Button } from "@/components/ui/index.js";
import { getRoleBadgeColor, getRoleAvatarBg, formatRole } from "@/utils/roleDisplay.js";

const ROLES = [
  {
    id: "student",
    name: "Student",
    icon: FaUserGraduate,
    desc: "Can take assigned timed exams, review XAI justifications, and access personalized study guides.",
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    activeClass: "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/10",
  },
  {
    id: "instructor",
    name: "Instructor",
    icon: FaChalkboardTeacher,
    desc: "Can author assessments, upload and vectorize course resources, enroll students, and view performance analytics.",
    badgeClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    activeClass: "border-indigo-500 bg-indigo-500/10 shadow-indigo-500/10",
  },
  {
    id: "admin",
    name: "Admin",
    icon: FaCrown,
    desc: "Can manage platform users, promote/demote roles, inspect system KPIs, and audit assessments.",
    badgeClass: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
    activeClass: "border-red-500 bg-red-500/10 shadow-red-500/10",
  },
];

export default function ChangeRoleModal({
  isOpen,
  onClose,
  user,
  onRoleChange,
  loading = false,
}) {
  const [selectedRole, setSelectedRole] = useState(user?.role || "student");

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRole === user.role) return;
    await onRoleChange(user.id, selectedRole, user.name, user.email);
  };

  const isUnchanged = selectedRole === user.role;
  const isPromotingToAdmin = selectedRole === "admin" && user.role !== "admin";

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
        aria-labelledby="change-role-modal-title"
        className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto overscroll-contain transition-all duration-300 relative my-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-input/95 backdrop-blur-md px-6 py-5 border-b border-border flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <FaShieldAlt className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 id="change-role-modal-title" className="text-xl font-bold text-foreground truncate">
                Change User Role
              </h2>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Update account privileges and access permissions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className={cn(
              "p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-btn-secondary transition-all active:scale-95 disabled:opacity-50 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center",
              focusRing
            )}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* User Preview Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-input border border-border">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 bg-gradient-to-br ${getRoleAvatarBg(
                user.role
              )}`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-base truncate">{user.name}</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  Current: {formatRole(user.role)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Assign New Role
            </label>
            <div role="radiogroup" aria-label="Assign New Role" className="space-y-3">
              {ROLES.map((roleOpt) => {
                const isSelected = selectedRole === roleOpt.id;
                const isCurrent = user.role === roleOpt.id;
                const IconComponent = roleOpt.icon;
                return (
                  <button
                    key={roleOpt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedRole(roleOpt.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-start transition-all duration-200 cursor-pointer flex items-start gap-3.5 relative",
                      isSelected
                        ? roleOpt.activeClass
                        : "border-border bg-input hover:bg-surface-elevated hover:border-accent/30",
                      focusRing
                    )}
                  >
                    <span className={cn("p-2 rounded-lg border text-sm flex-shrink-0 mt-0.5", roleOpt.badgeClass)}>
                      <IconComponent className="w-4 h-4" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground">{roleOpt.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-input border border-border text-muted-foreground">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {roleOpt.desc}
                      </p>
                    </div>

                    <div className="flex items-center self-center flex-shrink-0 ms-2">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                          isSelected
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : "border-border bg-card"
                        )}
                      >
                        {isSelected && <FaCheck className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Elevation Warning Banner */}
          {isPromotingToAdmin && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm">
              <FaExclamationTriangle className="text-amber-500 dark:text-amber-400 text-lg flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-700 dark:text-amber-300 font-semibold mb-0.5">
                  Elevating to Administrator
                </strong>
                <p className="text-muted-foreground leading-relaxed">
                  Admins have permissions to view all users, promote instructors and students, and access institutional metrics.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
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
              type="submit"
              variant="primary"
              loading={loading}
              disabled={isUnchanged}
              className="w-full sm:w-auto"
            >
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
