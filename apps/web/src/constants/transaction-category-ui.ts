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
  Investimento: "📈",
  "Outros (Receita)": "💰",
  Freelance: "💰",
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
  investimentos: "Investimento",
  investimento: "Investimento",
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

// Mesma biblioteca de ícones já usada nas categorias padrão (constante acima),
// reaproveitada como opções selecionáveis ao criar/editar uma categoria.
export const CATEGORY_ICON_OPTIONS: string[] = Array.from(
  new Set([...Object.values(TRANSACTION_CATEGORY_ICONS), "🏷️"]),
);

export const DEFAULT_CATEGORY_ICON = "🏷️";

// Ícone efetivo de uma categoria: prioriza o ícone escolhido/salvo pelo
// usuário e só recorre à heurística por nome (acima) quando não há um
// definido — categorias padrão antigas, por exemplo.
export const resolveCategoryIcon = (
  category: { name: string; icon?: string | null },
  type?: TransactionType,
) => category.icon || getTransactionCategoryIcon(category.name, type);

export const buildCategoryIconMap = (
  categories: { name: string; icon?: string | null; type: TransactionType }[],
): Record<string, string> => {
  const map: Record<string, string> = {};
  categories.forEach((category) => {
    map[category.name] = resolveCategoryIcon(category, category.type);
  });
  return map;
};
