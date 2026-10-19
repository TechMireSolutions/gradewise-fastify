import { cn } from "@/lib/cn.js";

const columnMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

export default function DashboardStatGrid({ children, columns = 4, className }) {
  const colClass = columnMap[columns] || columnMap[4];
  return (
    <div className={cn("grid gap-4 sm:gap-6 mb-8 sm:mb-10", colClass, className)}>
      {children}
    </div>
  );
}
