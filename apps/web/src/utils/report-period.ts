import type { MonthlyReport, Transaction, TransactionType } from "@/types/finance";

export type ReportViewMode = "year" | "month";
export type ReportTypeFilter = "all" | TransactionType;

export interface ReportPeriod {
  viewMode: ReportViewMode;
  year: string;
  month: string;
}

export const getMonthKey = (year: string, month: string) =>
  `${year}-${month.padStart(2, "0")}`;

export const filterMonthlyReportsByPeriod = (
  monthlyReports: MonthlyReport[],
  period: ReportPeriod,
) => {
  if (period.viewMode !== "month") return monthlyReports;

  const monthKey = getMonthKey(period.year, period.month);
  return monthlyReports.filter((report) => report.month === monthKey);
};

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: ReportPeriod,
  type: ReportTypeFilter = "all",
) => {
  const selectedMonth = period.month.padStart(2, "0");

  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    const txYear = String(date.getFullYear());
    const txMonth = String(date.getMonth() + 1).padStart(2, "0");

    if (txYear !== period.year) return false;
    if (period.viewMode === "month" && txMonth !== selectedMonth) return false;
    if (type !== "all" && transaction.type !== type) return false;
    return true;
  });
};

