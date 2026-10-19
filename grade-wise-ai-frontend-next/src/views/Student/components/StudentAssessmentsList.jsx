import { FaBook } from "react-icons/fa";
import {
  DashboardSectionCard,
  CardListSkeleton,
} from "@/components/dashboard/shared/index.js";
import StudentAssessmentCard from "./StudentAssessmentCard.jsx";

export default function StudentAssessmentsList({
  assessments = [],
  loading = false,
}) {
  return (
    <DashboardSectionCard
      title="Available Assessments"
      icon={FaBook}
    >
      {loading ? (
        <CardListSkeleton count={3} />
      ) : assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <StudentAssessmentCard
              key={assessment.id}
              assessment={assessment}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
            <FaBook className="w-8 h-8" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1 text-balance">
            No assessments yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm text-pretty">
            You don&apos;t have any assessments assigned at this time. Check back later or contact your instructor.
          </p>
        </div>
      )}
    </DashboardSectionCard>
  );
}
