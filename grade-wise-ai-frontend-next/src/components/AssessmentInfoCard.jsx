import { FaFileAlt } from "react-icons/fa";

function AssessmentInfoCard({ assessment }) {
  const totalQuestions = assessment.question_blocks?.reduce((sum, b) => sum + (b.question_count || 0), 0) || 0;
  const resourceCount = assessment.resources?.length || 0;

  return (
    <div className="mb-6 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl hover:border-indigo-500/30 transition-all duration-200 p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex-shrink-0">
          <FaFileAlt className="text-white text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">
            {assessment.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              {totalQuestions} Questions
            </span>
            {resourceCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/40">
                {resourceCount} Resources
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentInfoCard;
