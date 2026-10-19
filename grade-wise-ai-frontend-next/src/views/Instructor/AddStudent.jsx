"use client";

import { cn } from "@/lib/cn.js";
import { card, cardHeader, cardInteractive, iconBadge, page } from "@/lib/ui.js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAssessmentStore from "@/features/assessments/store.js";
import useAuthStore from "@/features/auth/store.js";
import {
  Button,
  Input,
  Label,
  LoadingSpinner,
  Modal,
  PasswordInput,
} from "@/components/ui/index.js";
import { PasswordRequirements } from "@/components/auth/index.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import {
  FaUser,
  FaEnvelope,
  FaUserPlus,
  FaArrowLeft,
  FaUserGraduate,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import {
  registerStudentSchema,
  enrollStudentSchema,
} from "@/schemas/studentSchemas.js";
import useModal from "@/hooks/useModal.js";
import { parseZodFieldErrors } from "@/utils/parseZodFieldErrors.js";

function AddStudent({ assessmentId, onStudentAdded, compact = false }) {
  const router = useRouter();
  const { enrollStudent, loading: enrollLoading } = useAssessmentStore();
  const { registerStudent, user: currentUser } = useAuthStore();

  const [mode, setMode] = useState(assessmentId ? "enroll" : "register");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { modal, showModal: openModal, closeModal } = useModal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const showModal = (type, title, message, redirect = false) => {
    openModal(type, title, message);

    if (type === "success" && redirect) {
      setTimeout(() => {
        closeModal();
        if (currentUser?.role === "super_admin") {
          router.push("/super-admin/dashboard");
        } else if (currentUser?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/instructor/dashboard");
        }
      }, 1500);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      registerStudentSchema.parse(formData);
    } catch (err) {
      const fieldErrors = parseZodFieldErrors(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
        const firstKey = Object.keys(fieldErrors)[0];
        if (firstKey) {
          document.getElementById(`student-${firstKey}`)?.focus();
        }
        return;
      }
      showModal("error", "Invalid Input", err.message || "Invalid form data");
      return;
    }

    setIsLoading(true);
    try {
      await registerStudent({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (assessmentId) {
        await enrollStudent(assessmentId, formData.email.trim());
        onStudentAdded?.();
        resetForm();
        showModal("success", "Success", "Student registered and enrolled successfully!");
      } else {
        resetForm();
        showModal("success", "Success", "Student registered successfully!", true);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed. Please try again.";
      showModal("error", "Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      enrollStudentSchema.parse({ email: formData.email });
    } catch (err) {
      const fieldErrors = parseZodFieldErrors(err);
      if (fieldErrors?.email) {
        setErrors({ email: fieldErrors.email });
        document.getElementById("enroll-email")?.focus();
        return;
      }
      showModal("error", "Invalid Input", err.message || "Invalid email address");
      return;
    }

    try {
      await enrollStudent(assessmentId, formData.email.trim());
      showModal("success", "Success", "Student enrolled successfully!");
      setFormData((prev) => ({ ...prev, email: "" }));
      onStudentAdded?.();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Enrollment failed. Please try again.";
      showModal("error", "Enrollment Failed", errorMessage);
    }
  };

  const isPasswordsMatching =
    formData.confirmPassword && formData.password === formData.confirmPassword;
  const isPasswordsMismatched =
    formData.confirmPassword && formData.password !== formData.confirmPassword;

  const formContent = mode === "register" ? (
    <form onSubmit={handleRegister} className={compact ? "space-y-4" : "space-y-5"} noValidate>
      {/* Full Name */}
      <div>
        <Label htmlFor="student-name">Full Name</Label>
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10" />
          <Input
            id="student-name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            aria-describedby={errors.name ? "student-name-error" : undefined}
            placeholder="John Doe"
            required
          />
        </div>
        {errors.name && (
          <p id="student-name-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" />
            <span>{errors.name}</span>
          </p>
        )}
      </div>

      {/* Email Address */}
      <div>
        <Label htmlFor="student-email">Email Address</Label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10" />
          <Input
            id="student-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={Boolean(errors.email)}
            aria-describedby={errors.email ? "student-email-error" : undefined}
            placeholder="student@example.com"
            required
          />
        </div>
        {errors.email && (
          <p id="student-email-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" />
            <span>{errors.email}</span>
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="student-password">Password</Label>
        <PasswordInput
          id="student-password"
          name="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={Boolean(errors.password)}
          aria-describedby={errors.password ? "student-password-error" : "student-password-rules"}
          placeholder="Min. 8 chars (upper, lower, number)"
          required
        />
        {errors.password && (
          <p id="student-password-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" />
            <span>{errors.password}</span>
          </p>
        )}
        <div id="student-password-rules" className="mt-2.5">
          <PasswordRequirements password={formData.password} />
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="student-confirmPassword" className="mb-0">
            Confirm Password
          </Label>
          {isPasswordsMatching && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <FaCheckCircle className="w-3 h-3" />
              <span>Passwords match</span>
            </span>
          )}
        </div>
        <PasswordInput
          id="student-confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={Boolean(errors.confirmPassword || isPasswordsMismatched)}
          aria-describedby={
            errors.confirmPassword
              ? "student-confirmPassword-error"
              : isPasswordsMismatched
              ? "student-confirmPassword-mismatch"
              : undefined
          }
          placeholder="Re-enter password"
          required
        />
        {errors.confirmPassword && (
          <p id="student-confirmPassword-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" />
            <span>{errors.confirmPassword}</span>
          </p>
        )}
        {!errors.confirmPassword && isPasswordsMismatched && (
          <p id="student-confirmPassword-mismatch" role="alert" className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" />
            <span>Passwords do not match yet</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
        {!compact && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            <FaArrowLeft className="shrink-0" />
            <span>Cancel</span>
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" type="dots" />
              <span>Registering...</span>
            </>
          ) : (
            <>
              <FaUserPlus className="shrink-0" />
              <span>Register Student</span>
            </>
          )}
        </Button>
      </div>
    </form>
  ) : (
    <form onSubmit={handleEnroll} className={compact ? "space-y-4" : "space-y-5"} noValidate>
      {/* Enroll by Email */}
      <div>
        <Label htmlFor="enroll-email">Student Email Address</Label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10" />
          <Input
            id="enroll-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={Boolean(errors.email)}
            aria-describedby={errors.email ? "enroll-email-error" : undefined}
            placeholder="student@example.com"
            required
          />
        </div>
        {errors.email && (
          <p id="enroll-email-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" />
            <span>{errors.email}</span>
          </p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">
          Enter the registered email address of the student to enroll them into this assessment.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
        {!compact && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            <FaArrowLeft className="shrink-0" />
            <span>Cancel</span>
          </Button>
        )}
        <Button
          type="submit"
          variant="success"
          disabled={enrollLoading}
        >
          {enrollLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" type="dots" />
              <span>Enrolling...</span>
            </>
          ) : (
            <>
              <FaUserGraduate className="shrink-0" />
              <span>Enroll Student</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );

  // Standalone page layout
  if (!compact) {
    return (
      <div className={page}>
        <AmbientBackground />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("p-2.5", "rounded-xl", iconBadge)}>
                <FaUserPlus className="text-white text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Student Management
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  {mode === "register" ? "Add New Student" : "Enroll Existing Student"}
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Register a new student account or enroll an existing student into an assessment.
            </p>
          </div>

          {/* Card */}
          <div className={cn(card, cardInteractive, "shadow-2xl")}>
            {/* Card header */}
            <div className={cardHeader}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {mode === "register" ? "Register Student" : "Enroll Existing Student"}
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
                    mode === "register"
                      ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  )}
                >
                  {mode === "register" ? (
                    <>
                      <FaUser className="text-xs" />
                      <span>New Student</span>
                    </>
                  ) : (
                    <>
                      <FaUserGraduate className="text-xs" />
                      <span>Existing Student</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div className="p-6 sm:p-8">{formContent}</div>
          </div>
        </div>

        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          title={modal.title}
        >
          {modal.message}
        </Modal>
      </div>
    );
  }

  // Compact mode (modal embed)
  return (
    <>
      {assessmentId && (
        <div className="mb-4 -mt-2">
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setMode((m) => (m === "enroll" ? "register" : "enroll"));
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer"
          >
            {mode === "enroll"
              ? "→ Register new student instead"
              : "→ Enroll existing student instead"}
          </button>
        </div>
      )}
      {formContent}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>
    </>
  );
}

export default AddStudent;
