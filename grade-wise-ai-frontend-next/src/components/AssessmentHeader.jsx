import { cn } from "@/lib/cn.js";
import { card, cardInteractive } from "@/lib/ui.js";
import Link from "next/link";
import { FaEye, FaEdit } from "react-icons/fa";

function AssessmentHeader({ assessmentId }) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className={cn(card, cardInteractive, "shadow-2xl")}>
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                  <FaEye className="text-white text-lg" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                  Assessment Preview
                </h1>
              </div>
              <p className={cn("text-muted-foreground", "text-sm", "sm:text-base", "leading-relaxed")}>
                See exactly how the AI will interpret your setup and what students will experience
              </p>
            </div>
            <Link
              href={`/instructor/assessments/${assessmentId}/edit`}
              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <FaEdit className="text-base" />
              <span>Edit Assessment</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentHeader;
