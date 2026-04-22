export type TransactionType = "income" | "expense";
export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investments"
  | "food"
  | "transport"
  | "housing"
  | "utilities"
  | "entertainment"
  | "health"
  | "education"
  | "shopping"
  | "other";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string; // Agora é uma string direta (nome da categoria)
  paymentType?: string;
  date: string;
  createdAt?: string;
  tags: string[];
}

export interface Investment {
  id: string;
  name: string;
  type: string; // 'stock' | 'fund' | 'crypto' | 'fixed_income' | 'real_estate'
  amount: number;
  quantity?: number;
  date: string;
}

export interface InvestmentSummary {
  name: string;
  type: string;
  totalInvested: number;
  totalQuantity: number;
}

export interface MonthlyReport {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyDeposit: number;
  deadline: string;
  category?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  isApproved: boolean;
}
