import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

const bubbleVariants = cva(
  "relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm transition-colors break-words",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-muted text-foreground/90 border border-border/50",
        tinted: "bg-primary/10 text-primary border border-primary/20",
        outline: "border border-border bg-card/80 text-foreground backdrop-blur-sm shadow-sm",
        ghost: "bg-transparent text-foreground max-w-none p-0",
        destructive: "bg-destructive text-destructive-foreground shadow-sm",
      },
      align: {
        start: "self-start rounded-bl-sm",
        end: "self-end rounded-br-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      align: "start",
    },
  }
);

export interface BubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bubbleVariants> {}

export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  ({ className, variant, align, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(bubbleVariants({ variant, align }), className)}
        {...props}
      />
    );
  }
);
Bubble.displayName = "Bubble";

export interface BubbleContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  render?: React.ReactElement;
}

export const BubbleContent = React.forwardRef<
  HTMLDivElement,
  BubbleContentProps
>(({ className, render, children, ...props }, ref) => {
  if (render && React.isValidElement(render)) {
    return React.cloneElement(
      render as React.ReactElement<any>,
      {
        ref,
        className: cn(
          "inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors",
          className,
          (render.props as any).className
        ),
        ...props,
      },
      children ?? (render.props as any).children
    );
  }

  return (
    <div ref={ref} className={cn("leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
});
BubbleContent.displayName = "BubbleContent";

export interface BubbleGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const BubbleGroup = React.forwardRef<HTMLDivElement, BubbleGroupProps>(
  ({ className, align = "start", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-1 w-full",
          align === "end" ? "items-end" : "items-start",
          className
        )}
        {...props}
      />
    );
  }
);
BubbleGroup.displayName = "BubbleGroup";

export interface BubbleReactionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom";
  align?: "start" | "end";
}

export const BubbleReactions = React.forwardRef<
  HTMLDivElement,
  BubbleReactionsProps
>(({ className, side = "bottom", align = "end", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-1 mt-1 text-xs",
        align === "end" ? "justify-end" : "justify-start",
        side === "top" ? "mb-1 -mt-0.5" : "mt-1",
        className
      )}
      {...props}
    />
  );
});
BubbleReactions.displayName = "BubbleReactions";
