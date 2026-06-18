import { FaFileAlt, FaCopy, FaCheckCircle } from "react-icons/fa";
import { generateAIPrompt } from "../utils/promptGenerator";

function PromptTab({ assessment, copied, onCopy }) {
  const promptText = generateAIPrompt(assessment);

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <FaFileAlt className="text-white text-sm" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Exact Prompt Sent to AI Model</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            This is the <strong className="text-indigo-400 font-semibold">100% identical prompt</strong> used by Gradewise-AI.<br className="hidden sm:block" />
            Copy and paste it into ChatGPT, Gemini, Grok, or Claude —{" "}
            <strong className="text-emerald-400 font-semibold">same result guaranteed</strong>.
          </p>
        </div>
        <button
          onClick={onCopy}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 active:scale-95 w-full sm:w-auto flex-shrink-0 cursor-pointer ${
            copied
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50"
              : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50"
          }`}
        >
          {copied ? (
            <>
              <FaCheckCircle />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <FaCopy />
              <span>Copy Full Prompt</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">AI Prompt</span>
          <div className="w-16" />
        </div>
        <div className="p-4 sm:p-6 lg:p-7 overflow-hidden">
          <pre className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-emerald-400 font-mono overflow-x-auto">
            {promptText}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default PromptTab;
