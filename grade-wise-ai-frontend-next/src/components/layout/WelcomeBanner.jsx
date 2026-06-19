import { cn } from "@/lib/cn.js";
import { Card } from "@/components/ui/Card.jsx";
import { eyebrow, pageDesc, pageTitle } from "@/lib/ui.js";

export default function WelcomeBanner({
  eyebrow: eyebrowText,
  title,
  description,
  aside,
  icon: Icon,
}) {
  return (
    <div className="mb-8 sm:mb-10">
      <Card glow className="relative overflow-hidden shadow-2xl">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {eyebrowText && <p className={eyebrow}>{eyebrowText}</p>}
              <h1
                className={cn(pageTitle, "mb-3 flex flex-wrap items-center gap-3")}
              >
                {Icon && (
                  <Icon className="shrink-0 text-teal-400" aria-hidden="true" />
                )}
                <span>{title}</span>
              </h1>
              {description && <p className={pageDesc}>{description}</p>}
            </div>
            {aside && <div className="shrink-0">{aside}</div>}
          </div>
        </div>
      </Card>
    </div>
  );
}
