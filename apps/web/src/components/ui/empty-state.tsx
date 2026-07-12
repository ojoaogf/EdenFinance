import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  size?: "default" | "compact";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  size = "default",
  className,
}: EmptyStateProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center text-center",
        isCompact ? "gap-2 p-6" : "gap-1 p-8",
        className,
      )}
    >
      <div
        className={cn(
          "mb-2 rounded-full bg-secondary/50",
          isCompact ? "p-3" : "p-4",
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground",
            isCompact ? "h-5 w-5" : "h-8 w-8",
          )}
        />
      </div>
      <h3
        className={cn(
          "font-medium text-foreground",
          isCompact ? "text-sm" : "text-lg",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-muted-foreground",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
