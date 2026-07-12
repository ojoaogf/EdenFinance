import { CashFlowSection } from "@/components/dashboard/CashFlowSection";
import { ExpensesByCategorySection } from "@/components/dashboard/ExpensesByCategorySection";
import { KPICardsSection } from "@/components/dashboard/KPICardsSection";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AppLayout } from "@/components/layout/AppLayout";
import { SpendingLimitsCard } from "@/components/reports/SpendingLimitsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import {
  useExpensesByCategory,
  useMonthlyEvolution,
} from "@/hooks/use-reports";
import { useTransactions } from "@/hooks/use-transactions";
import { api } from "@/lib/api";
import type { Transaction } from "@/types/finance";
import { toLocalDateFromDateOnly } from "@/utils/date";
import { generateExcelReport } from "@/utils/excel-exporter";
import {
  filterMonthlyReportsByPeriod,
  filterTransactionsByPeriod,
} from "@/utils/report-period";
import { Table2 } from "lucide-react";
import { useMemo, useState } from "react";

const Reports = () => {
  const [viewMode, setViewMode] = useState<"year" | "month">("month");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [type, setType] = useState<"all" | "income" | "expense">("all");

  // Determine params for hooks
  const hookYear = year;
  const hookMonth = viewMode === "month" ? month : undefined;

  const { data: monthlyReports = [] } = useMonthlyEvolution(hookYear, type);
  const { data: expensesByCategory = [] } = useExpensesByCategory(
    hookYear,
    hookMonth,
  );
  const { data: categories = [] } = useCategories();
  const { data: transactionsAll = [] } = useTransactions();

  const filteredMonthlyReports = useMemo(
    () =>
      filterMonthlyReportsByPeriod(monthlyReports, { viewMode, year, month }),
    [monthlyReports, viewMode, year, month],
  );

  const recentTransactions = useMemo(
    () =>
      filterTransactionsByPeriod(transactionsAll, { viewMode, year, month })
        .slice()
        .sort(
          (a, b) =>
            toLocalDateFromDateOnly(b.date).getTime() -
            toLocalDateFromDateOnly(a.date).getTime(),
        )
        .slice(0, 8),
    [transactionsAll, viewMode, year, month],
  );

  const handleExportExcel = async () => {
    const periodLabel =
      viewMode === "month" ? `${month.padStart(2, "0")}/${year}` : year;

    const params: Record<string, string> = { year };
    if (viewMode === "month") {
      params.month = month;
    }

    const { data: transactions } = await api.get<Transaction[]>(
      `/transactions?${new URLSearchParams(params).toString()}`,
    );

    if (!transactions.length) {
      alert("Não há transações para exportar neste período.");
      return;
    }

    const transferCategoryNames = categories
      .filter((c) => c.isTransfer)
      .map((c) => c.name);

    generateExcelReport(transactions, periodLabel, transferCategoryNames);
  };

  const operationalRows = useMemo(() => {
    return [...filteredMonthlyReports]
      .sort((a, b) => b.month.localeCompare(a.month))
      .map((row) => {
        const income = Number(row.income);
        const expenses = Number(row.expenses);
        const balance = income - expenses;
        const margin = income > 0 ? (balance / income) * 100 : 0;

        return {
          month: row.month,
          income,
          expenses,
          margin,
          invested: Number(row.invested),
          cumulativeBalance: Number(row.cumulativeBalance),
        };
      });
  }, [filteredMonthlyReports]);

  const formatMonthLabel = (monthKey: string) => {
    const [y, m] = monthKey.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  // Generate year options (starting from 2026)
  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const years = Array.from({ length: 5 }, (_, i) => (startYear + i).toString());

  // Month names
  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  return (
    <AppLayout
      title="Resumo Financeiro"
      subtitle="Bem-vindo de volta. Acompanhe receitas, despesas e histórico financeiro."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Table2 className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </>
      }
    >
      <Card className="mb-8 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              viewMode === "month"
                ? "bg-primary text-primary-foreground"
                : "bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensal
          </button>

          <button
            type="button"
            onClick={() => setViewMode("year")}
            className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              viewMode === "year"
                ? "bg-primary text-primary-foreground"
                : "bg-background/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Anual
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {viewMode === "month" && (
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={type}
            onValueChange={(v: "all" | "income" | "expense") => setType(v)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ambos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="mb-8">
        <KPICardsSection
          monthlyReports={monthlyReports}
          filteredMonthlyReports={filteredMonthlyReports}
          viewMode={viewMode}
          year={year}
          month={month}
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashFlowSection
            monthlyReports={monthlyReports}
            viewMode={viewMode}
            year={year}
            month={month}
            title="Fluxo de Caixa Mensal"
            description="Análise histórica do ano"
            height={330}
          />
        </div>
        <div className="lg:col-span-1">
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpensesByCategorySection
          data={expensesByCategory}
          variant="list"
          title="Gastos por Categoria"
          emptyMessage="Nenhuma despesa registrada."
        />
        <SpendingLimitsCard year={hookYear} month={hookMonth} />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border/50 px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">
            Resumo Operacional
          </h3>
        </div>
        <ScrollArea className="h-[420px]">
          <table className="w-full min-w-[880px]">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="terminal-label text-center">
                <th className="px-6 py-3">Período</th>
                <th className="px-6 py-3">Receita Bruta</th>
                <th className="px-6 py-3">Despesas</th>
                <th className="px-6 py-3">
                  Investido
                  <span
                    className="ml-1 cursor-help text-muted-foreground/70 normal-case"
                    title="Soma das transações de categorias marcadas como transferência (ex: Investimento) — não é despesa, só mostra quanto foi movimentado no mês."
                  >
                    (ⓘ)
                  </span>
                </th>
                <th className="px-6 py-3">Margem</th>
                <th className="px-6 py-3">
                  Saldo Acumulado
                  {type !== "all" && (
                    <span
                      className="ml-1 cursor-help text-muted-foreground/70 normal-case"
                      title="O Saldo Acumulado sempre considera todas as receitas e despesas reais, independente do filtro de Tipo selecionado acima."
                    >
                      (ⓘ)
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {operationalRows.map((row) => (
                <tr key={row.month} className="border-t border-border/40 text-center">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {formatMonthLabel(row.month)}
                  </td>
                  <td className="px-6 py-4 font-mono text-foreground">
                    {row.income.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4 font-mono text-chart-2">
                    {row.expenses.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4 font-mono text-primary">
                    {row.invested.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4 font-bold text-chart-1">
                    {row.margin.toFixed(1)}%
                  </td>
                  <td
                    className={`px-6 py-4 font-mono font-semibold ${
                      row.cumulativeBalance >= 0
                        ? "text-foreground"
                        : "text-destructive"
                    }`}
                  >
                    {row.cumulativeBalance.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Card>
    </AppLayout>
  );
};

export default Reports;
