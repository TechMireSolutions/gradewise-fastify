import { cn } from "@/lib/cn.js";
import { input } from "@/lib/ui.js";
import { FaSearch } from "react-icons/fa";

export default function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  id,
  label = "Search",
  className = "",
}) {
  const inputId = id || "search-field";

  return (
    <div className={className}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <FaSearch
          className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-subtle-foreground", "text-sm", "pointer-events-none")}
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(input, "pr-4")}
        />
      </div>
    </div>
  );
}
