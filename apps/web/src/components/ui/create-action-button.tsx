import { cn } from "@/lib/utils";
import { Plus, type LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "./button";

interface CreateActionButtonProps extends Omit<ButtonProps, "children"> {
  label: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export function CreateActionButton({
  label,
  icon: Icon = Plus,
  fullWidth = false,
  className,
  ...props
}: CreateActionButtonProps) {
  return (
    <Button
      className={cn(
        "h-10 rounded-xl px-4 text-sm font-semibold",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-primary-foreground/30 bg-primary-foreground/10">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </Button>
  );
}

