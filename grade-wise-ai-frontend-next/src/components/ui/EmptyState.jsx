export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 ${compact ? "py-16" : "py-28"}`}
      role="status"
    >
      {Icon && (
        <div
          className="mb-6 flex size-20 items-center justify-center rounded-2xl border border-border bg-surface-elevated"
          aria-hidden="true"
        >
          <Icon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{title}</h3>
      {description && (
        <p className={cn("text-muted-foreground", "max-w-sm", "mb-6", "leading-relaxed")}>{description}</p>
      )}
      {action}
    </div>
  );
}
