import { BadRequestException, Injectable } from '@nestjs/common';
import type { Goal } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateGoalDto } from './dto/create-goal.dto';
import type { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createGoalDto: CreateGoalDto): Promise<Goal> {
    return await this.prisma.goal.create({
      data: {
        ...createGoalDto,
        deadline: new Date(createGoalDto.deadline),
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Goal[]> {
    return await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Goal | null> {
    return await this.prisma.goal.findFirst({
      where: { id, userId },
    });
  }

  async update(id: string, userId: string, updateGoalDto: UpdateGoalDto) {
    await this.prisma.goal.findFirstOrThrow({
      where: { id, userId },
    });

    const { deadline, ...rest } = updateGoalDto;

    return await this.prisma.goal.update({
      where: { id },
      data: {
        ...rest,
        ...(deadline && { deadline: new Date(deadline) }),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.prisma.goal.findFirstOrThrow({
      where: { id, userId },
    });

    return await this.prisma.goal.delete({
      where: { id },
    });
  }

  async deposit(id: string, userId: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Valor de aporte deve ser maior que zero');
    }

    // 1. Verificar se a meta existe e pertence ao usuário
    const goal = await this.prisma.goal.findFirstOrThrow({
      where: { id, userId },
    });

    // 2. Realizar transação atômica (criar Transaction + atualizar Goal)
    return await this.prisma.$transaction(async (tx) => {
      // Criar a transação de "saída" (investimento na meta)
      await tx.transaction.create({
        data: {
          userId,
          description: `Aporte: ${goal.name}`,
          amount: amount,
          type: 'expense', // Saída do caixa principal
          category: 'Investimentos',
          date: new Date(),
          goalId: id,
        },
      });

      // Atualizar o saldo da meta
      const updatedGoal = await tx.goal.update({
        where: { id },
        data: {
          currentAmount: {
            increment: amount,
          },
        },
      });

      return updatedGoal;
    });
  }
}
