"use client";

import { FaFileAlt } from "react-icons/fa";

export default function AssessmentResourcesDisplay({ resources = [] }) {
  if (!resources || resources.length === 0) return null;

  return (
    <>
      <div className="border-t border-border" />
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            <FaFileAlt className="text-white text-sm" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Attached Resources</h3>
        </div>
        <div className="space-y-3">
          {resources.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-input rounded-xl border border-border p-4 hover:border-amber-500/30 transition-all duration-200"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex-shrink-0">
                <FaFileAlt className="text-amber-500 dark:text-amber-400 text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">
                  {r.name || r.title || r.filename || "Resource"}
                </p>
                {r.file_type && (
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {r.file_type}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
