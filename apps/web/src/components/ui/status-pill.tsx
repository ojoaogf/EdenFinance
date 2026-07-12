import { cn } from "@/lib/utils";

export type StatusPillTone = "success" | "danger" | "info" | "neutral";

interface StatusPillProps {
  tone: StatusPillTone;
  children: React.ReactNode;
  className?: string;
}

const toneStyles: Record<StatusPillTone, string> = {
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusPill({ tone, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
