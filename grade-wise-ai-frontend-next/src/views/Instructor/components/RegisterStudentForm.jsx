import {
  Button,
  Input,
  Label,
  LoadingSpinner,
  PasswordInput,
} from "@/components/ui/index.js";
import { PasswordRequirements } from "@/components/auth/index.js";
import {
  FaUser,
  FaEnvelope,
  FaUserPlus,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

export default function RegisterStudentForm({
  formData,
  errors = {},
  onChange,
  onSubmit,
  isLoading = false,
  compact = false,
  onCancel,
}) {
  const isPasswordsMatching =
    formData.confirmPassword && formData.password === formData.confirmPassword;
  const isPasswordsMismatched =
    formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-4" : "space-y-5"} noValidate>
      {/* Full Name */}
      <div>
        <Label htmlFor="student-name">Full Name</Label>
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10" aria-hidden="true" />
          <Input
            id="student-name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={onChange}
            error={Boolean(errors.name)}
            aria-describedby={errors.name ? "student-name-error" : undefined}
            placeholder="John Doe"
            required
          />
        </div>
        {errors.name && (
          <p id="student-name-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" aria-hidden="true" />
            <span>{errors.name}</span>
          </p>
        )}
      </div>

      {/* Email Address */}
      <div>
        <Label htmlFor="student-email">Email Address</Label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10" aria-hidden="true" />
          <Input
            id="student-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={onChange}
            error={Boolean(errors.email)}
            aria-describedby={errors.email ? "student-email-error" : undefined}
            placeholder="student@example.com"
            required
          />
        </div>
        {errors.email && (
          <p id="student-email-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" aria-hidden="true" />
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
          onChange={onChange}
          error={Boolean(errors.password)}
          aria-describedby={errors.password ? "student-password-error" : "student-password-rules"}
          placeholder="Min. 8 chars (upper, lower, number)"
          required
        />
        {errors.password && (
          <p id="student-password-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" aria-hidden="true" />
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
              <FaCheckCircle className="w-3 h-3" aria-hidden="true" />
              <span>Passwords match</span>
            </span>
          )}
        </div>
        <PasswordInput
          id="student-confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={onChange}
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
            <FaExclamationTriangle className="shrink-0" aria-hidden="true" />
            <span>{errors.confirmPassword}</span>
          </p>
        )}
        {!errors.confirmPassword && isPasswordsMismatched && (
          <p id="student-confirmPassword-mismatch" role="alert" className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" aria-hidden="true" />
            <span>Passwords do not match yet</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
        {!compact && onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            <FaArrowLeft className="shrink-0" aria-hidden="true" />
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
              <FaUserPlus className="shrink-0" aria-hidden="true" />
              <span>Register Student</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
