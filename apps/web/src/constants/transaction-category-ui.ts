import type { TransactionType } from "@/types/finance";

export const TRANSACTION_CATEGORY_ICONS: Record<string, string> = {
  Ministério: "⛪",
  Alimentação: "🍽️",
  Compras: "🛍️",
  Moradia: "🏠",
  Transporte: "🚗",
  Educação: "📚",
  Saúde: "🏥",
  Entretenimento: "🍿",
  Lazer: "🎉",
  Viagem: "✈️",
  Outros: "📦",
  Salário: "💸",
  Investimentos: "📈",
  "Outros (Receita)": "💰",
  Freelance: "💰",
  VEE: "💰",
};

const CATEGORY_ALIASES: Record<string, string> = {
  ministerio: "Ministério",
  alimentacao: "Alimentação",
  mercado: "Alimentação",
  restaurante: "Alimentação",
  compras: "Compras",
  shopping: "Compras",
  moradia: "Moradia",
  aluguel: "Moradia",
  casa: "Moradia",
  transporte: "Transporte",
  uber: "Transporte",
  gasolina: "Transporte",
  educacao: "Educação",
  escola: "Educação",
  curso: "Educação",
  saude: "Saúde",
  farmacia: "Saúde",
  medico: "Saúde",
  entretenimento: "Entretenimento",
  lazer: "Lazer",
  cinema: "Entretenimento",
  viagem: "Viagem",
  salario: "Salário",
  pagamento: "Salário",
  freelance: "Freelance",
  freela: "Freelance",
  projeto: "Freelance",
  investimentos: "Investimentos",
  investimento: "Investimentos",
  vee: "VEE",
  outros: "Outros",
};

const normalizeString = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const getCanonicalTransactionCategoryName = (
  category?: string,
  type?: TransactionType,
) => {
  if (!category) {
    return type === "income" ? "Outros (Receita)" : "Outros";
  }

  if (TRANSACTION_CATEGORY_ICONS[category]) return category;

  const normalized = normalizeString(category);
  if (CATEGORY_ALIASES[normalized]) return CATEGORY_ALIASES[normalized];

  for (const [keyword, canonical] of Object.entries(CATEGORY_ALIASES)) {
    if (normalized.includes(keyword)) return canonical;
  }

  return category;
};

export const getTransactionCategoryIcon = (
  category?: string,
  type?: TransactionType,
) => {
  const canonical = getCanonicalTransactionCategoryName(category, type);
  return TRANSACTION_CATEGORY_ICONS[canonical] || "🏷️";
};

