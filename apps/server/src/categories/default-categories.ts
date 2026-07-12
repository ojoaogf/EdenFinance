export interface DefaultCategory {
  name: string;
  type: 'income' | 'expense';
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Salário', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Outros', type: 'income' },
  { name: 'Ministério', type: 'expense' },
  { name: 'Alimentação', type: 'expense' },
  { name: 'Moradia', type: 'expense' },
  { name: 'Transporte', type: 'expense' },
  { name: 'Educação', type: 'expense' },
  { name: 'Saúde', type: 'expense' },
  { name: 'Lazer', type: 'expense' },
  { name: 'Entretenimento', type: 'expense' },
  { name: 'Compras', type: 'expense' },
  { name: 'Viagem', type: 'expense' },
  { name: 'Investimento', type: 'expense' },
];

export const DEFAULT_SPENDING_LIMITS: Record<string, number> = {
  Educação: 100,
  Entretenimento: 270,
  Ministério: 1775,
  Moradia: 2500,
  Transporte: 350,
  Alimentação: 1300,
  Outros: 400,
  Investimento: 4500,
  Compras: 700,
  Lazer: 300,
  Saúde: 500,
};
