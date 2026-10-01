import { cn } from "@/lib/cn.js";
import { card, cardInteractive } from "@/lib/ui.js";
import { FaFileAlt } from "react-icons/fa";

function AssessmentInfoCard({ assessment }) {
  const totalQuestions = assessment.question_blocks?.reduce((sum, b) => sum + (b.question_count || 0), 0) || 0;
  const resourceCount = assessment.resources?.length || 0;

  return (
    <div className={cn("mb-6", card, cardInteractive, "shadow-2xl", "p-4", "sm:p-6")}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex-shrink-0">
          <FaFileAlt className="text-foreground text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 break-words">
            {assessment.title}
          </h2>
          {assessment.prompt && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {assessment.prompt}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentInfoCard;
