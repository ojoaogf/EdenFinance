import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCanonicalTransactionCategoryName,
  getTransactionCategoryIcon,
} from "@/constants/transaction-category-ui";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/finance";
import { ArrowUpRight } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 6);

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="terminal-title text-lg text-card-foreground">
          Transações Recentes
        </CardTitle>
        <a
          href="/transactions"
          className="group flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Ver Extrato Completo
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </CardHeader>

      <CardContent className="space-y-2 p-4 pt-0">
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
            const categoryIcon = getTransactionCategoryIcon(
              transaction.category,
              transaction.type,
            );

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
                      {new Date(transaction.date).toLocaleDateString("pt-BR", {
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
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}{" "}
                    {Number(transaction.amount).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
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
