import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, CalendarDays, Search } from "lucide-react";
import type { ReactNode } from "react";

interface TransactionFiltersProps {
  filterType: string;
  onFilterChange: (type: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  actions?: ReactNode;
}

export function TransactionFilters({
  filterType,
  onFilterChange,
  searchTerm,
  onSearchChange,
  actions,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 py-4">
      {/* Search & AI Suggestions */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
        <Input
          placeholder="Buscar transações..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-muted/30 border-primary/30 focus:border-primary focus:shadow-neon-sm focus:bg-background transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        {actions && <div className="shrink-0">{actions}</div>}
        <button className="hidden items-center gap-1.5 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground md:flex">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          Últimos 30 dias
        </button>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-primary/30 shadow-neon-sm">
            <button
              onClick={() => onFilterChange("all")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                filterType === "all"
                  ? "bg-primary/20 text-primary shadow-neon-sm border border-primary/20"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10",
              )}
            >
              Todos
            </button>
            <button
              onClick={() => onFilterChange("income")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
                filterType === "income"
                  ? "bg-emerald-500/20 text-emerald-500 shadow-neon-sm border border-emerald-500/20"
                  : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10",
              )}
            >
              <ArrowUpCircle className="h-3.5 w-3.5" />
              Receitas
            </button>
            <button
              onClick={() => onFilterChange("expense")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
                filterType === "expense"
                  ? "bg-rose-500/20 text-rose-500 shadow-neon-sm border border-rose-500/20"
                  : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10",
              )}
            >
              <ArrowDownCircle className="h-3.5 w-3.5" />
              Despesas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
