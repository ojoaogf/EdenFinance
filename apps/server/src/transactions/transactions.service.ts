import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  formatDateOnlyFromDbDate,
  parseDateOnlyToUtcNoon,
} from '../common/date-only';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { normalizePaymentType } from './payment-types';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeTransactionDate<T extends { date: Date }>(transaction: T) {
    return {
      ...transaction,
      date: formatDateOnlyFromDbDate(transaction.date),
    };
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { ...data } = createTransactionDto;

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
    await this.prisma.transaction.findFirstOrThrow({
      where: { id, userId },
    });

    const { ...data } = updateTransactionDto;

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

    await this.prisma.transaction.findFirstOrThrow({
      where: { id, userId },
    });

    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
