import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

const messageVariants = cva("group relative flex w-full gap-3 py-2", {
  variants: {
    align: {
      start: "justify-start text-left",
      end: "justify-end text-right flex-row-reverse",
    },
  },
  defaultVariants: {
    align: "start",
  },
});

export interface MessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageVariants> {
  role?: "user" | "assistant" | "system";
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, align, role, ...props }, ref) => {
    // If align isn't explicitly provided, infer from role
    const resolvedAlign = align ?? (role === "user" ? "end" : "start");

    return (
      <div
        ref={ref}
        role="article"
        className={cn(messageVariants({ align: resolvedAlign }), className)}
        {...props}
      />
    );
  }
);
Message.displayName = "Message";

export interface MessageAvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageAvatar = React.forwardRef<HTMLDivElement, MessageAvatarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex shrink-0 select-none items-start pt-0.5",
          className
        )}
        {...props}
      />
    );
  }
);
MessageAvatar.displayName = "MessageAvatar";

export interface MessageContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const MessageContent = React.forwardRef<
  HTMLDivElement,
  MessageContentProps
>(({ className, align, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 flex-col gap-1 max-w-[85%]",
        align === "end" ? "items-end" : "items-start",
        className
      )}
      {...props}
    />
  );
});
MessageContent.displayName = "MessageContent";

export interface MessageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageHeader = React.forwardRef<
  HTMLDivElement,
  MessageHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-xs font-medium text-muted-foreground px-1 pb-0.5",
        className
      )}
      {...props}
    />
  );
});
MessageHeader.displayName = "MessageHeader";

export interface MessageFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const MessageFooter = React.forwardRef<
  HTMLDivElement,
  MessageFooterProps
>(({ className, align = "start", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground pt-1 px-1",
        align === "end" ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    />
  );
});
MessageFooter.displayName = "MessageFooter";

export interface MessageGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const MessageGroup = React.forwardRef<HTMLDivElement, MessageGroupProps>(
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
MessageGroup.displayName = "MessageGroup";
