export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

export const CATEGORIES: Category[] = [
  // Receitas
  { id: "income-1", name: "Salário", type: "income" },
  { id: "income-2", name: "VEE", type: "income" },
  { id: "income-3", name: "Freelance", type: "income" },
  { id: "income-4", name: "Outros", type: "income" },

  // Despesas
  { id: "expense-1", name: "Ministério", type: "expense" },
  { id: "expense-2", name: "Alimentação", type: "expense" },
  { id: "expense-3", name: "Moradia", type: "expense" },
  { id: "expense-4", name: "Transporte", type: "expense" },
  { id: "expense-5", name: "Educação", type: "expense" },
  { id: "expense-6", name: "Saúde", type: "expense" },
  { id: "expense-7", name: "Lazer", type: "expense" },
  { id: "expense-8", name: "Entretenimento", type: "expense" },
  { id: "expense-9", name: "Compras", type: "expense" },
  { id: "expense-10", name: "Viagem", type: "expense" },
  { id: "expense-11", name: "Outros", type: "expense" },
];
