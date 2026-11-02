/**
 * Design-system Tailwind class compositions.
 * Use these constants or matching UI primitives — no custom CSS classes.
 */

/**
 * Concentric 3-tier border radius hierarchy:
 * Tier 1: Containers, Cards, Modals (rounded-2xl / 16px)
 * Tier 2: Controls, Buttons, Inputs, Panels, Insets (rounded-xl / 12px)
 * Tier 3: Badges, Pills, Statuses, Avatars (rounded-full / 9999px)
 */
export const shape = {
  container: "rounded-2xl",
  card: "rounded-2xl",
  modal: "rounded-2xl",
  control: "rounded-xl",
  button: "rounded-xl",
  input: "rounded-xl",
  panel: "rounded-xl",
  chip: "rounded-xl",
  badge: "rounded-xl",
  pill: "rounded-xl",
  avatar: "rounded-full",
};

/**
 * Centralized status tone pairs complying with WCAG AA (>= 4.5:1 contrast)
 * in both light and dark themes.
 */
export const statusTone = {
  success:
    "border-emerald-500/20 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning:
    "border-amber-500/20 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger:
    "border-red-500/20 bg-red-500/15 text-red-700 dark:text-red-400",
  info:
    "border-indigo-500/20 bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  purple:
    "border-purple-500/20 bg-purple-500/15 text-purple-700 dark:text-purple-300",
  sky:
    "border-sky-500/20 bg-sky-500/15 text-sky-700 dark:text-sky-400",
  neutral:
    "border-border bg-btn-secondary text-muted-foreground",
};

/**
 * Platform brand gradients.
 */
export const gradient = {
  brand: "bg-gradient-to-br from-indigo-500 to-violet-600",
  primary: "bg-gradient-to-br from-indigo-500 to-violet-500",
  teal: "bg-gradient-to-br from-teal-500 to-sky-400",
  emerald: "bg-gradient-to-br from-emerald-500 to-teal-600",
  amber: "bg-gradient-to-br from-amber-500 to-orange-600",
  danger: "bg-gradient-to-br from-red-500 to-rose-600",
  surface: "bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10",
};

const fieldBase =
  "w-full rounded-xl border border-border bg-input text-sm text-foreground transition-[border-color,box-shadow] duration-200 placeholder:text-subtle-foreground hover:border-accent/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15";

export const page =
  "relative min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-indigo-100 text-foreground dark:from-brand-navy dark:via-slate-950 dark:to-indigo-950";

export const pageInner =
  "relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8";

export const pageInnerNarrow =
  "relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8";

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
  danger:
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/15 px-5 py-3 text-sm font-semibold text-red-700 transition-all duration-200 hover:bg-red-500/25 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/25 dark:text-red-400",
};

export const input = `${fieldBase} px-4 py-3 pl-11`;
export const inputPlain = `${fieldBase} px-4 py-3`;

export const inputError =
  "border-red-500/55 focus:border-red-500 focus:ring-red-500/15";

export const label = "mb-1.5 block text-sm font-medium text-muted-foreground";

export const nav =
  "sticky top-0 z-50 border-b border-border bg-nav/90 shadow-[0_1px_0_rgb(45_212_191/0.06)] backdrop-blur-xl";

export const eyebrow =
  "mb-2 inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-eyebrow";

export const eyebrowPill =
  "inline-flex items-center gap-2 rounded-xl border border-indigo-500/22 bg-indigo-500/10 px-4 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/12 dark:text-indigo-300";

export const pageTitle =
  "text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-tight tracking-tight text-foreground text-balance";

export const heroTitle =
  "text-[clamp(1.875rem,5vw,4.5rem)] font-extrabold leading-tight tracking-tight text-foreground text-balance";

export const pageDesc =
  "max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground text-pretty";

export const headingGradient =
  "inline text-indigo-700 dark:text-indigo-300 bg-gradient-to-br from-indigo-600 via-violet-600 to-teal-600 bg-clip-text [-webkit-text-fill-color:transparent] dark:from-indigo-400 dark:via-violet-400 dark:to-teal-400";

export const sectionTitle =
  "flex items-center gap-3 text-xl font-bold text-foreground text-balance";

export const iconBadge =
  "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 p-2.5 text-white shadow-lg shadow-indigo-500/45";

export const iconBadgeTeal =
  "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-400 p-2.5 text-white shadow-lg shadow-teal-500/40";

export const iconBadgeEmerald =
  "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 text-white shadow-lg shadow-emerald-500/25";

export const iconBadgeAmber =
  "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 text-white shadow-lg shadow-amber-500/25";

export const statSurface = {
  indigo:
    "rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 backdrop-blur-sm sm:p-5",
  emerald:
    "rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 backdrop-blur-sm sm:p-5",
  amber:
    "rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-4 backdrop-blur-sm sm:p-5",
  purple:
    "rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-4 backdrop-blur-sm sm:p-5",
};

export const accentPanel =
  "rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 backdrop-blur-sm";

export const emptyStateIcon =
  "mx-auto flex size-20 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 sm:size-24";

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

export const select = `${fieldBase} cursor-pointer appearance-none px-4 py-3`;

export const textarea = `${fieldBase} resize-y px-4 py-3`;

export const fileInput =
  "w-full cursor-pointer rounded-xl border border-dashed border-border bg-input px-4 py-4 text-sm text-muted-foreground transition-all duration-200 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-600 hover:border-indigo-500/50 hover:file:bg-indigo-500/25 dark:file:text-indigo-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15";

export const examBar =
  "sticky top-0 z-50 border-b border-border bg-nav/95 shadow-lg backdrop-blur-md";

export const chip =
  "inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-btn-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all duration-200 hover:border-teal-500/30 hover:text-foreground active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25 disabled:cursor-not-allowed disabled:opacity-50";

export const chipTone = {
  indigo:
    "hover:border-indigo-500/40 hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
  emerald:
    "hover:border-emerald-500/40 hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300",
  violet:
    "hover:border-violet-500/40 hover:bg-violet-500/20 hover:text-violet-700 dark:hover:text-violet-300",
  purple:
    "hover:border-purple-500/40 hover:bg-purple-500/20 hover:text-purple-700 dark:hover:text-purple-300",
  amber:
    "hover:border-amber-500/40 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300",
  sky: "hover:border-sky-500/40 hover:bg-sky-500/20 hover:text-sky-700 dark:hover:text-sky-300",
  danger:
    "border-red-500/20 bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:text-red-400",
};

export const fab =
  "fixed bottom-8 right-8 z-50 flex size-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-110 motion-reduce:transform-none motion-reduce:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25";

export const dividerLine = "border-t border-border";

export const dividerLabel =
  "relative flex justify-center text-xs font-semibold uppercase tracking-widest text-muted-foreground";

export const gridPattern =
  "bg-[linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_80%_70%_at_50%_40%,black_20%,transparent_75%)]";
