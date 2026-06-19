function LoadingSpinner({ size = "md", color = "blue", type = "spinner" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    blue: "border-indigo-500",
    green: "border-emerald-500",
    red: "border-red-500",
    gray: "border-slate-400",
    white: "border-white",
    purple: "border-violet-500",
  };

  const gradientColors = {
    blue: "from-indigo-500 to-violet-600",
    green: "from-emerald-500 to-teal-600",
    red: "from-red-500 to-rose-600",
    gray: "from-slate-500 to-slate-700",
    white: "from-white to-slate-200",
    purple: "from-violet-500 to-purple-600",
  };

  // Modern circular spinner with gradient
  if (type === "spinner" || !type) {
    return (
      <div className="flex justify-center items-center" role="status" aria-label="Loading">
        <span className="sr-only">Loading</span>
        <div className="relative">
          <div
            className={`${sizeClasses[size]} rounded-full border-4 border-border`}
          ></div>
          <div
            className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 ${colorClasses[color]} border-t-transparent animate-spin`}
          ></div>
        </div>
      </div>
    );
  }

  // Gradient spinner with glow effect
  if (type === "gradient") {
    return (
      <div className="flex justify-center items-center" role="status" aria-label="Loading">
        <span className="sr-only">Loading</span>
        <div className="relative">
          <div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${gradientColors[color]} animate-spin`}
            style={{
              WebkitMask: "radial-gradient(farthest-side,#0000 calc(100% - 8px),#000 0)",
              mask: "radial-gradient(farthest-side,#0000 calc(100% - 8px),#000 0)"
            }}
          ></div>
        </div>
      </div>
    );
  }

  // Dots loader
  if (type === "dots") {
    const dotSize = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
      lg: "w-4 h-4",
      xl: "w-5 h-5",
    };

    const dotColor = {
      blue: "bg-indigo-500",
      green: "bg-emerald-500",
      red: "bg-red-500",
      gray: "bg-slate-400",
      white: "bg-white",
      purple: "bg-violet-500",
    };

    return (
      <div className="flex justify-center items-center space-x-2" role="status" aria-label="Loading">
        <div
          className={`${dotSize[size]} ${dotColor[color]} rounded-full animate-bounce`}
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className={`${dotSize[size]} ${dotColor[color]} rounded-full animate-bounce`}
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className={`${dotSize[size]} ${dotColor[color]} rounded-full animate-bounce`}
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    );
  }

  // Pulse loader
  if (type === "pulse") {
    const pulseColor = {
      blue: "bg-indigo-500",
      green: "bg-emerald-500",
      red: "bg-red-500",
      gray: "bg-slate-400",
      white: "bg-white",
      purple: "bg-violet-500",
    };

    return (
      <div className="flex justify-center items-center" role="status" aria-label="Loading">
        <span className="sr-only">Loading</span>
        <div className="relative">
          <div
            className={`${sizeClasses[size]} ${pulseColor[color]} rounded-full animate-ping opacity-40`}
          ></div>
          <div
            className={`absolute top-0 left-0 ${sizeClasses[size]} ${pulseColor[color]} rounded-full`}
          ></div>
        </div>
      </div>
    );
  }

  // Bars loader
  if (type === "bars") {
    const barWidth = {
      sm: "w-1",
      md: "w-1.5",
      lg: "w-2",
      xl: "w-3",
    };

    const barHeight = {
      sm: "h-4",
      md: "h-8",
      lg: "h-12",
      xl: "h-16",
    };

    const barColor = {
      blue: "bg-indigo-500",
      green: "bg-emerald-500",
      red: "bg-red-500",
      gray: "bg-slate-400",
      white: "bg-white",
      purple: "bg-violet-500",
    };

    return (
      <div className="flex justify-center items-center space-x-1" role="status" aria-label="Loading">
        <div
          className={`${barWidth[size]} ${barHeight[size]} ${barColor[color]} rounded-full animate-pulse`}
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        ></div>
        <div
          className={`${barWidth[size]} ${barHeight[size]} ${barColor[color]} rounded-full animate-pulse`}
          style={{ animationDelay: "150ms", animationDuration: "1s" }}
        ></div>
        <div
          className={`${barWidth[size]} ${barHeight[size]} ${barColor[color]} rounded-full animate-pulse`}
          style={{ animationDelay: "300ms", animationDuration: "1s" }}
        ></div>
        <div
          className={`${barWidth[size]} ${barHeight[size]} ${barColor[color]} rounded-full animate-pulse`}
          style={{ animationDelay: "450ms", animationDuration: "1s" }}
        ></div>
      </div>
    );
  }

  // Default to spinner
  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-border`}
        ></div>
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 ${colorClasses[color]} border-t-transparent animate-spin`}
        ></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
