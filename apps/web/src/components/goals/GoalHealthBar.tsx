import type { FinancialGoal } from "@/types/finance";
import { differenceInDays } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

interface GoalHealthBarProps {
  goals: FinancialGoal[];
}

export function GoalHealthBar({ goals }: GoalHealthBarProps) {
  let onTrack = 0;
  let warning = 0;
  let risk = 0;

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

    if (currentDeposit >= required) {
      onTrack++;
    } else if (currentDeposit >= required * 0.8) {
      warning++;
    } else {
      risk++;
    }
  });

  const total = goals.length || 1;
  const onTrackPercent = (onTrack / total) * 100;
  const warningPercent = (warning / total) * 100;
  const riskPercent = (risk / total) * 100;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-full bg-secondary/50 p-2">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <div>
          <h3 className="font-semibold">Saúde das Metas</h3>
          <p className="text-sm text-muted-foreground">
            Distribuição do status atual
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex h-4 w-full overflow-hidden rounded-full bg-secondary/30">
        {onTrack > 0 && (
          <div
            style={{ width: `${onTrackPercent}%` }}
            className="bg-emerald-500 transition-all duration-500"
          />
        )}
        {warning > 0 && (
          <div
            style={{ width: `${warningPercent}%` }}
            className="bg-amber-500 transition-all duration-500"
          />
        )}
        {risk > 0 && (
          <div
            style={{ width: `${riskPercent}%` }}
            className="bg-rose-500 transition-all duration-500"
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="font-bold">{onTrack}</span>
            <span className="text-xs text-muted-foreground">No ritmo</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="font-bold">{warning}</span>
            <span className="text-xs text-muted-foreground">Atenção</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          <div className="flex flex-col">
            <span className="font-bold">{risk}</span>
            <span className="text-xs text-muted-foreground">Em risco</span>
          </div>
        </div>
      </div>

      {/* Insight Box - Optional based on risk */}
      {risk > 0 && (
        <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-500 mb-1">
              Atenção necessária
            </h4>
            <p className="text-xs text-muted-foreground">
              {risk} metas exigem ajuste de aporte para cumprir o prazo.
              Considere revisar sua estratégia de aportes ou estender os prazos.
            </p>
          </div>
          <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-500 mb-1">
              Atenção necessária
            </h4>
            <p className="text-xs text-muted-foreground">
              {risk} metas exigem ajuste de aporte para cumprir o prazo.
              Considere revisar sua estratégia de aportes ou estender os prazos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
