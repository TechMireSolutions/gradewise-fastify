import { cn } from "@/lib/cn.js";
import { btn, card, eyebrowPill, headingGradient, page, pageDesc } from "@/lib/ui.js";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import Link from "next/link";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";

export default function NotFound() {
  return (
    <div className={cn(page, "relative", "flex", "min-h-screen", "flex-col", "items-center", "justify-center", "px-4", "text-center")}>
      <AmbientBackground />
      <MainLandmark className={cn("relative", "z-10", card, "max-w-md", "p-10", "shadow-2xl")}>
        <p className={cn(eyebrowPill, "mb-6")}>Page not found</p>
        <h1 className={cn("text-6xl", "font-bold", headingGradient, "mb-2")}>404</h1>
        <p className={cn(pageDesc, "mx-auto", "mb-8")}>This page could not be found. It may have moved or no longer exists.</p>
        <Link href="/" className={cn(btn.primary)}>
          Back to home
        </Link>
      </MainLandmark>
    </div>
  );
}
