import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { MonthlyReport, Transaction } from "../types/finance";

export interface DashboardSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: Transaction[];
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const { data } = await api.get<DashboardSummary>("/reports/dashboard");
      return data;
    },
  });
}

export function useExpensesByCategory(year?: string, month?: string) {
  return useQuery({
    queryKey: ["expenses-by-category", year, month],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year && year !== "all") params.append("year", year);
      if (month && month !== "all") params.append("month", month);

      const { data } = await api.get<ExpenseByCategory[]>(
        `/reports/expenses-by-category?${params.toString()}`,
      );
      return data;
    },
  });
}

export function useMonthlyEvolution(year?: string, type?: string, months?: number) {
  return useQuery({
    queryKey: ["monthly-evolution", year, type, months],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year && year !== "all") params.append("year", year);
      if (type && type !== "all") params.append("type", type);
      if ((!year || year === "all") && months && Number.isFinite(months) && months > 0) {
        params.append("months", months.toString());
      }

      const { data } = await api.get<MonthlyReport[]>(
        `/reports/monthly-evolution?${params.toString()}`,
      );
      return data;
    },
  });
}
