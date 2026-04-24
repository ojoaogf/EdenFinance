import { cn } from "@/lib/utils";
import type { MonthlyReport } from "@/types/finance";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";
import { KPICard } from "./KPICard";

interface KPICardsSectionProps {
  monthlyReports: MonthlyReport[];
  filteredMonthlyReports: MonthlyReport[];
  viewMode: "year" | "month";
  year: string;
  month: string;
  className?: string;
}

export function KPICardsSection({
  monthlyReports,
  filteredMonthlyReports,
  viewMode,
  year,
  month,
  className,
}: KPICardsSectionProps) {
  const sortedMonthlyReports = useMemo(() => {
    return [...monthlyReports].sort((a, b) => a.month.localeCompare(b.month));
  }, [monthlyReports]);

  const selectedMonthKey = `${year}-${month.padStart(2, "0")}`;

  const currentReportForChange = useMemo(() => {
    if (!sortedMonthlyReports.length) return undefined;
    if (viewMode === "month") {
      return sortedMonthlyReports.find((r) => r.month === selectedMonthKey);
    }
    return sortedMonthlyReports[sortedMonthlyReports.length - 1];
  }, [sortedMonthlyReports, viewMode, selectedMonthKey]);

  const previousReportForChange = useMemo(() => {
    if (!sortedMonthlyReports.length) return undefined;
    if (viewMode === "month") {
      const index = sortedMonthlyReports.findIndex(
        (r) => r.month === selectedMonthKey,
      );
      return index > 0 ? sortedMonthlyReports[index - 1] : undefined;
    }
    return sortedMonthlyReports.length >= 2
      ? sortedMonthlyReports[sortedMonthlyReports.length - 2]
      : undefined;
  }, [sortedMonthlyReports, viewMode, selectedMonthKey]);

  const trendReports = useMemo(() => {
    if (!sortedMonthlyReports.length) return [];

    if (viewMode === "month") {
      const selectedIndex = sortedMonthlyReports.findIndex(
        (r) => r.month === selectedMonthKey,
      );

      if (selectedIndex === -1) return filteredMonthlyReports;

      const startIndex = Math.max(0, selectedIndex - 5);
      return sortedMonthlyReports.slice(startIndex, selectedIndex + 1);
    }

    return filteredMonthlyReports;
  }, [
    sortedMonthlyReports,
    viewMode,
    selectedMonthKey,
    filteredMonthlyReports,
  ]);

  const calculateChange = (currentValue: number, previousValue: number) => {
    if (!previousValue) return 0;
    return Number(
      (((currentValue - previousValue) / previousValue) * 100).toFixed(1),
    );
  };

  const incomeChange =
    currentReportForChange && previousReportForChange
      ? calculateChange(
          Number(currentReportForChange.income),
          Number(previousReportForChange.income),
        )
      : 0;

  const expenseChange =
    currentReportForChange && previousReportForChange
      ? calculateChange(
          Number(currentReportForChange.expenses),
          Number(previousReportForChange.expenses),
        )
      : 0;

  const balanceChange =
    currentReportForChange && previousReportForChange
      ? calculateChange(
          Number(currentReportForChange.balance),
          Number(previousReportForChange.balance),
        )
      : 0;

  const totalIncome = filteredMonthlyReports.reduce(
    (sum, r) => sum + Number(r.income),
    0,
  );
  const totalExpenses = filteredMonthlyReports.reduce(
    (sum, r) => sum + Number(r.expenses),
    0,
  );
  const totalSavings = totalIncome - totalExpenses;
  const avgMonthlySavings =
    filteredMonthlyReports.length > 0
      ? totalSavings / filteredMonthlyReports.length
      : 0;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      <KPICard
        title="Receitas Totais"
        value={`R$ ${totalIncome.toLocaleString("pt-BR")}`}
        change={incomeChange}
        changeLabel="vs. mês anterior"
        icon={TrendingUp}
        variant="success"
        meta={`Média mensal: R$ ${(
          totalIncome / (filteredMonthlyReports.length || 1)
        ).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
        trendData={trendReports.map((r) => Number(r.income))}
      />
      <KPICard
        title="Despesas Totais"
        value={`R$ ${totalExpenses.toLocaleString("pt-BR")}`}
        change={expenseChange}
        changeLabel="vs. mês anterior"
        icon={TrendingDown}
        variant="danger"
        meta={`Média mensal: R$ ${(
          totalExpenses / (filteredMonthlyReports.length || 1)
        ).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
        trendData={trendReports.map((r) => Number(r.expenses))}
      />
      <KPICard
        title="Economia Líquida"
        value={`R$ ${totalSavings.toLocaleString("pt-BR")}`}
        change={balanceChange}
        changeLabel="taxa de poupança"
        icon={Wallet}
        variant={totalSavings >= 0 ? "info" : "danger"}
        meta={`Média mensal: R$ ${avgMonthlySavings.toLocaleString("pt-BR", {
          maximumFractionDigits: 0,
        })} • ${savingsRate.toFixed(1)}%`}
        trendData={trendReports.map((r) => Number(r.balance))}
      />
    </div>
  );
}
