import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpendingLimitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Os valores de limite cadastrados representam um orçamento MENSAL.
   * Quando o filtro do relatório está em modo "Ano" (sem mês selecionado),
   * o gasto somado é o do ano inteiro, então o limite usado para calcular
   * o percentual também precisa ser anualizado (x12) para a comparação
   * fazer sentido — senão qualquer categoria apareceria sempre "estourada".
   */
  async findAll(userId: string, year?: number, month?: number) {
    await this.categoriesService.ensureDefaultCategories(userId);

    let startDate: Date;
    let endDate: Date;
    let periodMultiplier: number;

    if (year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
      periodMultiplier = 1;
    } else if (year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      periodMultiplier = 12;
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      periodMultiplier = 1;
    }

    const [expenseCategories, limits, spentAgg] = await Promise.all([
      this.prisma.category.findMany({
        // Categorias marcadas como transferência (ex: aportes em investimentos)
        // não representam gasto real, então não fazem sentido num orçamento.
        where: { userId, type: 'expense', isTransfer: false },
        orderBy: { name: 'asc' },
      }),
      this.prisma.spendingLimit.findMany({ where: { userId } }),
      this.prisma.transaction.groupBy({
        by: ['category'],
        where: {
          userId,
          type: 'expense',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const limitMap = new Map(
      limits.map((l) => [l.categoryName, Number(l.limitAmount)]),
    );
    const spentMap = new Map(
      spentAgg.map((s) => [s.category, Number(s._sum.amount ?? 0)]),
    );

    return expenseCategories.map((category) => {
      const limitAmount = limitMap.get(category.name) ?? 0;
      const periodLimitAmount = limitAmount * periodMultiplier;
      const spentAmount = spentMap.get(category.name) ?? 0;
      const percent =
        periodLimitAmount > 0 ? (spentAmount / periodLimitAmount) * 100 : 0;

      return {
        categoryName: category.name,
        limitAmount,
        periodLimitAmount,
        spentAmount,
        percent,
      };
    });
  }

  async upsert(userId: string, categoryName: string, limitAmount: number) {
    const category = await this.prisma.category.findFirst({
      where: { userId, type: 'expense', name: categoryName },
    });
    if (!category) {
      throw new NotFoundException('Categoria de despesa não encontrada.');
    }

    return this.prisma.spendingLimit.upsert({
      where: { userId_categoryName: { userId, categoryName } },
      create: { userId, categoryName, limitAmount },
      update: { limitAmount },
    });
  }
}
