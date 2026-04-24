import { Injectable } from '@nestjs/common';
import {
  formatDateOnlyFromDbDate,
  parseDateOnlyToUtcNoon,
} from '../common/date-only';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeInvestmentDate<T extends { date: Date }>(investment: T) {
    return {
      ...investment,
      date: formatDateOnlyFromDbDate(investment.date),
    };
  }

  async create(userId: string, dto: CreateInvestmentDto) {
    const created = await this.prisma.investment.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        amount: dto.amount,
        quantity: dto.quantity,
        date: parseDateOnlyToUtcNoon(dto.date),
      },
    });

    return this.serializeInvestmentDate(created);
  }

  async findAll(userId: string) {
    const investments = await this.prisma.investment.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return investments.map((investment) =>
      this.serializeInvestmentDate(investment),
    );
  }

  async getSummary(userId: string) {
    // Agrupa por Nome e Tipo, somando o Valor Investido e a Quantidade
    const summary = await this.prisma.investment.groupBy({
      by: ['name', 'type'],
      where: { userId },
      _sum: {
        amount: true,
        quantity: true,
      },
    });

    // Formata o retorno para o frontend
    return summary.map((item) => ({
      name: item.name,
      type: item.type,
      totalInvested: item._sum.amount ? Number(item._sum.amount) : 0,
      totalQuantity: Number(item._sum.quantity ?? 0),
    }));
  }

  async remove(userId: string, id: string) {
    await this.prisma.investment.findFirstOrThrow({
      where: { id, userId },
    });

    return this.prisma.investment.delete({
      where: { id },
    });
  }
}
