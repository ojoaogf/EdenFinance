import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CategoriesService } from '../categories/categories.service';
import {
  formatDateOnlyFromDbDate,
  formatMonthKeyUtc,
  getClampedMonthDateUtc,
  getCurrentMonthKeyUtc,
  nextMonthKey,
  parseDateOnlyToUtcNoon,
} from '../common/date-only';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { normalizePaymentType } from './payment-types';

const FIXED_EXPENSE_TAG = 'Fixo';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private serializeTransactionDate<T extends { date: Date }>(transaction: T) {
    return {
      ...transaction,
      date: formatDateOnlyFromDbDate(transaction.date),
    };
  }

  private async assertValidCategory(
    userId: string,
    category: string,
    type: string,
  ) {
    await this.categoriesService.ensureDefaultCategories(userId);

    const exists = await this.prisma.category.findFirst({
      where: { userId, name: category, type },
    });

    if (!exists) {
      throw new BadRequestException(
        `Categoria "${category}" não existe para o tipo "${type}". Cadastre-a em Categorias antes de usá-la.`,
      );
    }
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { ...data } = createTransactionDto;

    await this.assertValidCategory(userId, data.category, data.type);

    const created = await this.prisma.transaction.create({
      data: {
        ...data,
        amount: Number(Number(data.amount).toFixed(2)),
        paymentType: normalizePaymentType(data.paymentType),
        userId, // Conecta ao usuário autenticado
        // Date-only fields must not be created at 00:00Z to avoid timezone day shift.
        date: parseDateOnlyToUtcNoon(data.date),
      },
    });

    return this.serializeTransactionDate(created);
  }

  async findAll(userId: string, year?: number, month?: number, type?: string) {
    // Gatilho principal do "catch-up" de despesas fixas: a tela de Transações
    // é a mais visitada, então é o ponto mais confiável para manter os
    // lançamentos em dia (o Dashboard também aciona isso, de forma redundante).
    await this.generatePendingFixedOccurrences(userId);

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(type && (type === 'income' || type === 'expense') ? { type } : {}),
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

    const transactions = await this.prisma.transaction.findMany({
      where, // Filtra apenas transações do usuário
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return transactions.map((transaction) =>
      this.serializeTransactionDate(transaction),
    );
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId }, // Garante que pertence ao usuário
    });

    return transaction ? this.serializeTransactionDate(transaction) : null;
  }

  async update(
    userId: string,
    id: string,
    updateTransactionDto: Partial<CreateTransactionDto>,
  ) {
    // Verifica se a transação existe e pertence ao usuário
    const existing = await this.prisma.transaction.findFirstOrThrow({
      where: { id, userId },
    });

    const { ...data } = updateTransactionDto;

    if (data.category !== undefined) {
      await this.assertValidCategory(
        userId,
        data.category,
        data.type ?? existing.type,
      );
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        amount:
          typeof data.amount === 'number'
            ? Number(Number(data.amount).toFixed(2))
            : undefined,
        paymentType:
          data.paymentType === undefined
            ? undefined
            : normalizePaymentType(data.paymentType),
        date: data.date ? parseDateOnlyToUtcNoon(data.date) : undefined,
      },
    });

    return this.serializeTransactionDate(updated);
  }

  async remove(userId: string, id: string) {
    // Verifica existência e propriedade antes de deletar
    const existing = await this.prisma.transaction.findFirstOrThrow({
      where: { id, userId },
    });

    const deleted = await this.prisma.transaction.delete({
      where: { id },
    });

    if (
      existing.type === 'expense' &&
      existing.tags.includes(FIXED_EXPENSE_TAG)
    ) {
      await this.recordFixedExpenseSkipIfNeeded(userId, existing);
    }

    return deleted;
  }

  /**
   * Se a transação excluída era a única ocorrência de uma despesa fixa
   * naquele mês, registra que esse mês foi pulado de propósito — sem isso,
   * a próxima geração automática recriaria a mesma transação, já que ela
   * não teria como distinguir "mês nunca lançado" de "mês excluído".
   */
  private async recordFixedExpenseSkipIfNeeded(
    userId: string,
    deletedTransaction: { description: string; category: string; date: Date },
  ) {
    const monthKey = formatMonthKeyUtc(deletedTransaction.date);

    const stillExists = await this.prisma.transaction.findFirst({
      where: {
        userId,
        type: 'expense',
        description: deletedTransaction.description,
        category: deletedTransaction.category,
        tags: { has: FIXED_EXPENSE_TAG },
        date: {
          gte: getClampedMonthDateUtc(monthKey, 1),
          lte: getClampedMonthDateUtc(monthKey, 31),
        },
      },
    });

    if (stillExists) return;

    await this.prisma.fixedExpenseSkip.upsert({
      where: {
        userId_description_category_monthKey: {
          userId,
          description: deletedTransaction.description,
          category: deletedTransaction.category,
          monthKey,
        },
      },
      create: {
        userId,
        description: deletedTransaction.description,
        category: deletedTransaction.category,
        monthKey,
      },
      update: {},
    });
  }

  /**
   * Gera automaticamente os lançamentos dos meses pendentes para despesas
   * marcadas com a etiqueta "Fixo" no ambiente normal de Transações — sem
   * nenhuma entidade ou tela nova. A identidade de uma despesa fixa é a
   * combinação (descrição + categoria); a ocorrência mais recente de cada
   * uma vira o "molde" (valor, forma de pagamento, dia do mês) para gerar
   * os meses que faltam, inclusive vários de uma vez se o usuário ficou um
   * tempo sem abrir o app. É idempotente: uma vez que exista uma ocorrência
   * no mês corrente (gerada ou lançada manualmente), nada é duplicado.
   *
   * Se um mês foi excluído de propósito (ver FixedExpenseSkip), a cadeia
   * para exatamente ali — nenhum mês seguinte é gerado até que o usuário
   * lance manualmente uma nova transação "Fixo" para a mesma despesa,
   * retomando a automação a partir dali.
   */
  async generatePendingFixedOccurrences(userId: string) {
    const currentMonthKey = getCurrentMonthKeyUtc();

    const fixedTransactions = await this.prisma.transaction.findMany({
      where: { userId, type: 'expense', tags: { has: FIXED_EXPENSE_TAG } },
      orderBy: { date: 'desc' },
    });

    if (fixedTransactions.length === 0) return;

    const latestByKey = new Map<string, (typeof fixedTransactions)[number]>();
    for (const transaction of fixedTransactions) {
      const key = `${transaction.description}::${transaction.category}`;
      if (!latestByKey.has(key)) {
        latestByKey.set(key, transaction);
      }
    }

    const pendingAnchors = Array.from(latestByKey.values()).filter(
      (anchor) => formatMonthKeyUtc(anchor.date) < currentMonthKey,
    );

    if (pendingAnchors.length === 0) return;

    const skips = await this.prisma.fixedExpenseSkip.findMany({
      where: { userId },
    });
    const skipSet = new Set(
      skips.map((s) => `${s.description}::${s.category}::${s.monthKey}`),
    );

    // Monta todos os lançamentos pendentes em memória e grava em uma única
    // chamada em lote (createMany), em vez de uma transação interativa com
    // um create por mês/despesa — isso evita estourar o timeout padrão do
    // Prisma quando há muitas despesas fixas pendentes de uma vez.
    const rowsToCreate: Prisma.TransactionCreateManyInput[] = [];

    for (const anchor of pendingAnchors) {
      const dayOfMonth = anchor.date.getUTCDate();
      const amount = Number(anchor.amount);
      const groupKey = `${anchor.description}::${anchor.category}`;
      let monthKey = formatMonthKeyUtc(anchor.date);

      while (monthKey < currentMonthKey) {
        const nextKey = nextMonthKey(monthKey);

        if (skipSet.has(`${groupKey}::${nextKey}`)) {
          break;
        }

        rowsToCreate.push({
          userId,
          description: anchor.description,
          amount,
          type: 'expense',
          category: anchor.category,
          paymentType: anchor.paymentType,
          date: getClampedMonthDateUtc(nextKey, dayOfMonth),
          tags: [FIXED_EXPENSE_TAG],
        });

        monthKey = nextKey;
      }
    }

    if (rowsToCreate.length === 0) return;

    await this.prisma.transaction.createMany({ data: rowsToCreate });
  }
}
