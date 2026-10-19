/**
 * Student Assessments Service (Facade)
 * Re-exports student attempt lifecycle, answer evaluation, and submission review services.
 */

export {
  startAssessmentService,
  getAssessmentGenerationStatusService,
  submitAssessmentService,
} from "./student-attempts.service.js";

export {
  getSubmissionDetailsService,
} from "./student-submissions.service.js";

export {
  evaluateAnswer,
  normalizeMatchPairs,
} from "./student-evaluation.service.js";