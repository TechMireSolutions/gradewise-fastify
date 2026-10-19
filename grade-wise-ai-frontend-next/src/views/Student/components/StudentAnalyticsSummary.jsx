import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";
import { FaChartBar, FaClock, FaCheckCircle, FaFilePdf } from "react-icons/fa";
import {
  DashboardSectionCard,
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/shared/index.js";

function formatTime(seconds) {
  const secs = parseInt(seconds, 10);
  if (isNaN(secs) || secs <= 0) return "0m 0s";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

export default function StudentAnalyticsSummary({
  liveDetails,
  onDownloadReport,
  downloadLoading = false,
}) {
  if (!liveDetails) return null;

  const rawScore =
    liveDetails.scorePercentage !== undefined
      ? liveDetails.scorePercentage
      : liveDetails.score !== undefined
      ? liveDetails.score
      : 0;
  const resScore = parseFloat(rawScore);

  let calculatedSeconds = 0;
  if (liveDetails.startedAt && liveDetails.completedAt) {
    const start = new Date(liveDetails.startedAt).getTime();
    const end = new Date(liveDetails.completedAt).getTime();
    if (!isNaN(start) && !isNaN(end) && end > start) {
      calculatedSeconds = Math.floor((end - start) / 1000);
    }
  }

  const resCorrect =
    liveDetails.correctAnswersCount !== undefined
      ? liveDetails.correctAnswersCount
      : liveDetails.correct_answers !== undefined
      ? liveDetails.correct_answers
      : 0;

  const resTotal =
    liveDetails.totalQuestionsCount !== undefined
      ? liveDetails.totalQuestionsCount
      : liveDetails.total_questions !== undefined
      ? liveDetails.total_questions
      : 5;

  const resTitle =
    liveDetails.title || liveDetails.assessmentTitle || "Assessment Summary";

  return (
    <div className="mt-10 max-w-5xl mx-auto space-y-6">
      <DashboardSectionCard
        title={resTitle}
        subtitle="Detailed Performance Summary"
        icon={FaChartBar}
        actions={
          <button
            type="button"
            onClick={onDownloadReport}
            disabled={downloadLoading}
            className={cn(btn.primary, "px-4 py-2 text-xs min-h-[38px] inline-flex items-center gap-2")}
          >
            <FaFilePdf aria-hidden="true" />
            <span>{downloadLoading ? "Generating PDF..." : "Download Report"}</span>
          </button>
        }
      >
        <DashboardStatGrid columns={3} className="mb-0">
          <DashboardStatCard
            label="Score"
            value={`${resScore}%`}
            icon={FaChartBar}
            tone="emerald"
          />
          <DashboardStatCard
            label="Time Taken"
            value={formatTime(calculatedSeconds)}
            icon={FaClock}
            tone="indigo"
          />
          <DashboardStatCard
            label="Correct Answers"
            value={`${resCorrect} / ${resTotal}`}
            icon={FaCheckCircle}
            tone="amber"
          />
        </DashboardStatGrid>
      </DashboardSectionCard>
    </div>
  );
}
