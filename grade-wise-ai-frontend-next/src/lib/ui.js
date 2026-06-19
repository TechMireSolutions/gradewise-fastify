/**
 * Design-system Tailwind class compositions.
 * Use these constants or the matching UI primitives — no custom CSS classes.
 */

export const page =
  "relative min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-indigo-100 text-foreground dark:from-[#0a0f1e] dark:via-slate-950 dark:to-indigo-950";

export const pageInner =
  "relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8";

export const card =
  "rounded-2xl border border-border bg-card/80 text-foreground shadow-lg shadow-indigo-500/10 backdrop-blur-md dark:shadow-black/25 [box-shadow:0_4px_24px_-6px_var(--shadow-accent),inset_0_1px_0_rgb(255_255_255/0.06)]";

export const cardInteractive =
  "transition-[border-color,box-shadow,transform] duration-200 hover:border-teal-500/30 hover:shadow-xl hover:[box-shadow:0_8px_32px_-8px_rgb(45_212_191/0.15),inset_0_1px_0_rgb(255_255_255/0.08)]";

export const cardHeader =
  "rounded-t-2xl border-b border-border bg-card-header px-6 py-4 text-foreground";

export const cardGlow =
  "relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/6 before:via-teal-500/4 before:to-transparent";

export const btn = {
  primary:
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white no-underline shadow-lg shadow-indigo-500/45 transition-all duration-200 hover:brightness-110 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25",
  secondary:
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-btn-secondary px-5 py-3 text-sm font-medium text-secondary-foreground no-underline transition-all duration-200 hover:border-teal-500/30 hover:text-foreground active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25",
  google:
    "flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border bg-input px-4 py-3 text-sm font-medium text-secondary-foreground transition-all duration-200 hover:border-teal-500/30 hover:text-foreground active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25 disabled:cursor-not-allowed disabled:opacity-50",
  success:
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:brightness-110 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25",
};

export const input =
  "w-full rounded-xl border border-border bg-input px-4 py-3 pl-11 text-sm text-foreground transition-[border-color,box-shadow] duration-200 placeholder:text-subtle-foreground hover:border-slate-400/55 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 dark:hover:border-slate-600/55";

export const inputError =
  "border-red-500/55 focus:border-red-500 focus:ring-red-500/15";

export const label = "mb-1.5 block text-sm font-medium text-muted-foreground";

export const nav =
  "sticky top-0 z-50 border-b border-border bg-nav/90 shadow-[0_1px_0_rgb(45_212_191/0.06)] backdrop-blur-xl";

export const eyebrow =
  "mb-2 inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-eyebrow";

export const eyebrowPill =
  "inline-flex items-center gap-2 rounded-full border border-indigo-500/22 bg-indigo-500/10 px-4 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/12 dark:text-indigo-300";

export const pageTitle =
  "text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-tight tracking-tight text-foreground";

export const heroTitle =
  "text-[clamp(1.875rem,5vw,4.5rem)] font-extrabold leading-tight tracking-tight text-foreground";

export const pageDesc =
  "max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground";

export const headingGradient =
  "inline text-indigo-700 dark:text-indigo-300 bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-600 bg-clip-text [-webkit-text-fill-color:transparent] dark:from-indigo-400 dark:via-violet-400 dark:to-teal-400";

export const sectionTitle =
  "flex items-center gap-3 text-xl font-bold text-foreground";

export const iconBadge =
  "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 p-2.5 text-white shadow-lg shadow-indigo-500/45";

export const iconBadgeTeal =
  "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-400 p-2.5 text-white shadow-lg shadow-teal-500/40";

export const tableHead = "bg-card-header [&_th]:border-b [&_th]:border-border";

export const tableRowHover =
  "transition-colors duration-150 hover:bg-indigo-500/5";

export const statCard =
  "rounded-2xl border border-border p-5 text-foreground shadow-lg shadow-black/5 dark:shadow-black/20";

export const skipLink =
  "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const panel =
  "rounded-xl border border-border bg-card/60 p-4 sm:p-5";

export const select =
  "w-full cursor-pointer appearance-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground transition-all duration-200 hover:border-slate-400/55 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 dark:hover:border-slate-600/55";

export const textarea =
  "w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-subtle-foreground transition-all duration-200 hover:border-slate-400/55 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 dark:hover:border-slate-600/55";

export const examBar =
  "sticky top-0 z-50 border-b border-border bg-nav/95 shadow-lg backdrop-blur-md";

export const chip =
  "inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border bg-btn-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all duration-200 hover:border-teal-500/30 hover:text-foreground active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25 disabled:cursor-not-allowed disabled:opacity-50";

export const dividerLine = "border-t border-border";

export const dividerLabel =
  "relative flex justify-center text-xs font-semibold uppercase tracking-widest text-muted-foreground";

export const gridPattern =
  "bg-[linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_80%_70%_at_50%_40%,black_20%,transparent_75%)]";
