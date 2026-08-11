import { cn } from "@/lib/cn.js";
import { FaFileAlt } from "react-icons/fa";
import React from "react";

export default function PromptTab({ assessment }) {
  // Safe layout placeholder check to keep logic intact
  return (
    <div className={cn("p-4 rounded-lg bg-background text-foreground")}>
      <div className="flex items-center gap-2 mb-4">
        <FaFileAlt className="text-white text-sm" />
        <h3 className="text-lg font-semibold">AI Prompt Blueprint</h3>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-muted-foreground p-3 bg-muted rounded">
        {assessment?.prompt || "No prompt generated yet."}
      </pre>
    </div>
  );
}
