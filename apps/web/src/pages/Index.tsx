import { CashFlowSection } from "@/components/dashboard/CashFlowSection";
import { ExpensesByCategorySection } from "@/components/dashboard/ExpensesByCategorySection";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { InvestmentSummary } from "@/components/dashboard/InvestmentSummary";
import { KPICard } from "@/components/dashboard/KPICard";
import { KPICardsSection } from "@/components/dashboard/KPICardsSection";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGoals } from "@/hooks/use-goals";
import { useInvestmentSummary } from "@/hooks/use-investments";
import {
  useExpensesByCategory,
  useMonthlyEvolution,
} from "@/hooks/use-reports";
import { useTransactions } from "@/hooks/use-transactions";
import {
  filterMonthlyReportsByPeriod,
  filterTransactionsByPeriod,
} from "@/utils/report-period";
import { toLocalDateFromDateOnly } from "@/utils/date";
import { CalendarDays, PiggyBank } from "lucide-react";
import { useMemo } from "react";

const isFeatureEnabled = (value: unknown) => value === "true" || value === "1";

const Index = () => {
  const goalsEnabled = isFeatureEnabled(import.meta.env.VITE_FEATURE_GOALS);
  const investmentsEnabled = isFeatureEnabled(
    import.meta.env.VITE_FEATURE_INVESTMENTS,
  );
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();

  const { data: expensesByCategory = [], isLoading: isLoadingExpenses } =
    useExpensesByCategory(currentYear, currentMonth);
  const { data: monthlyEvolution = [], isLoading: isLoadingEvolution } =
    useMonthlyEvolution(currentYear);
  const { data: investmentSummary = [], isLoading: isLoadingInvestments } =
    useInvestmentSummary();
  const { data: goals = [], isLoading: isLoadingGoals } = useGoals();
  const { data: transactionsAll = [] } = useTransactions();
  const currentMonthReports = useMemo(
    () =>
      filterMonthlyReportsByPeriod(monthlyEvolution, {
        viewMode: "month",
        year: currentYear,
        month: currentMonth,
      }),
    [monthlyEvolution, currentYear, currentMonth],
  );

  // Calculate total investments from summary
  const totalInvestments = investmentsEnabled
    ? investmentSummary.reduce(
        (sum, item) => sum + Number(item.totalInvested),
        0,
      )
    : 0;

  // TODO: Add percentage change logic when backend supports comparison with previous month
  const recentExtended = filterTransactionsByPeriod(transactionsAll, {
    viewMode: "month",
    year: currentYear,
    month: currentMonth,
  })
    .slice()
    .sort(
      (a, b) =>
        toLocalDateFromDateOnly(b.date).getTime() -
        toLocalDateFromDateOnly(a.date).getTime(),
    )
    .slice(0, 8);

  return (
    <AppLayout
      title="Resumo Financeiro"
      subtitle="Bem-vindo de volta ao seu terminal de liquidez."
      actions={
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          {new Date()
            .toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })
            .toUpperCase()}
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className={investmentsEnabled ? "lg:col-span-3" : "lg:col-span-4"}>
          <KPICardsSection
            monthlyReports={monthlyEvolution}
            filteredMonthlyReports={currentMonthReports}
            viewMode="month"
            year={currentYear}
            month={currentMonth}
          />
        </div>
        {investmentsEnabled && (
          <KPICard
            title="Investimentos"
            value={`R$ ${totalInvestments.toLocaleString("pt-BR")}`}
            change={0}
            changeLabel="total acumulado"
            icon={PiggyBank}
            variant="success"
          />
        )}
      </div>

      {/* Fluxo de Caixa (Elemento Principal) */}
      <div className="mb-6">
        <CashFlowSection monthlyReports={monthlyEvolution} year={currentYear} />
      </div>

      {/* Seção Secundária 50/50 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpensesByCategorySection
          data={expensesByCategory}
          variant="list"
          title="Gastos por Categoria"
          emptyMessage="Nenhuma despesa registrada."
        />
        <RecentTransactions transactions={recentExtended} />
      </div>

      {/* Blocos Complementares */}
      {(goalsEnabled || investmentsEnabled) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {investmentsEnabled && (
            <InvestmentSummary summary={investmentSummary} />
          )}
          {goalsEnabled && <GoalsProgress goals={goals} />}
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
