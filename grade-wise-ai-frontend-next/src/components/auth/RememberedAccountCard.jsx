import { useState } from "react";
import { cn } from "@/lib/cn.js";
import { FaUserCircle, FaTimes } from "react-icons/fa";

export function GoogleColorIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12c0 2.03.45 3.84 1.24 5.42l4.04-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

export default function RememberedAccountCard({
  account,
  onSelect,
  onRemove,
  disabled = false,
}) {
  const [imgError, setImgError] = useState(false);

  const firstName = account.name
    ? account.name.trim().split(" ")[0]
    : account.email.split("@")[0];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!disabled) onSelect(account);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          onSelect(account);
        }
      }}
      className={cn(
        "group relative flex w-full items-center justify-between gap-3.5",
        "rounded-xl border border-border bg-card/90 px-3.5 py-3 shadow-md backdrop-blur-sm",
        "transition-all duration-200 cursor-pointer select-none",
        "hover:border-indigo-500/50 hover:bg-card hover:shadow-indigo-500/10 hover:shadow-lg",
        "active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
        disabled && "opacity-60 pointer-events-none cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {account.avatar && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={account.avatar}
            alt={account.name || "User"}
            onError={() => setImgError(true)}
            className="w-10 h-10 rounded-full object-cover border border-border/80 flex-shrink-0 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-md">
            {account.name ? account.name.charAt(0).toUpperCase() : <FaUserCircle className="w-6 h-6" />}
          </div>
        )}

        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-foreground group-hover:text-indigo-400 transition-colors truncate">
            Sign in as {firstName}
          </p>
          <p className="text-xs text-muted-foreground truncate">{account.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 pl-2">
        <GoogleColorIcon className="w-5 h-5" />

        {onRemove && (
          <button
            type="button"
            title="Remove account"
            aria-label="Remove remembered account"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(account.email);
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
