"use client";

import { cn } from "@/lib/cn.js";
import { btn, card, iconBadge, page } from "@/lib/ui.js";
import { Component } from "react";
import Link from "next/link";
import { FaExclamationTriangle, FaSync, FaHome } from "react-icons/fa";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={cn(page, "flex", "items-center", "justify-center", "p-4", "min-h-screen")}>
          <div className={cn(card, "max-w-lg", "w-full", "p-8", "sm:p-10", "text-center", "shadow-2xl")}>
            <div className={cn(iconBadge, "mx-auto", "mb-6", "w-16", "h-16", "bg-gradient-to-br", "from-red-500", "to-rose-600")}>
              <FaExclamationTriangle className="text-2xl" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h1>
            <p className={cn("text-muted-foreground", "text-sm", "mb-6", "leading-relaxed")}>
              An unexpected error occurred. Try refreshing the page or return to the homepage.
            </p>

            <div className={cn(card, "p-4", "mb-6", "text-left", "shadow-none")}>
              <p className={cn("text-xs", "text-secondary-foreground", "font-mono", "break-words")}>
                <span className="font-semibold text-red-500 dark:text-red-400">Error: </span>
                {this.state.error?.message || "Unknown error"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button type="button" onClick={this.handleRefresh} className={cn(btn.primary)}>
                <FaSync aria-hidden="true" />
                Refresh page
              </button>
              <Link href="/" className={cn(btn.secondary)}>
                <FaHome aria-hidden="true" />
                Go home
              </Link>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-8 text-left">
                <summary className={cn("cursor-pointer", "text-sm", "font-medium", "text-secondary-foreground")}>
                  Technical details (development)
                </summary>
                <pre className={cn("mt-3", card, "p-4", "overflow-auto", "max-h-48", "text-xs", "font-mono", "text-muted-foreground", "shadow-none")}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
