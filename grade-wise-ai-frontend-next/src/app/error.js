"use client";

import { cn } from "@/lib/cn.js";
import { btn, card, eyebrow, page, pageDesc, pageTitle } from "@/lib/ui.js";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import Link from "next/link";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";

export default function Error({ error, reset }) {
  return (
    <div className={cn(page, "flex", "min-h-screen", "flex-col", "items-center", "justify-center", "px-4", "text-center")}>
      <AmbientBackground />
      <MainLandmark className={cn("relative", "z-10", card, "max-w-md", "p-8", "shadow-2xl")}>
        <p className={cn(eyebrow, "mb-2")}>Something went wrong</p>
        <h1 className={cn(pageTitle, "mb-3")}>We hit a snag</h1>
        <p className={cn(pageDesc, "mx-auto", "mb-6")}>{error?.message ?? "An unexpected error occurred."}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={() => reset()} className={cn(btn.primary)}>
            Try again
          </button>
          <Link href="/" className={cn(btn.secondary)}>
            Go home
          </Link>
        </div>
      </MainLandmark>
    </div>
  );
}
