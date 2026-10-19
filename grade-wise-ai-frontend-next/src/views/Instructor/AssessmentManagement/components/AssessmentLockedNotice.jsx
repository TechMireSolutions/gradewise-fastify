"use client";

import { cn } from "@/lib/cn.js";
import { btn, card, focusRing, page } from "@/lib/ui.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaLock, FaCopy, FaChartBar, FaArrowLeft } from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";

export default function AssessmentLockedNotice({
  assessment,
  isCloning,
  onClone,
}) {
  const router = useRouter();

  return (
    <div className={page}>
      <AmbientBackground />
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={cn(card, "shadow-2xl p-8 text-center")}>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-6 mx-auto">
            <FaLock className="text-amber-500 dark:text-amber-400 text-3xl" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-balance">
            Assessment is Locked
          </h1>
          <p className="text-muted-foreground mb-8 text-pretty leading-relaxed">
            <strong className="text-foreground">{assessment?.title}</strong> has already been attempted by students. Under platform assessment integrity rules, active or executed assessments cannot be edited.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClone}
              disabled={isCloning}
              className={cn(
                btn.primary,
                focusRing,
                "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
              )}
            >
              <FaCopy aria-hidden="true" />
              <span>{isCloning ? "Cloning..." : "Clone as New Assessment"}</span>
            </button>
            <Link
              href={`/instructor/assessments/${assessment?.id}/analytics`}
              className={cn(btn.secondary, focusRing)}
            >
              <FaChartBar aria-hidden="true" />
              <span>View Student Analytics</span>
            </Link>
            <Link
              href={`/instructor/assessments/${assessment?.id}`}
              className={cn(btn.secondary, focusRing)}
            >
              <span>View Details</span>
            </Link>
            <button
              type="button"
              onClick={() => router.push("/instructor/assessments")}
              className={cn(btn.secondary, focusRing)}
            >
              <FaArrowLeft aria-hidden="true" />
              <span>Back to Assessments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
