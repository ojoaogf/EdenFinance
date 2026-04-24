import { CashFlowSection } from "@/components/dashboard/CashFlowSection";
import { ExpensesByCategorySection } from "@/components/dashboard/ExpensesByCategorySection";
import { KPICardsSection } from "@/components/dashboard/KPICardsSection";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useExpensesByCategory,
  useMonthlyEvolution,
} from "@/hooks/use-reports";
import { useTransactions } from "@/hooks/use-transactions";
import { api } from "@/lib/api";
import type { Transaction } from "@/types/finance";
import { generateExcelReport } from "@/utils/excel-exporter";
import {
  filterMonthlyReportsByPeriod,
  filterTransactionsByPeriod,
} from "@/utils/report-period";
import { Table2 } from "lucide-react";
import { useMemo, useState } from "react";

const Reports = () => {
  const [viewMode, setViewMode] = useState<"year" | "month">("year");
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
  const { data: transactions = [] } = useTransactions();

  const filteredMonthlyReports = useMemo(
    () =>
      filterMonthlyReportsByPeriod(monthlyReports, { viewMode, year, month }),
    [monthlyReports, viewMode, year, month],
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

    generateExcelReport(transactions, periodLabel);
  };

  const periodTransactions = useMemo(
    () =>
      filterTransactionsByPeriod(transactions, { viewMode, year, month }, type),
    [transactions, viewMode, year, month, type],
  );

  const incomeSources = useMemo(() => {
    const grouped = periodTransactions
      .filter((tx) => tx.type === "income")
      .reduce<Record<string, number>>((acc, tx) => {
        const key = tx.category || "Outros";
        acc[key] = (acc[key] ?? 0) + Number(tx.amount);
        return acc;
      }, {});

    const total = Object.values(grouped).reduce((sum, value) => sum + value, 0);
    const entries = Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    return { total, entries };
  }, [periodTransactions]);

  const operationalRows = useMemo(() => {
    return [...filteredMonthlyReports]
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 4)
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
          status: balance >= 0 ? "CONCLUÍDO" : "ALERTA",
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
      title="Relatórios de Patrimônio"
      subtitle="Análises detalhadas da sua performance financeira"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Table2 className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </>
      }
    >
      <Card className="mb-6 p-4">
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
      <div className="mb-8">
        <CashFlowSection
          monthlyReports={monthlyReports}
          viewMode={viewMode}
          year={year}
          month={month}
          title="Fluxo de Caixa Mensal"
          description="Análise histórica do último semestre"
          height={330}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpensesByCategorySection
          data={expensesByCategory}
          variant="list"
          title="Gastos por Categoria"
          emptyMessage="Nenhuma despesa registrada."
        />
        <Card className="p-6">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg">Fontes de Renda</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {incomeSources.total === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem receitas no período selecionado.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border-[12px] border-primary/20">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold text-primary">
                      {incomeSources.entries[0]?.percent.toFixed(0) ?? 0}%
                    </p>
                    <p className="terminal-label">Principal</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {incomeSources.entries.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.percent.toFixed(1)}%
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {item.amount.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <h3 className="terminal-label text-foreground">Resumo Operacional</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary"
          >
            Ver detalhes
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="terminal-label text-left">
                <th className="px-6 py-3">Período</th>
                <th className="px-6 py-3 text-right">Receita Bruta</th>
                <th className="px-6 py-3 text-right">Despesas</th>
                <th className="px-6 py-3 text-right">Economia</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {operationalRows.map((row) => (
                <tr key={row.month} className="border-t border-border/40">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {formatMonthLabel(row.month)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-foreground">
                    {row.income.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-chart-2">
                    {row.expenses.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-chart-1">
                    {row.margin.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
};

export default Reports;
