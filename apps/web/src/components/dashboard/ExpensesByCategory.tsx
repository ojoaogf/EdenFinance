import type { ExpenseByCategory } from "@/hooks/use-reports";
import { ExpensesByCategorySection } from "./ExpensesByCategorySection";

interface ExpensesByCategoryProps {
  data: ExpenseByCategory[];
}

export function ExpensesByCategory({ data }: ExpensesByCategoryProps) {
  return (
    <ExpensesByCategorySection
      data={data}
      variant="donut"
      title="Despesas por Categoria"
      description="Distribuição do mês atual"
      emptyMessage="Nenhuma despesa registrada."
    />
  );
}
