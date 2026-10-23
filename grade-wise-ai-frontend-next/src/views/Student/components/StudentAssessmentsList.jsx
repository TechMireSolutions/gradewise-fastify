import { FaBook } from "react-icons/fa";
import {
  DashboardSectionCard,
  CardListSkeleton,
} from "@/components/dashboard/shared/index.js";
import EmptyState from "@/components/ui/EmptyState.jsx";
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
        <EmptyState
          icon={FaBook}
          title="No assessments yet"
          description="You don't have any assessments assigned at this time. Check back later or contact your instructor."
          className="shadow-none border-0 bg-transparent py-12"
        />
      )}
    </DashboardSectionCard>
  );
}
