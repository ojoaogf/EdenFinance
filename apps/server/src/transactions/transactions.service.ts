import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { ...data } = createTransactionDto;

    return await this.prisma.transaction.create({
      data: {
        ...data,
        userId, // Conecta ao usuário autenticado
        date: new Date(data.date), // Converte string para Date
      },
    });
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

    return await this.prisma.transaction.findMany({
      where, // Filtra apenas transações do usuário
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    return await this.prisma.transaction.findFirst({
      where: { id, userId }, // Garante que pertence ao usuário
    });
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

    return await this.prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
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
