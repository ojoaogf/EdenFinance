import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTransactionCategoryIcon } from "@/constants/transaction-category-ui";
import { useSpendingLimits, useUpdateSpendingLimit } from "@/hooks/use-spending-limits";
import { cn } from "@/lib/utils";
import type { SpendingLimit } from "@/types/finance";
import {
  formatCurrencyBRL,
  formatCurrencyInput,
  parseCurrencyToNumber,
} from "@/utils/money";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const LimitRow = ({ limit }: { limit: SpendingLimit }) => {
  const updateLimit = useUpdateSpendingLimit();
  const [draft, setDraft] = useState(formatCurrencyBRL(limit.limitAmount));

  useEffect(() => {
    setDraft(formatCurrencyBRL(limit.limitAmount));
  }, [limit.limitAmount]);

  const handleBlur = () => {
    const parsed = parseCurrencyToNumber(draft);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Valor de limite inválido");
      setDraft(formatCurrencyBRL(limit.limitAmount));
      return;
    }

    if (parsed === limit.limitAmount) return;

    updateLimit.mutate(
      { categoryName: limit.categoryName, limitAmount: parsed },
      {
        onSuccess: () => toast.success(`Limite de ${limit.categoryName} atualizado`),
        onError: () => {
          toast.error("Erro ao atualizar limite");
          setDraft(formatCurrencyBRL(limit.limitAmount));
        },
      },
    );
  };

  const isOverLimit = limit.percent > 100;
  const isAnnualized = limit.periodLimitAmount !== limit.limitAmount;

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-base leading-none">
            {getTransactionCategoryIcon(limit.categoryName, "expense")}
          </span>
          <span className="truncate text-sm font-semibold text-foreground">
            {limit.categoryName}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">R$</span>
          <Input
            value={draft}
            onChange={(e) => setDraft(formatCurrencyInput(e.target.value))}
            onBlur={handleBlur}
            className="h-8 w-24 text-right font-mono"
          />
          <span className="text-xs text-muted-foreground">/mês</span>
        </div>
      </div>
      <div className="mt-2">
        <Progress
          value={Math.min(100, limit.percent)}
          className={cn("h-1.5", isOverLimit && "[&>div]:bg-destructive")}
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span
            className={cn(
              "font-semibold",
              isOverLimit ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {formatCurrency(limit.spentAmount)} de{" "}
            {formatCurrency(limit.periodLimitAmount)}
            {isAnnualized ? " (ano)" : ""} ({limit.percent.toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

interface SpendingLimitsCardProps {
  year?: string;
  month?: string;
}

export function SpendingLimitsCard({ year, month }: SpendingLimitsCardProps) {
  const { data: limits = [] } = useSpendingLimits(year, month);

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-5">
        <CardTitle className="text-lg">Limite de Gastos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {limits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria de despesa cadastrada.
          </p>
        ) : (
          <ScrollArea className="h-[360px] pr-3">
            <div className="space-y-3">
              {limits.map((limit) => (
                <LimitRow key={limit.categoryName} limit={limit} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
