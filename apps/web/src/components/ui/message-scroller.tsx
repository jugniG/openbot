import * as React from "react";
import { RiArrowDownLine } from "react-icons/ri";
import { cn } from "#/lib/utils";

interface MessageScrollerContextValue {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  checkAtBottom: () => void;
  scrollToBottom: (smooth?: boolean) => void;
  scrollToMessage: (messageId: string) => void;
  registerItem: (id: string, el: HTMLElement, anchor?: boolean) => void;
  unregisterItem: (id: string) => void;
}

const MessageScrollerContext = React.createContext<MessageScrollerContextValue | null>(null);

export function useMessageScroller() {
  const context = React.useContext(MessageScrollerContext);
  if (!context) {
    throw new Error("useMessageScroller must be used within a MessageScrollerProvider");
  }
  return context;
}

export interface MessageScrollerProviderProps {
  children: React.ReactNode;
  autoScrollOnNewMessage?: boolean;
}

export const MessageScrollerProvider: React.FC<MessageScrollerProviderProps> = ({
  children,
  autoScrollOnNewMessage = true,
}) => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const itemsMap = React.useRef<Map<string, HTMLElement>>(new Map());
  const userScrolledAwayRef = React.useRef(false);

  const checkAtBottom = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    // 32px tolerance for floating point calculations
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 32;
    setIsAtBottom(atBottom);
    if (!atBottom) {
      userScrolledAwayRef.current = true;
    } else {
      userScrolledAwayRef.current = false;
    }
  }, []);

  const scrollToBottom = React.useCallback((smooth = true) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    userScrolledAwayRef.current = false;
    setIsAtBottom(true);
  }, []);

  const scrollToMessage = React.useCallback((messageId: string) => {
    const el = itemsMap.current.get(messageId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const registerItem = React.useCallback(
    (id: string, el: HTMLElement, anchor?: boolean) => {
      itemsMap.current.set(id, el);
      if (anchor && !userScrolledAwayRef.current && autoScrollOnNewMessage) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
    },
    [autoScrollOnNewMessage]
  );

  const unregisterItem = React.useCallback((id: string) => {
    itemsMap.current.delete(id);
  }, []);

  return (
    <MessageScrollerContext.Provider
      value={{
        viewportRef,
        isAtBottom,
        checkAtBottom,
        scrollToBottom,
        scrollToMessage,
        registerItem,
        unregisterItem,
      }}
    >
      {children}
    </MessageScrollerContext.Provider>
  );
};

export interface MessageScrollerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageScroller = React.forwardRef<HTMLDivElement, MessageScrollerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex flex-col w-full min-h-0 overflow-hidden", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MessageScroller.displayName = "MessageScroller";

export interface MessageScrollerViewportProps
  extends React.HTMLAttributes<HTMLDivElement> {
  fadeEdges?: boolean;
}

export const MessageScrollerViewport = React.forwardRef<
  HTMLDivElement,
  MessageScrollerViewportProps
>(({ className, fadeEdges = true, children, ...props }, ref) => {
  const { viewportRef, checkAtBottom } = useMessageScroller();

  // Combine refs
  const handleRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref, viewportRef]
  );

  return (
    <div
      ref={handleRef}
      onScroll={(e) => {
        checkAtBottom();
        props.onScroll?.(e);
      }}
      className={cn(
        "flex-1 overflow-y-auto overscroll-contain",
        fadeEdges && "scroll-fade",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
MessageScrollerViewport.displayName = "MessageScrollerViewport";

export interface MessageScrollerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const MessageScrollerContent = React.forwardRef<
  HTMLDivElement,
  MessageScrollerContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-3 p-4", className)}
      {...props}
    />
  );
});
MessageScrollerContent.displayName = "MessageScrollerContent";

export interface MessageScrollerItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  messageId: string;
  scrollAnchor?: boolean;
}

export const MessageScrollerItem = React.forwardRef<
  HTMLDivElement,
  MessageScrollerItemProps
>(({ className, messageId, scrollAnchor = false, children, ...props }, ref) => {
  const { registerItem, unregisterItem } = useMessageScroller();
  const localRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (localRef.current) {
      registerItem(messageId, localRef.current, scrollAnchor);
    }
    return () => {
      unregisterItem(messageId);
    };
  }, [messageId, scrollAnchor, registerItem, unregisterItem]);

  return (
    <div
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as any).current = node;
      }}
      data-message-id={messageId}
      className={cn("w-full transition-opacity duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
});
MessageScrollerItem.displayName = "MessageScrollerItem";

export interface MessageScrollerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const MessageScrollerButton = React.forwardRef<
  HTMLButtonElement,
  MessageScrollerButtonProps
>(({ className, label = "Jump to latest", ...props }, ref) => {
  const { isAtBottom, scrollToBottom } = useMessageScroller();

  if (isAtBottom) return null;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => scrollToBottom(true)}
      aria-label={label}
      className={cn(
        "absolute bottom-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90",
        "text-xs font-medium cursor-pointer transition-all animate-in fade-in zoom-in-95 duration-200",
        className
      )}
      {...props}
    >
      <RiArrowDownLine className="size-3.5" />
      <span>{label}</span>
    </button>
  );
});
MessageScrollerButton.displayName = "MessageScrollerButton";
