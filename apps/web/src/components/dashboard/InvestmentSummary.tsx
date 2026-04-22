import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { InvestmentSummary as IInvestmentSummary } from "@/types/finance";
import {
  ArrowRight,
  Bitcoin,
  Briefcase,
  Building2,
  Landmark,
  PieChart,
  TrendingUp,
} from "lucide-react";

const typeConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    risk: "low" | "medium" | "high";
    color: string;
  }
> = {
  stock: {
    label: "Ações",
    icon: TrendingUp,
    risk: "high",
    color: "text-blue-500",
  },
  fund: {
    label: "Fundos",
    icon: PieChart,
    risk: "medium",
    color: "text-purple-500",
  },
  crypto: {
    label: "Cripto",
    icon: Bitcoin,
    risk: "high",
    color: "text-orange-500",
  },
  fixed_income: {
    label: "Renda Fixa",
    icon: Landmark,
    risk: "low",
    color: "text-emerald-500",
  },
  real_estate: {
    label: "FIIs",
    icon: Building2,
    risk: "medium",
    color: "text-indigo-500",
  },
};

const riskLabels = {
  low: {
    label: "Conservador",
    style:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  medium: {
    label: "Moderado",
    style:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  },
  high: {
    label: "Agressivo",
    style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

interface InvestmentSummaryProps {
  summary: IInvestmentSummary[];
}

export function InvestmentSummary({ summary }: InvestmentSummaryProps) {
  const totalInvested = summary.reduce(
    (sum, item) => sum + Number(item.totalInvested),
    0,
  );

  return (
    <div className="rounded-2xl border border-primary/50 bg-card/50 p-6 backdrop-blur-sm shadow-neon-sm hover:border-primary transition-colors duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Carteira de Investimentos
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Patrimônio Total:
            </span>
            <span className="text-lg font-bold text-primary">
              R$ {totalInvested.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
        <a
          href="/investments"
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Detalhes
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {summary.slice(0, 4).map((item, index) => {
          const config = typeConfig[item.type] || {
            label: item.type,
            icon: Briefcase,
            risk: "medium",
            color: "text-slate-500",
          };
          const Icon = config.icon;
          const riskInfo = riskLabels[config.risk];
          const allocation =
            totalInvested > 0
              ? (Number(item.totalInvested) / totalInvested) * 100
              : 0;

          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div
                  className={cn(
                    "rounded-lg bg-background p-2 ring-1 ring-border shadow-sm",
                    config.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                    riskInfo.style,
                  )}
                >
                  {riskInfo.label}
                </span>
              </div>

              <div className="space-y-1">
                <h4
                  className="font-semibold text-foreground truncate"
                  title={item.name}
                >
                  {item.name}
                </h4>
                <p className="text-sm text-muted-foreground">{config.label}</p>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-foreground">
                    R$ {Number(item.totalInvested).toLocaleString("pt-BR")}
                  </span>
                  <span className="text-muted-foreground">
                    {allocation.toFixed(1)}%
                  </span>
                </div>
                <Progress value={allocation} className="h-1.5 bg-muted" />
              </div>
            </div>
          );
        })}

        {summary.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
            Nenhum investimento encontrado. Comece a investir hoje!
          </div>
        )}
      </div>
    </div>
  );
}
