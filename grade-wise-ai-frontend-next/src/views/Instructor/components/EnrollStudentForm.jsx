import {
  Button,
  Input,
  Label,
  LoadingSpinner,
  Select,
} from "@/components/ui/index.js";
import {
  FaEnvelope,
  FaUserPlus,
  FaArrowLeft,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function EnrollStudentForm({
  formData,
  errors = {},
  onChange,
  onSubmit,
  isLoading = false,
  compact = false,
  assessmentId = null,
  selectedAssessmentId = "",
  onSelectAssessment,
  assessments = [],
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-4" : "space-y-5"} noValidate>
      {/* Target Assessment (when in standalone mode) */}
      {!assessmentId && (
        <div>
          <Label htmlFor="enroll-assessment">Target Assessment</Label>
          <Select
            id="enroll-assessment"
            value={selectedAssessmentId}
            onChange={(e) => onSelectAssessment(e.target.value)}
            required
          >
            <option value="">-- Choose an assessment to enroll into --</option>
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} {a.is_executed ? "(Executed)" : "(Draft)"}
              </option>
            ))}
          </Select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Select which assessment this student will be enrolled in.
          </p>
        </div>
      )}

      {/* Enroll by Email */}
      <div>
        <Label htmlFor="enroll-email">Student Email Address</Label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none z-10" aria-hidden="true" />
          <Input
            id="enroll-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={onChange}
            error={Boolean(errors.email)}
            aria-describedby={errors.email ? "enroll-email-error" : undefined}
            placeholder="student@example.com"
            required
          />
        </div>
        {errors.email && (
          <p id="enroll-email-error" role="alert" className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="shrink-0" aria-hidden="true" />
            <span>{errors.email}</span>
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
              <span>Enrolling...</span>
            </>
          ) : (
            <>
              <FaUserPlus className="shrink-0" aria-hidden="true" />
              <span>Enroll Student</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
