import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCategoryIconMap,
  getCanonicalTransactionCategoryName,
  getTransactionCategoryIcon,
} from "@/constants/transaction-category-ui";
import { useCategories } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/finance";
import { formatDateOnlyPtBR } from "@/utils/date";
import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { data: categories = [] } = useCategories();
  const categoryIcons = useMemo(
    () => buildCategoryIconMap(categories),
    [categories],
  );
  const recentTransactions = transactions.slice(0, 6);

  return (
    <Card className="h-full p-6">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-0 pb-5">
        <CardTitle className="text-lg">Transações Recentes</CardTitle>
        <a
          href="/transactions"
          className="group flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Ver Extrato Completo
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </CardHeader>

      <CardContent className="space-y-2 p-0">
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma transação recente.
          </p>
        ) : (
          recentTransactions.map((transaction) => {
            const canonicalCategory = getCanonicalTransactionCategoryName(
              transaction.category,
              transaction.type,
            );
            const categoryIcon =
              categoryIcons[canonicalCategory] ||
              getTransactionCategoryIcon(transaction.category, transaction.type);

            return (
              <div
                key={transaction.id}
                className="relative flex items-center gap-3 rounded-lg border border-border/70 bg-background/40 p-2.5 transition-colors hover:bg-background/70"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-base ring-1 ring-inset ring-border/60",
                    )}
                  >
                    {categoryIcon}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-card-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateOnlyPtBR(transaction.date, {
                        day: "2-digit",
                        month: "short",
                      })}{" "}
                      • {canonicalCategory}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      transaction.type === "income"
                        ? "text-success"
                        : "text-destructive",
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}{" "}
                    {Number(transaction.amount).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
