"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/cn.js";
import { focusRing } from "@/lib/ui.js";
import { FaTimes, FaCopy, FaCheck, FaTerminal } from "react-icons/fa";
import { Button } from "@/components/ui/index.js";

export default function SystemDiagnosticsModal({
  isOpen,
  onClose,
  healthData,
}) {
  const [copied, setCopied] = useState(false);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(healthData || {}, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto overscroll-contain flex items-center justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-diagnostics-modal-title"
        className="bg-card border border-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto overscroll-contain transition-all duration-300 relative my-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-input/95 backdrop-blur-md px-6 py-5 border-b border-border flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <FaTerminal className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 id="system-diagnostics-modal-title" className="text-xl font-bold text-foreground truncate">
                System Diagnostics Dump
              </h2>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Raw JSON diagnostic report from the backend /api/health probe.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={cn(
              "p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-btn-secondary transition-all active:scale-95 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center",
              focusRing
            )}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="relative">
            <pre className="p-4 rounded-xl bg-input border border-border text-xs font-mono text-secondary-foreground overflow-x-auto max-h-[50vh] overscroll-contain leading-relaxed select-text">
              {jsonString}
            </pre>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCopy}
              className="inline-flex items-center gap-2"
            >
              {copied ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
              {copied ? "Copied Diagnostics" : "Copy to Clipboard"}
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
