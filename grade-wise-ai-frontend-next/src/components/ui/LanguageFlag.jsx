import { useId } from "react";
import { cn } from "@/lib/cn.js";
import { FaGlobe } from "react-icons/fa";

/**
 * High-definition vector flag & language emblem components.
 * Solves the Windows OS issue where regional flag emojis render as raw letters ("GB", "PK", "SA", "IR").
 */

export function FlagUK({ className = "w-6 h-4" }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 60 40"
      className={cn("rounded-[3px] shadow-sm shrink-0 border border-black/10 dark:border-white/10", className)}
      aria-label="United Kingdom Flag"
      role="img"
    >
      <clipPath id={`uk-clip-${id}`}>
        <rect width="60" height="40" rx="3" />
      </clipPath>
      <g clipPath={`url(#uk-clip-${id})`}>
        {/* Blue Field */}
        <rect width="60" height="40" fill="#012169" />
        {/* White Saltire Diagonals */}
        <path d="M0 0 L60 40 M60 0 L0 40" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="square" />
        {/* Red Saltire Diagonals */}
        <path d="M0 0 L30 20 M60 40 L30 20 M60 0 L30 20 M0 40 L30 20" stroke="#C8102E" strokeWidth="3" />
        {/* White St George Cross */}
        <path d="M30 0 V40 M0 20 H60" stroke="#FFFFFF" strokeWidth="12" />
        {/* Red St George Cross */}
        <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="7" />
      </g>
    </svg>
  );
}

export function FlagPK({ className = "w-6 h-4" }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 60 40"
      className={cn("rounded-[3px] shadow-sm shrink-0 border border-black/10 dark:border-white/10", className)}
      aria-label="Pakistan Flag"
      role="img"
    >
      <clipPath id={`pk-clip-${id}`}>
        <rect width="60" height="40" rx="3" />
      </clipPath>
      <g clipPath={`url(#pk-clip-${id})`}>
        {/* Dark Green Background */}
        <rect width="60" height="40" fill="#01411C" />
        {/* White Hoist (25% width) */}
        <rect width="15" height="40" fill="#FFFFFF" />
        {/* Crescent */}
        <circle cx="39" cy="20" r="10" fill="#FFFFFF" />
        <circle cx="42" cy="18" r="8.5" fill="#01411C" />
        {/* 5-Point Star */}
        <polygon
          points="42.5,12 43.8,15.2 47.2,15.2 44.5,17.2 45.5,20.4 42.5,18.4 39.5,20.4 40.5,17.2 37.8,15.2 41.2,15.2"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

export function FlagSA({ className = "w-6 h-4" }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 60 40"
      className={cn("rounded-[3px] shadow-sm shrink-0 border border-black/10 dark:border-white/10", className)}
      aria-label="Saudi Arabia Flag"
      role="img"
    >
      <clipPath id={`sa-clip-${id}`}>
        <rect width="60" height="40" rx="3" />
      </clipPath>
      <g clipPath={`url(#sa-clip-${id})`}>
        {/* Saudi Green */}
        <rect width="60" height="40" fill="#006C35" />
        {/* Calligraphic Shahada representation */}
        <g fill="#FFFFFF" opacity="0.95">
          <rect x="15" y="11" width="30" height="2" rx="1" />
          <path d="M17 14h3v3h-3zm5-1h4v4h-4zm6-1h3v4h-3zm5 0h4v4h-4zm6 1h3v3h-3z" />
          <circle cx="21" cy="9" r="1" />
          <circle cx="29" cy="9" r="1" />
          <circle cx="36" cy="9" r="1" />
          {/* Sword underneath */}
          <path d="M15 22h24l4 2-4 2H15v-1h-2v-2h2z" />
        </g>
      </g>
    </svg>
  );
}

export function FlagIR({ className = "w-6 h-4" }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 60 40"
      className={cn("rounded-[3px] shadow-sm shrink-0 border border-black/10 dark:border-white/10", className)}
      aria-label="Iran Flag"
      role="img"
    >
      <clipPath id={`ir-clip-${id}`}>
        <rect width="60" height="40" rx="3" />
      </clipPath>
      <g clipPath={`url(#ir-clip-${id})`}>
        {/* Green top stripe */}
        <rect width="60" height="13.33" y="0" fill="#239F40" />
        {/* White middle stripe */}
        <rect width="60" height="13.34" y="13.33" fill="#FFFFFF" />
        {/* Red bottom stripe */}
        <rect width="60" height="13.33" y="26.67" fill="#DA0000" />
        {/* Red national emblem in center */}
        <g transform="translate(26, 14.5) scale(0.65)" fill="#DA0000">
          <path d="M6 1 C3 4 2 8 6 12 C10 8 9 4 6 1 Z" />
          <path d="M2 5 C-1 8 0 11 3 13 C2 10 3 7 5 5 Z" />
          <path d="M10 5 C13 8 12 11 9 13 C10 10 9 7 7 5 Z" />
        </g>
      </g>
    </svg>
  );
}

export function FlagAll({ className = "w-6 h-4" }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[3px] bg-gradient-to-br from-indigo-500 via-teal-500 to-sky-400 text-white shadow-sm shrink-0",
        className
      )}
      aria-label="All 4 Languages"
      role="img"
    >
      <FaGlobe className="w-3/4 h-3/4 text-white drop-shadow-sm" />
    </div>
  );
}

export default function LanguageFlag({ language, className, size = "md" }) {
  const sizeClasses = {
    sm: "w-5 h-3.5",
    md: "w-7 h-5",
    lg: "w-10 h-7",
    xl: "w-12 h-8",
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const combinedClass = cn(selectedSize, className);

  switch (language) {
    case "en":
      return <FlagUK className={combinedClass} />;
    case "ur":
      return <FlagPK className={combinedClass} />;
    case "ar":
      return <FlagSA className={combinedClass} />;
    case "fa":
      return <FlagIR className={combinedClass} />;
    case "all":
    default:
      return <FlagAll className={combinedClass} />;
  }
}

