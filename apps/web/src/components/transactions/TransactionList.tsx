import {
  getCanonicalTransactionCategoryName,
  getTransactionCategoryIcon,
} from "@/constants/transaction-category-ui";
import { Transaction } from "@/types/finance";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TransactionCard } from "./TransactionCard";

interface TransactionListProps {
  transactions: Transaction[];
  categoryIcons: Record<string, string>;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  categoryIcons,
  onDelete,
  onEdit,
}: TransactionListProps) {
  // Group by Date
  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    },
    {} as Record<string, Transaction[]>,
  );

  // Sort dates descending
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const getCategoryName = (t: Transaction) =>
    getCanonicalTransactionCategoryName(t.category, t.type);

  const getCategoryIcon = (t: Transaction) => {
    const icon = getTransactionCategoryIcon(t.category, t.type);
    return icon || categoryIcons[getCategoryName(t)] || "🏷️";
  };

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => {
        const dayTransactions = groupedTransactions[date];
        const dayTotal = dayTransactions.reduce(
          (acc, t) =>
            acc + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
          0,
        );

        const dateObj = parseISO(date);
        let dateLabel = format(dateObj, "dd 'de' MMMM, yyyy", { locale: ptBR });
        if (isToday(dateObj)) dateLabel = "Hoje, " + dateLabel;
        if (isYesterday(dateObj)) dateLabel = "Ontem, " + dateLabel;

        return (
          <div key={date} className="space-y-4">
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b">
              <h3 className="font-semibold text-lg capitalize">{dateLabel}</h3>
              <span
                className={
                  dayTotal >= 0
                    ? "text-emerald-600 font-medium"
                    : "text-rose-600 font-medium"
                }
              >
                {dayTotal >= 0 ? "+" : ""}
                {dayTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <div className="grid gap-3">
              {dayTransactions.map((transaction) => {
                const catName = getCategoryName(transaction);
                return (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    categoryName={catName}
                    categoryIcon={getCategoryIcon(transaction)}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
