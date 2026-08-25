import { cn } from "@/lib/cn.js";
import { FaFileAlt, FaLanguage, FaCopy } from "react-icons/fa";
import React from "react";

export default function PromptTab({ assessment, aiPrompt, aiPromptLoading, copied, onCopy }) {
  return (
    <div className={cn("p-4 rounded-lg bg-background text-foreground")}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FaFileAlt className="text-white text-sm" />
        <h3 className="text-lg font-semibold">AI Prompt Blueprint</h3>
        {aiPrompt?.languageLabel && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <FaLanguage /> Questions in {aiPrompt.languageLabel}
          </span>
        )}
        <button
          type="button"
          onClick={onCopy}
          disabled={!assessment}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-btn-secondary hover:bg-indigo-500/20 border border-border hover:border-indigo-500/40 text-secondary-foreground hover:text-indigo-300 rounded-lg font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaCopy /> {copied ? "Copied!" : "Copy Full Prompt"}
        </button>
      </div>

      {aiPromptLoading ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-sm text-muted-foreground">Building AI prompt...</span>
        </div>
      ) : aiPrompt?.blocks?.length > 0 ? (
        <div className="space-y-4">
          <p className={cn("text-xs text-muted-foreground")}>
            This is the exact prompt the system sends to the AI for each question block:
          </p>
          {aiPrompt.blocks.map((block, i) => (
            <details key={block.id ?? i} open={aiPrompt.blocks.length === 1} className="rounded-lg border border-border overflow-hidden">
              <summary className="px-3 py-2.5 bg-input cursor-pointer text-sm font-semibold text-secondary-foreground">
                Block {i + 1} — {block.questionType.replace(/_/g, " ")} × {block.questionCount} questions
              </summary>
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground p-3 bg-muted max-h-96 overflow-y-auto">
                {block.prompt}
              </pre>
            </details>
          ))}
        </div>
      ) : (
        <>
          <p className={cn("text-xs text-muted-foreground mb-2")}>
            Showing a preview based on assessment details (live prompt unavailable):
          </p>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground p-3 bg-muted rounded max-h-96 overflow-y-auto">
            {assessment?.prompt || "No prompt generated yet."}
          </pre>
        </>
      )}
    </div>
  );
}
