import { Card, CardContent } from "@/components/ui/card";
import { Transaction } from "@/types/finance";
import {
  endOfMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { AlertTriangle, PiggyBank, TrendingUp } from "lucide-react";

interface TransactionInsightsProps {
  transactions: Transaction[];
  categories: { id: string; name: string }[];
}

export function TransactionInsights({
  transactions,
  categories,
}: TransactionInsightsProps) {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const getTransactionsForPeriod = (start: Date, end: Date) => {
    return transactions.filter((t) =>
      isWithinInterval(parseISO(t.date), { start, end }),
    );
  };

  const currentMonthTransactions = getTransactionsForPeriod(
    currentMonthStart,
    currentMonthEnd,
  );
  const lastMonthTransactions = getTransactionsForPeriod(
    lastMonthStart,
    lastMonthEnd,
  );

  const calculateCategoryTotals = (
    txs: Transaction[],
    type: "income" | "expense",
  ) => {
    return txs
      .filter((t) => t.type === type)
      .reduce(
        (acc, t) => {
          const catName = t.category || "uncategorized";
          acc[catName] = (acc[catName] || 0) + Number(t.amount);
          return acc;
        },
        {} as Record<string, number>,
      );
  };

  const currentIncomeByCat = calculateCategoryTotals(
    currentMonthTransactions,
    "income",
  );
  const lastIncomeByCat = calculateCategoryTotals(
    lastMonthTransactions,
    "income",
  );

  const currentExpenseByCat = calculateCategoryTotals(
    currentMonthTransactions,
    "expense",
  );
  const lastExpenseByCat = calculateCategoryTotals(
    lastMonthTransactions,
    "expense",
  );

  // Insight 1: Highest Income Increase
  let highestIncomeIncrease = { category: "", amount: 0 };
  Object.keys(currentIncomeByCat).forEach((catName) => {
    const diff = currentIncomeByCat[catName] - (lastIncomeByCat[catName] || 0);
    if (diff > highestIncomeIncrease.amount) {
      highestIncomeIncrease = { category: catName, amount: diff };
    }
  });

  // Insight 2: Highest Expense Increase
  let highestExpenseIncrease = { category: "", amount: 0 };
  Object.keys(currentExpenseByCat).forEach((catName) => {
    const diff =
      currentExpenseByCat[catName] - (lastExpenseByCat[catName] || 0);
    if (diff > highestExpenseIncrease.amount) {
      highestExpenseIncrease = { category: catName, amount: diff };
    }
  });

  // Insight 3: Savings Increase
  const currentSavings =
    Object.values(currentIncomeByCat).reduce((a, b) => a + b, 0) -
    Object.values(currentExpenseByCat).reduce((a, b) => a + b, 0);

  const lastSavings =
    Object.values(lastIncomeByCat).reduce((a, b) => a + b, 0) -
    Object.values(lastExpenseByCat).reduce((a, b) => a + b, 0);

  const savingsDiff = currentSavings - lastSavings;

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (transactions.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {/* Income Insight */}
      <Card className="bg-gradient-to-br from-success/10 via-success/5 to-background border-success/20 shadow-sm hover:shadow-sm hover:border-success/20">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="p-2 bg-success/20 rounded-full">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Destaque de Receita
            </p>
            {highestIncomeIncrease.amount > 0 ? (
              <p className="text-sm">
                Você recebeu{" "}
                <span className="font-bold text-success">
                  {formatCurrency(highestIncomeIncrease.amount)}
                </span>{" "}
                a mais em{" "}
                <span className="font-medium text-foreground">
                  {highestIncomeIncrease.category}
                </span>{" "}
                comparado ao mês anterior.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem aumento significativo de receita este mês.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Insight */}
      <Card className="bg-gradient-to-br from-destructive/10 via-destructive/5 to-background border-destructive/20 shadow-sm hover:shadow-sm hover:border-destructive/20">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="p-2 bg-destructive/20 rounded-full">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Alerta de Gastos
            </p>
            {highestExpenseIncrease.amount > 0 ? (
              <p className="text-sm">
                Você gastou{" "}
                <span className="font-bold text-destructive">
                  {formatCurrency(highestExpenseIncrease.amount)}
                </span>{" "}
                a mais em{" "}
                <span className="font-medium text-foreground">
                  {highestExpenseIncrease.category}
                </span>{" "}
                comparado ao mês anterior.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Gastos controlados em relação ao mês anterior.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Savings Insight */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-sm hover:shadow-sm hover:border-primary/20">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="p-2 bg-primary/20 rounded-full">
            <PiggyBank className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Economia
            </p>
            {savingsDiff > 0 ? (
              <p className="text-sm">
                Você economizou{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(savingsDiff)}
                </span>{" "}
                a mais este mês comparado ao mês anterior.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sua economia foi menor que no mês passado.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
