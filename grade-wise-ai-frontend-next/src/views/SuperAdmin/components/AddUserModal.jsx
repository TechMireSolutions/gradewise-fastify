"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn.js";
import { focusRing, iconBadge, statusTone } from "@/lib/ui.js";
import {
  FaUser,
  FaEnvelope,
  FaUserPlus,
  FaTimes,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCrown,
  FaCheck,
} from "react-icons/fa";
import { Input, PasswordInput, Button, Label } from "@/components/ui/index.js";
import PasswordRequirements from "@/components/auth/PasswordRequirements.jsx";
import { createUserSchema } from "@/schemas/authSchemas.js";
import { parseZodFieldErrors } from "@/utils/parseZodFieldErrors.js";

const ROLE_OPTIONS = [
  {
    id: "student",
    name: "Student",
    icon: FaUserGraduate,
    color: "emerald",
    desc: "Takes timed assessments, receives AI feedback and study guides.",
    badgeClass: statusTone.success,
    activeCardClass: "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/10",
  },
  {
    id: "instructor",
    name: "Instructor",
    icon: FaChalkboardTeacher,
    color: "indigo",
    desc: "Uploads resources, designs assessments, enrolls students.",
    badgeClass: statusTone.info,
    activeCardClass: "border-indigo-500 bg-indigo-500/10 shadow-indigo-500/10",
  },
  {
    id: "admin",
    name: "Admin",
    icon: FaCrown,
    color: "rose",
    desc: "Platform administration, KPI monitoring, user management.",
    badgeClass: statusTone.danger,
    activeCardClass: "border-red-500 bg-red-500/10 shadow-red-500/10",
  },
];

export default function AddUserModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "instructor",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        role: "instructor",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
    setErrors((prev) => (prev.role ? { ...prev, role: "" } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = createUserSchema.safeParse(formData);
    if (!result.success) {
      setErrors(parseZodFieldErrors(result.error) || {});
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      if (err?.fieldErrors) {
        setErrors(err.fieldErrors);
      }
    }
  };

  const passwordsMatch =
    Boolean(formData.password) &&
    Boolean(formData.confirmPassword) &&
    formData.password === formData.confirmPassword;

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
        aria-labelledby="add-user-modal-title"
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto overscroll-contain transition-all duration-300 relative my-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-input/95 backdrop-blur-md px-6 py-5 border-b border-border flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className={cn("p-2.5 rounded-xl text-white shadow-md", iconBadge)}>
              <FaUserPlus className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 id="add-user-modal-title" className="text-xl font-bold text-foreground truncate">
                Add New User
              </h2>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Register a new student, instructor, or administrator with verified status.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Full Name */}
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Dr. Ada Lovelace"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            leftIcon={<FaUser />}
            required
            autoFocus
          />

          {/* Email Address */}
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. ada@university.edu"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            leftIcon={<FaEnvelope />}
            required
          />

          {/* Role Selection */}
          <div>
            <Label required className="mb-2">
              Platform Role
            </Label>
            <div role="radiogroup" aria-label="Platform Role Selection" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const isSelected = formData.role === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleRoleSelect(opt.id)}
                    className={cn(
                      "p-3 rounded-xl border text-start transition-all duration-200 cursor-pointer relative",
                      isSelected
                        ? opt.activeCardClass
                        : "border-border bg-input hover:bg-surface-elevated hover:border-accent/30",
                      focusRing
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn("p-1.5 rounded-lg border text-xs", opt.badgeClass)}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                      {isSelected && (
                        <FaCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      )}
                    </div>
                    <div className="font-semibold text-sm text-foreground mb-1">{opt.name}</div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1.5">{errors.role}</p>}
          </div>

          {/* Password */}
          <div>
            <PasswordInput
              label="Temporary Password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            {formData.password && (
              <div className="mt-2.5">
                <PasswordRequirements password={formData.password} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Re-type password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            {passwordsMatch && (
              <p className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 mt-1.5 font-medium">
                <FaCheck className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

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
              className="w-full sm:w-auto"
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
