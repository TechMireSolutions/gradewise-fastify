/** Merge class names (truthy values only). */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
