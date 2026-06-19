import { cn } from "@/lib/cn.js";
import { gridPattern } from "@/lib/ui.js";

export default function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className={cn(gridPattern, "absolute inset-0")} />
      <div className="absolute -top-40 -right-40 size-96 animate-blob rounded-full bg-[var(--blob-teal)] blur-3xl" />
      <div className="animation-delay-2000 absolute top-1/3 -left-32 size-80 animate-blob rounded-full bg-[var(--blob-indigo)] blur-3xl" />
      <div className="animation-delay-4000 absolute -bottom-32 right-1/4 size-72 animate-blob rounded-full bg-[var(--blob-sky)] blur-3xl" />
      <div className="absolute top-1/2 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--blob-indigo)] blur-3xl" />
    </div>
  );
}
