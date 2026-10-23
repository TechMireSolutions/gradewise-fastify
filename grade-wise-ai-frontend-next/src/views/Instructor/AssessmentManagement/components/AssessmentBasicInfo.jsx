"use client";

import { cn } from "@/lib/cn.js";
import { iconBadge } from "@/lib/ui.js";
import { FaInfoCircle, FaCalendarAlt, FaLink } from "react-icons/fa";

export default function AssessmentBasicInfo({ assessment }) {
  if (!assessment) return null;

  return (
    <>
      {/* Basic Info */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className={cn("p-2.5 rounded-xl", iconBadge)}>
            <FaInfoCircle className="text-white text-sm" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-input rounded-xl border border-border p-4 sm:p-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Title
            </span>
            <p className="mt-2 font-semibold text-foreground text-base">
              {assessment.title}
            </p>
          </div>
          {assessment.prompt && (
            <div className="bg-input rounded-xl border border-border p-4 sm:p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Prompt / Directives
              </span>
              <p className="mt-2 text-secondary-foreground leading-relaxed">
                {assessment.prompt}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Dates */}
      <div className="border-t border-border" />
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <FaCalendarAlt className="text-white text-sm" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-input rounded-xl border border-border p-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Created
            </span>
            <p className="mt-1 text-foreground font-medium text-sm">
              {new Date(assessment.created_at).toLocaleString()}
            </p>
          </div>
          <div className="bg-input rounded-xl border border-border p-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Last Updated
            </span>
            <p className="mt-1 text-foreground font-medium text-sm">
              {assessment.updated_at
                ? new Date(assessment.updated_at).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* External Links */}
      {assessment.external_links?.length > 0 && (
        <>
          <div className="border-t border-border" />
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                <FaLink className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">External Links</h3>
            </div>
            <div className="space-y-3">
              {assessment.external_links.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-input border border-border hover:border-indigo-500/30 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/20 flex-shrink-0">
                    <FaLink className="text-violet-500 dark:text-violet-400 text-sm" />
                  </div>
                  <span className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm break-all flex-1 transition-colors">
                    {link}
                  </span>
                  <span className="text-muted-foreground text-sm">→</span>
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
