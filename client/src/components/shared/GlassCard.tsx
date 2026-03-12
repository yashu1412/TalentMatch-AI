import * as React from "react";
import { cn } from "@/lib/cn";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
  hover?: boolean;
};

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = true, hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-glass",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,transparent)] before:opacity-70",
          glow && "after:pointer-events-none after:absolute after:inset-0 after:rounded-[24px] after:shadow-[inset_0_0_40px_rgba(56,189,248,0.05)]",
          hover &&
            "transition-all duration-500 ease-out hover:-translate-y-1 hover:border-primary-glow/30 hover:shadow-glow",
          className
        )}
        {...props}
      >
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
