import { skipLink } from "@/lib/ui.js";

export default function SkipLink() {
  return (
    <a href="#main-content" className={skipLink}>
      Skip to main content
    </a>
  );
}
