import { cn } from "@/lib/cn.js";
import {
  chip,
  chipTone,
  focusRing,
  tableHead,
  tableRowHover,
} from "@/lib/ui.js";
import StatusBadge from "@/components/ui/StatusBadge.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import {
  DashboardSectionCard,
  TableSkeleton,
} from "@/components/dashboard/shared/index.js";
import {
  FaBook,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileAlt,
  FaImage,
  FaFolder,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import { formatDate } from "@/utils/formatDate.js";

function getFileIcon(fileName, fileType) {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "";
  const type = (fileType || "").toLowerCase();

  if (ext === "pdf" || type.includes("pdf")) {
    return <FaFilePdf className="text-red-500 text-lg shrink-0" aria-hidden="true" />;
  }
  if (["doc", "docx"].includes(ext) || type.includes("word") || type.includes("officedocument")) {
    return <FaFileWord className="text-blue-500 text-lg shrink-0" aria-hidden="true" />;
  }
  if (["ppt", "pptx"].includes(ext) || type.includes("presentation")) {
    return <FaFilePowerpoint className="text-orange-500 text-lg shrink-0" aria-hidden="true" />;
  }
  if (["jpg", "jpeg", "png", "webp"].includes(ext) || type.includes("image")) {
    return <FaImage className="text-emerald-500 text-lg shrink-0" aria-hidden="true" />;
  }
  return <FaFileAlt className="text-indigo-500 dark:text-indigo-400 text-lg shrink-0" aria-hidden="true" />;
}

export default function ResourceList({
  resources = [],
  loading = false,
  onOpenDelete,
}) {
  return (
    <DashboardSectionCard
      title="Existing Resources"
      icon={FaBook}
      actions={
        <StatusBadge variant="info">
          {resources.length} {resources.length === 1 ? "Resource" : "Resources"}
        </StatusBadge>
      }
    >
      {loading ? (
        <TableSkeleton rows={4} />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={FaFolder}
          title="No resources yet"
          description="Upload your first resource to build your course library for AI assessment generation."
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden rounded-xl border border-border">
            <table className="min-w-full">
              <thead className={tableHead}>
                <tr>
                  <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Resource Name
                  </th>
                  <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Uploaded Date
                  </th>
                  <th className="px-6 py-3.5 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card/40">
                {resources.map((resource) => (
                  <tr
                    key={resource.id}
                    className={cn(tableRowHover, "transition-colors duration-150")}
                  >
                    <td className="px-6 py-4 text-sm text-secondary-foreground font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20 shrink-0">
                          {getFileIcon(resource.name || resource.title, resource.fileType || resource.contentType)}
                        </div>
                        <span className="truncate max-w-sm">{resource.name || resource.title || "Untitled Document"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <StatusBadge variant="neutral">
                        {(resource.fileType || resource.contentType || "document").toUpperCase()}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
                        <span>{formatDate(resource.createdAt || resource.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-end">
                      <button
                        type="button"
                        onClick={() => onOpenDelete(resource)}
                        className={cn(chip, chipTone.danger, focusRing)}
                        aria-label={`Delete ${resource.name || resource.title || "resource"}`}
                      >
                        <FaTrash className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden space-y-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 140px" }}
                className="bg-card rounded-xl border border-border p-4 sm:p-5 hover:border-indigo-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20 shrink-0">
                      {getFileIcon(resource.name || resource.title, resource.fileType || resource.contentType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 break-words">
                        {resource.name || resource.title || "Untitled Document"}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FaCalendarAlt className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <span>{formatDate(resource.createdAt || resource.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge variant="neutral" className="shrink-0">
                    {(resource.fileType || resource.contentType || "doc").toUpperCase()}
                  </StatusBadge>
                </div>

                <div className="pt-2 border-t border-border/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenDelete(resource)}
                    className={cn(chip, chipTone.danger, "min-h-11 justify-center w-full sm:w-auto", focusRing)}
                    aria-label={`Delete ${resource.name || resource.title || "resource"}`}
                  >
                    <FaTrash className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Delete Resource</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardSectionCard>
  );
}
