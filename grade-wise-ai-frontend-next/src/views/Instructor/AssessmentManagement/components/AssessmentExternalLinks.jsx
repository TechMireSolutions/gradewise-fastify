"use client";

import { cn } from "@/lib/cn.js";
import { btn, card, focusRing, iconBadge } from "@/lib/ui.js";
import { Input, Label } from "@/components/ui";
import { FiLink, FiPlus, FiTrash2 } from "react-icons/fi";

export default function AssessmentExternalLinks({
  externalLinks = [""],
  onLinkChange,
  onAddLink,
  onRemoveLink,
  disabled = false,
}) {
  return (
    <div className={cn(card, "shadow-2xl overflow-hidden")}>
      <div className="px-6 py-4 border-b border-border bg-input flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", iconBadge)}>
            <FiLink className="text-white text-base" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">External Links & References</h2>
            <p className="text-xs text-muted-foreground">
              Provide web pages, articles, or documentation URLs for additional AI context
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddLink}
          disabled={disabled}
          className={cn(
            btn.secondary,
            "py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 rounded-xl"
          )}
        >
          <FiPlus />
          Add Link
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-4">
        {externalLinks.map((link, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor={`external-link-${index}`} className="sr-only">
                External Link {index + 1}
              </Label>
              <Input
                type="url"
                id={`external-link-${index}`}
                hasIcon={false}
                value={link}
                onChange={(e) => onLinkChange(index, e.target.value)}
                placeholder="https://example.com/topic-guide"
                disabled={disabled}
              />
            </div>

            {externalLinks.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveLink(index)}
                disabled={disabled}
                aria-label={`Remove link ${index + 1}`}
                className={cn(
                  "p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 active:scale-95 transition-all cursor-pointer",
                  focusRing
                )}
              >
                <FiTrash2 className="text-base" />
              </button>
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          URLs must start with https:// and point to publicly accessible educational resources.
        </p>
      </div>
    </div>
  );
}
