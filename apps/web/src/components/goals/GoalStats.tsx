import type { FinancialGoal } from "@/types/finance";
import { differenceInDays } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  PiggyBank,
  Target,
  TrendingUp,
} from "lucide-react";

interface GoalStatsProps {
  goals: FinancialGoal[];
}

export function GoalStats({ goals }: GoalStatsProps) {
  const totalPlanned = goals.reduce(
    (acc, goal) => acc + Number(goal.targetAmount),
    0,
  );
  const totalAccumulated = goals.reduce(
    (acc, goal) => acc + Number(goal.currentAmount),
    0,
  );
  const financialGap = Math.max(totalPlanned - totalAccumulated, 0);

  let totalRequiredMonthly = 0;
  let riskCount = 0;

  goals.forEach((goal) => {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const monthsRemaining = Math.max(differenceInDays(deadline, today) / 30, 1);
    const missing = Math.max(
      Number(goal.targetAmount) - Number(goal.currentAmount),
      0,
    );
    const required = missing / monthsRemaining;
    const currentDeposit = Number(goal.monthlyDeposit || 0);

    totalRequiredMonthly += required;

    if (currentDeposit < required * 0.8) {
      riskCount++;
    }
  });

  const cards = [
    {
      label: "Total Planejado",
      value: totalPlanned.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
      subtext: "Soma de todas as metas ativas",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      indicator: "bg-emerald-500",
    },
    {
      label: "Total Acumulado",
      value: totalAccumulated.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
      subtext: `${((totalAccumulated / (totalPlanned || 1)) * 100).toFixed(
        1,
      )}% do objetivo total`,
      icon: PiggyBank,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      indicator: "bg-emerald-500",
    },
    {
      label: "Gap Financeiro",
      value: financialGap.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
      subtext: "Valor restante para todas as metas",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      indicator: "bg-amber-500",
    },
    {
      label: "Aporte Mensal Necessário",
      value: totalRequiredMonthly.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }),
      subtext: "Para cumprir todos os prazos",
      icon: Calendar,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      indicator: "bg-amber-500",
    },
    {
      label: `${riskCount} metas`,
      value: "Risco de Atraso",
      isAlert: true,
      subtext: "Exigem ajuste de aporte",
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      indicator: "bg-rose-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md"
        >
          <div
            className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${card.indicator}`}
          />
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div className="space-y-1">
            <h3
              className={`text-lg font-bold ${card.isAlert ? "text-sm text-muted-foreground font-medium" : ""}`}
            >
              {card.isAlert ? card.value : card.value}
            </h3>
            {card.isAlert && (
              <p className="text-xl font-bold text-foreground">{card.label}</p>
            )}
            {!card.isAlert && (
              <p className="text-xs text-muted-foreground">{card.label}</p>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
