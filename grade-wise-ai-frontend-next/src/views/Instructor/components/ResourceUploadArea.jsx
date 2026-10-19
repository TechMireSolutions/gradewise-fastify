import { cn } from "@/lib/cn.js";
import { accentPanel, btn, focusRing } from "@/lib/ui.js";
import { FaUpload, FaInfoCircle, FaDatabase } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";
import { DashboardSectionCard } from "@/components/dashboard/shared/index.js";

export default function ResourceUploadArea({
  isUploading,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileInput,
}) {
  return (
    <DashboardSectionCard
      title="Upload New Resources"
      subtitle="Supported files will be automatically parsed, indexed, and vectorized for context-driven question generation."
      icon={FaUpload}
    >
      <div className="space-y-5">
        {/* Drag and Drop Area */}
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300",
            dragActive
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-border bg-card/60 hover:border-indigo-500/50 hover:bg-indigo-500/5"
          )}
        >
          <input
            type="file"
            multiple
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
            onChange={onFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            id="file-upload"
            aria-label="Upload educational resources"
          />
          <div className="pointer-events-none">
            <div
              className={cn(
                accentPanel,
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              )}
            >
              {isUploading ? (
                <LoadingSpinner size="md" color="blue" />
              ) : (
                <FaUpload
                  className={cn(
                    "text-2xl transition-colors duration-200",
                    dragActive ? "text-indigo-300" : "text-indigo-500 dark:text-indigo-400"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1 text-balance">
              {isUploading
                ? "Uploading & vectorizing files..."
                : dragActive
                ? "Drop files here"
                : "Drag and drop educational files here"}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm text-pretty">
              or click to browse your computer
            </p>
            <label
              htmlFor="file-upload"
              className={cn(
                btn.primary,
                "inline-flex items-center gap-2 px-5 py-2.5 pointer-events-auto",
                focusRing,
                isUploading && "opacity-60 cursor-wait pointer-events-none"
              )}
            >
              <FaUpload className="text-xs" aria-hidden="true" />
              <span>{isUploading ? "Processing..." : "Choose Files"}</span>
            </label>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
          <div className="flex gap-3 items-start">
            <FaInfoCircle className="text-indigo-500 dark:text-indigo-400 text-base mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                Supported Formats & Chunking
              </p>
              <p className="text-sm text-muted-foreground text-pretty">
                PDF, DOC, DOCX, TXT, PPT, PPTX, JPG, PNG (Max: 10MB each)
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <FaDatabase className="text-indigo-500" aria-hidden="true" />
                Documents are automatically parsed and indexed for context-driven question generation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardSectionCard>
  );
}
