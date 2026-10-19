import Link from "next/link";
import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";

export default function DashboardQuickActions({ actions = [], columns = 5, className }) {
  const colClassMap = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  };

  const gridClass = colClassMap[columns] || colClassMap[5];

  return (
    <div className={cn("grid gap-3 sm:gap-4 lg:gap-5", gridClass, className)}>
      {actions.map((action, index) => {
        const isExternal = action.link.startsWith("http");
        const Component = isExternal ? "a" : Link;
        const extraProps = isExternal
          ? { href: action.link, target: "_blank", rel: "noreferrer" }
          : { href: action.link };

        return (
          <Component
            key={action.link || index}
            {...extraProps}
            className={cn(
              "flex flex-col items-center justify-center text-center p-5 sm:p-6 rounded-2xl text-white",
              "bg-gradient-to-br",
              action.gradient,
              "shadow-md hover:shadow-xl transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 group",
              focusRing
            )}
          >
            <div className="flex justify-center mb-3 transform group-hover:scale-110 transition-transform duration-200">
              {typeof action.icon === "function" ? (
                <action.icon className="w-6 h-6" aria-hidden="true" />
              ) : (
                action.icon
              )}
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 text-balance">
              {action.title}
            </h3>
            {action.description && (
              <p className="text-xs opacity-90 text-pretty leading-snug">
                {action.description}
              </p>
            )}
          </Component>
        );
      })}
    </div>
  );
}
