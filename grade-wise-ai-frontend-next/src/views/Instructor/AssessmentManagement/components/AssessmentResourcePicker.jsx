"use client";

import { cn } from "@/lib/cn.js";
import { card, iconBadge, focusRing } from "@/lib/ui.js";
import { Label, LoadingSpinner } from "@/components/ui";
import { FiBook, FiCheck, FiUploadCloud, FiFile } from "react-icons/fi";

export default function AssessmentResourcePicker({
  resources = [],
  selectedResources = [],
  onToggleResource,
  loading = false,
  allowUpload = false,
  newFiles = [],
  onFileChange,
  disabled = false,
}) {
  return (
    <div className={cn(card, "shadow-2xl overflow-hidden")}>
      <div className="px-6 py-4 border-b border-border bg-input flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", iconBadge)}>
            <FiBook className="text-white text-base" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Course Resources</h2>
            <p className="text-xs text-muted-foreground">
              Select verified course materials for the AI to extract assessment content from
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-semibold self-start sm:self-auto">
          {selectedResources.length} {selectedResources.length === 1 ? "Resource" : "Resources"} Selected
        </span>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3 text-sm text-muted-foreground">
            <LoadingSpinner size="sm" type="spinner" color="blue" />
            Loading course resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
            <FiBook className="mx-auto text-3xl text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold text-foreground">No resources uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              You can still generate questions using a prompt or external URLs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
            {resources.map((resource) => {
              const isSelected = selectedResources.includes(resource.id);
              return (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => onToggleResource(resource.id)}
                  disabled={disabled}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-xl border text-start transition-all duration-150 active:scale-[0.99]",
                    isSelected
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 shadow-sm"
                      : "border-border bg-input/40 hover:bg-surface-elevated text-secondary-foreground",
                    focusRing
                  )}
                  aria-pressed={isSelected}
                >
                  <div
                    className={cn(
                      "mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0",
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-border bg-card"
                    )}
                  >
                    {isSelected && <FiCheck className="text-xs" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {resource.title || resource.filename || "Untitled Resource"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {resource.file_type || resource.type || "Document"}
                      {resource.created_at && (
                        <span> · {new Date(resource.created_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Optional upload new files section */}
        {allowUpload && (
          <div className="pt-4 border-t border-border/60">
            <Label htmlFor="resource-files">Upload Additional Materials (Optional)</Label>
            <div className="mt-2 flex items-center gap-3">
              <label
                htmlFor="resource-files"
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-sm font-semibold cursor-pointer transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <FiUploadCloud className="text-base" />
                <span>Choose Files (PDF, DOCX, TXT)</span>
                <input
                  id="resource-files"
                  type="file"
                  multiple
                  onChange={onFileChange}
                  disabled={disabled}
                  className="sr-only"
                  accept=".pdf,.docx,.txt"
                />
              </label>

              {newFiles.length > 0 && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <FiFile /> {newFiles.length} new file(s) staged for upload
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
