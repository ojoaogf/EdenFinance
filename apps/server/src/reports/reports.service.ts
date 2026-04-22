import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(userId: string) {
    // Agregação de Receitas
    const incomeAgg = await this.prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId,
        type: 'income',
      },
    });

    // Agregação de Despesas
    const expenseAgg = await this.prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId,
        type: 'expense',
      },
    });

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpense = Number(expenseAgg._sum.amount || 0);
    const balance = totalIncome - totalExpense;

    // Últimas 5 transações
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
    });

    return {
      balance,
      totalIncome,
      totalExpense,
      recentTransactions,
    };
  }

  async getExpensesByCategory(userId: string, year?: number, month?: number) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      type: 'expense',
    };

    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = new Date(year, month ? month : 12, 0);
      endDate.setHours(23, 59, 59, 999);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const expenses = await this.prisma.transaction.groupBy({
      by: ['category'],
      _sum: {
        amount: true,
      },
      where,
    });

    // Mapear resultado
    return expenses.map((item) => {
      return {
        category: item.category,
        amount: Number(item._sum.amount),
      };
    });
  }

  async getMonthlyEvolution(
    userId: string,
    year?: number,
    type?: string,
    months?: number,
  ) {
    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (type) {
      where.type = type;
    }

    // Se ano não for informado, pega os últimos N meses (default: 6)
    let startDate: Date;
    let endDate: Date;

    if (year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    } else {
      const now = new Date();
      const monthsToLoad =
        months && Number.isFinite(months) && months > 0 ? months : 6;
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - (monthsToLoad - 1),
        1,
      );
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    where.date = {
      gte: startDate,
      lte: endDate,
    };

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    // Agrupar por mês
    const monthlyData = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const monthKey = t.date.toISOString().slice(0, 7); // YYYY-MM
      const current = monthlyData.get(monthKey) || { income: 0, expense: 0 };

      if (t.type === 'income') {
        current.income += Number(t.amount);
      } else {
        current.expense += Number(t.amount);
      }

      monthlyData.set(monthKey, current);
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => {
        const income = data.income;
        const expenses = data.expense;
        const balance = income - expenses;
        const savingsRate = income > 0 ? (balance / income) * 100 : 0;

        return {
          month,
          income,
          expenses,
          balance,
          savingsRate,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
