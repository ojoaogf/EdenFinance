import type { MonthlyReport } from "@/types/finance";
import { CashFlowSection } from "./CashFlowSection";

interface RevenueChartProps {
  data: MonthlyReport[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <CashFlowSection
      monthlyReports={data}
      description="Receitas vs Despesas por mês"
    />
  );
}
