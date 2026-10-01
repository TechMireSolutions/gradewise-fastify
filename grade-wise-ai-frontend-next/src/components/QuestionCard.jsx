import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
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
      className={cn(card, "p-4", "sm:p-6", "shadow-2xl", "hover:border-indigo-500/30", "transition-all", "duration-200", "animate-slideInUp")}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="min-w-0">
        <p dir="auto" className="text-base sm:text-lg font-semibold text-foreground mb-4 break-words leading-relaxed">
          {displayText(question.question_text)}
        </p>

        {/* Options Display */}
        {question.question_type === "true_false" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-input rounded-xl border border-border hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-150 cursor-pointer">
              <div className={cn("w-8", "h-8", "border-2", "border-slate-600", "rounded-full", "flex", "items-center", "justify-center", "font-semibold", "text-secondary-foreground", "flex-shrink-0")}>
                T
              </div>
              <span className={cn("text-secondary-foreground", "font-medium")}>True</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-input rounded-xl border border-border hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-150 cursor-pointer">
              <div className={cn("w-8", "h-8", "border-2", "border-slate-600", "rounded-full", "flex", "items-center", "justify-center", "font-semibold", "text-secondary-foreground", "flex-shrink-0")}>
                F
              </div>
              <span className={cn("text-secondary-foreground", "font-medium")}>False</span>
            </div>
          </div>
        ) : question.options ? (
          <div className="space-y-2">
            {Object.entries(question.options).map(([key, text]) => (
              <div
                key={key}
                className="flex items-center gap-3 p-3 bg-input rounded-xl border border-border hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-150 cursor-pointer"
              >
                <div className={cn("w-8", "h-8", "border-2", "border-slate-600", "rounded-full", "flex", "items-center", "justify-center", "font-semibold", "text-secondary-foreground", "flex-shrink-0")}>
                  {key}
                </div>
                <span dir="auto" className={cn("text-secondary-foreground", "break-words")}>{displayText(text)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default QuestionCard;
