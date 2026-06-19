import { cn } from "@/lib/cn.js";
import { card, cardGlow, cardHeader, cardInteractive } from "@/lib/ui.js";

function Card({ children, className = "", hover = false, glow = false }) {
  return (
    <div
      className={cn(
        card,
        hover && cardInteractive,
        glow && cardGlow,
        className
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }) {
  return <div className={cn(cardHeader, className)}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export { Card, CardHeader, CardContent };
