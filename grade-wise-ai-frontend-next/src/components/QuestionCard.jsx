// Question fields (text / options) may arrive as plain strings or as objects
// (e.g. { text, is_correct }). Coerce any value into something React can render
// so the view never crashes on unexpected AI output.
function displayText(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const candidate =
      value.text ?? value.label ?? value.value ?? value.option ?? value.answer ?? value.content;
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
    const firstPrimitive = Object.values(value).find(
      (v) => typeof v === "string" || typeof v === "number"
    );
    if (firstPrimitive != null) return String(firstPrimitive);
    return JSON.stringify(value);
  }
  return String(value);
}

function QuestionCard({ question, index }) {
  return (
    <div
      className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl hover:border-indigo-500/30 transition-all duration-200 animate-slideInUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-indigo-500/25">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg font-semibold text-slate-200 mb-4 break-words leading-relaxed">
            {displayText(question.question_text)}
          </p>

          {/* Options Display */}
          {question.question_type === "true_false" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/40 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-150 cursor-pointer">
                <div className="w-8 h-8 border-2 border-slate-600 rounded-full flex items-center justify-center font-semibold text-slate-300 flex-shrink-0">
                  T
                </div>
                <span className="text-slate-300 font-medium">True</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/40 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-150 cursor-pointer">
                <div className="w-8 h-8 border-2 border-slate-600 rounded-full flex items-center justify-center font-semibold text-slate-300 flex-shrink-0">
                  F
                </div>
                <span className="text-slate-300 font-medium">False</span>
              </div>
            </div>
          ) : question.options ? (
            <div className="space-y-2">
              {Object.entries(question.options).map(([key, text]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/40 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-150 cursor-pointer"
                >
                  <div className="w-8 h-8 border-2 border-slate-600 rounded-full flex items-center justify-center font-semibold text-slate-300 flex-shrink-0">
                    {key}
                  </div>
                  <span className="text-slate-300 break-words">{displayText(text)}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              {(question.question_type ?? "question").replace("_", " ")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              +{question.positive_marks} marks
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
              -{question.negative_marks} marks
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 border border-slate-600/40">
              {question.duration_per_question}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;
