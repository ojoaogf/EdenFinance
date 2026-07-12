import { cn } from "@/lib/utils";

interface IconPickerProps {
  options: string[];
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export function IconPicker({
  options,
  value,
  onChange,
  className,
}: IconPickerProps) {
  return (
    <div className={cn("grid grid-cols-7 gap-2", className)}>
      {options.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          aria-label={`Selecionar ícone ${icon}`}
          aria-pressed={value === icon}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-all",
            value === icon
              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
              : "border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5",
          )}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
