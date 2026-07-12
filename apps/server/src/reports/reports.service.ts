import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getEndOfTodayUtc } from '../common/date-only';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
  ) {}

  /**
   * Categorias marcadas como "transferência" (ex: aportes em investimentos)
   * representam movimentação de dinheiro que o usuário já possui, não gasto
   * ou receita real — por isso ficam de fora de todos os totais/relatórios,
   * embora continuem aparecendo normalmente no extrato de Transações.
   */
  private async getTransferCategoryNames(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId, isTransfer: true },
      select: { name: true },
    });
    return categories.map((c) => c.name);
  }

  async getDashboardSummary(userId: string) {
    // Abrir o Dashboard é o gatilho para "colocar em dia" os lançamentos de
    // despesas fixas (etiqueta "Fixo") dos meses que ficaram pendentes,
    // sem depender de nenhum job agendado.
    await this.transactionsService.generatePendingFixedOccurrences(userId);

    // Parcelas de um parcelamento são lançadas com data futura no momento da
    // criação (para já refletir nos relatórios do mês correspondente), mas não
    // podem contar como dinheiro já recebido/gasto antes da data combinada.
    const cutoff = getEndOfTodayUtc();
    const transferCategoryNames = await this.getTransferCategoryNames(userId);

    // Agregação de Receitas
    const incomeAgg = await this.prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId,
        type: 'income',
        date: { lte: cutoff },
        category: { notIn: transferCategoryNames },
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
        date: { lte: cutoff },
        category: { notIn: transferCategoryNames },
      },
    });

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpense = Number(expenseAgg._sum.amount || 0);
    const balance = totalIncome - totalExpense;

    // Últimas 5 transações (não conta parcelas futuras como "recentes")
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId, date: { lte: cutoff } },
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
    const transferCategoryNames = await this.getTransferCategoryNames(userId);

    const where: Prisma.TransactionWhereInput = {
      userId,
      type: 'expense',
      category: { notIn: transferCategoryNames },
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
    const transferCategoryNames = await this.getTransferCategoryNames(userId);
    const transferCategorySet = new Set(transferCategoryNames);

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

    const [transactions, cumulativeBalanceByMonth] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'asc' },
      }),
      this.getCumulativeBalanceByMonth(userId),
    ]);

    // Agrupar por mês. Transações de categorias de transferência (ex:
    // Investimento) ficam fora de income/expense (não são gasto/receita
    // real) e somam à parte em "invested" — é dinheiro que saiu da conta
    // corrente para outro lugar do próprio patrimônio do usuário, não uma
    // despesa, mas ainda vale acompanhar quanto foi movimentado por mês.
    const monthlyData = new Map<
      string,
      { income: number; expense: number; invested: number }
    >();

    transactions.forEach((t) => {
      const monthKey = t.date.toISOString().slice(0, 7); // YYYY-MM
      const current = monthlyData.get(monthKey) || {
        income: 0,
        expense: 0,
        invested: 0,
      };

      if (transferCategorySet.has(t.category)) {
        if (t.type === 'expense') {
          current.invested += Number(t.amount);
        }
      } else if (t.type === 'income') {
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
          invested: data.invested,
          cumulativeBalance: cumulativeBalanceByMonth.get(month) ?? balance,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Saldo acumulado por mês (o saldo de um mês soma o de todos os meses anteriores),
   * calculado a partir do histórico completo do usuário — independente de filtros de
   * ano/tipo aplicados na tela — para que o "transporte" de saldo entre meses seja
   * sempre correto, sem exigir nenhum lançamento manual.
   *
   * Diferente de income/expenses (que excluem categorias de transferência,
   * como Investimento, por não serem gasto real), aqui TODAS as transações
   * entram — este número representa liquidez de verdade, quanto sobrou na
   * conta corrente. Dinheiro investido saiu da conta, então precisa ser
   * descontado, mesmo continuando patrimônio do usuário.
   */
  private async getCumulativeBalanceByMonth(userId: string) {
    const allTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: { date: true, type: true, amount: true },
    });

    const netByMonth = new Map<string, number>();
    allTransactions.forEach((t) => {
      const monthKey = t.date.toISOString().slice(0, 7);
      const signedAmount =
        t.type === 'income' ? Number(t.amount) : -Number(t.amount);
      netByMonth.set(monthKey, (netByMonth.get(monthKey) ?? 0) + signedAmount);
    });

    const sortedMonths = Array.from(netByMonth.keys()).sort((a, b) =>
      a.localeCompare(b),
    );

    const cumulativeByMonth = new Map<string, number>();
    let runningBalance = 0;
    for (const month of sortedMonths) {
      runningBalance += netByMonth.get(month) ?? 0;
      cumulativeByMonth.set(month, runningBalance);
    }

    return cumulativeByMonth;
  }
}
