import { cn } from "@/lib/cn.js";
import { FaFileAlt, FaLanguage, FaCopy } from "react-icons/fa";
import React from "react";
import { generateAIPrompt } from "../utils/promptGenerator.js";

export default function PromptTab({ assessment, aiPrompt, aiPromptLoading, copied, onCopy }) {
  const fallbackPrompt = React.useMemo(() => {
    return assessment ? generateAIPrompt(assessment) : "";
  }, [assessment]);

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
      ) : aiPrompt?.unifiedPrompt ? (
        <div className="space-y-4">
          <p className={cn("text-xs text-muted-foreground")}>
            The unified execution prompt sent to the AI for generating the complete assignment (instructions, question items, marks distribution, and answer key):
          </p>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-3.5 py-2.5 bg-input text-xs font-semibold text-secondary-foreground flex items-center justify-between border-b border-border">
              <span>Unified Assignment Generation Prompt</span>
              <span className="text-muted-foreground font-mono text-[11px]">Single Pipeline Execution</span>
            </div>
            <pre className="whitespace-pre-wrap text-xs text-muted-foreground p-3.5 bg-muted max-h-[500px] overflow-y-auto font-mono leading-relaxed">
              {aiPrompt.unifiedPrompt}
            </pre>
          </div>
          {aiPrompt.blocks?.length > 0 && (
            <details className="rounded-lg border border-border/60 overflow-hidden text-xs">
              <summary className="px-3 py-2 bg-input/50 cursor-pointer text-muted-foreground hover:text-foreground">
                View Section Breakdown ({aiPrompt.blocks.length} sections)
              </summary>
              <div className="p-3 space-y-3 bg-muted/50">
                {aiPrompt.blocks.map((block, i) => (
                  <div key={block.id ?? i} className="p-2 border border-border/40 rounded bg-background/50">
                    <p className="font-semibold text-secondary-foreground mb-1">
                      Section {i + 1} — {block.questionType.replace(/_/g, " ")} × {block.questionCount} questions
                    </p>
                    <pre className="whitespace-pre-wrap text-[11px] text-muted-foreground max-h-40 overflow-y-auto">
                      {block.prompt}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : aiPrompt?.blocks?.length > 0 ? (
        <div className="space-y-4">
          <p className={cn("text-xs text-muted-foreground")}>
            The prompt the system sends to the AI for each question block, with the full reference material from your linked documents and links:
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
            Showing unified preview based on assessment configuration (live prompt blueprint):
          </p>
          <pre className="whitespace-pre-wrap text-xs font-mono text-muted-foreground p-3.5 bg-muted rounded border border-border max-h-96 overflow-y-auto">
            {fallbackPrompt || assessment?.prompt || "No prompt generated yet."}
          </pre>
        </>
      )}
    </div>
  );
}
