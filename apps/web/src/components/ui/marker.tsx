import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

const markerVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all select-none",
  {
    variants: {
      variant: {
        default: "bg-muted/80 text-muted-foreground border border-border/60",
        subtle: "text-muted-foreground hover:text-foreground",
        outline: "border border-border bg-card/60 text-foreground backdrop-blur-sm shadow-xs",
        active: "bg-primary/10 text-primary border border-primary/25",
        destructive: "bg-destructive/10 text-destructive border border-destructive/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface MarkerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof markerVariants> {}

export const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(
  ({ className, variant, role = "status", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={role}
        aria-live="polite"
        className={cn(markerVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Marker.displayName = "Marker";

export interface MarkerIconProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const MarkerIcon = React.forwardRef<HTMLSpanElement, MarkerIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("flex shrink-0 items-center justify-center [&>svg]:size-3.5", className)}
        {...props}
      />
    );
  }
);
MarkerIcon.displayName = "MarkerIcon";

export interface MarkerContentProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const MarkerContent = React.forwardRef<
  HTMLSpanElement,
  MarkerContentProps
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("truncate font-mono text-[11px] tracking-wide", className)}
      {...props}
    />
  );
});
MarkerContent.displayName = "MarkerContent";
