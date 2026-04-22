import { motion } from "motion/react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionTypeSwitcherProps {
  value: "income" | "expense";
  onChange: (value: "income" | "expense") => void;
}

export function TransactionTypeSwitcher({
  value,
  onChange,
}: TransactionTypeSwitcherProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1.5">
      {(["expense", "income"] as const).map((type) => {
        const isActive = value === type;
        const isExpense = type === "expense";

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              isActive
                ? isExpense
                  ? "text-rose-500"
                  : "text-emerald-500"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeType"
                className="absolute inset-0 z-0 rounded-lg bg-background shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {isExpense ? (
                <ArrowDownCircle
                  className={cn("h-4 w-4", isActive && "fill-rose-500/10")}
                />
              ) : (
                <ArrowUpCircle
                  className={cn("h-4 w-4", isActive && "fill-emerald-500/10")}
                />
              )}
              {isExpense ? "Despesa" : "Receita"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
