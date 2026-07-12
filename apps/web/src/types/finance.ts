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
  installmentPlanId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
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
  invested: number;
  cumulativeBalance: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  isTransfer: boolean;
  usageCount: number;
}

export interface SpendingLimit {
  categoryName: string;
  limitAmount: number;
  periodLimitAmount: number;
  spentAmount: number;
  percent: number;
}

export interface InstallmentPlan {
  id: string;
  description: string;
  category: string;
  paymentType?: string;
  installmentAmount: number;
  totalInstallments: number;
  startDate: string;
  paidInstallments: number;
  remainingInstallments: number;
  remainingAmount: number;
  nextDueDate: string | null;
  status: "ativo" | "concluido";
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

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  isApproved: boolean;
}
