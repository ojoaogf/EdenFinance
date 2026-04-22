import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateInvestmentDto) {
    return this.prisma.investment.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        amount: dto.amount,
        quantity: dto.quantity,
        date: new Date(dto.date),
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.investment.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
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
