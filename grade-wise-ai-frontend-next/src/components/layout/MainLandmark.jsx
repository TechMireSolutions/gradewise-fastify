import { cn } from "@/lib/cn.js";

/** Skip-link target — use once per page route tree. */
export default function MainLandmark({ children, className = "", ...props }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </main>
  );
}
