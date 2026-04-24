import { BadRequestException, Injectable } from '@nestjs/common';
import type { Goal } from '@prisma/client';
import {
  formatDateOnlyFromDbDate,
  parseDateOnlyToUtcNoon,
} from '../common/date-only';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateGoalDto } from './dto/create-goal.dto';
import type { UpdateGoalDto } from './dto/update-goal.dto';

type GoalWithDateString = Omit<Goal, 'deadline'> & { deadline: string };

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  private serializeGoalDate<T extends { deadline: Date }>(goal: T) {
    return {
      ...goal,
      deadline: formatDateOnlyFromDbDate(goal.deadline),
    };
  }

  async create(
    userId: string,
    createGoalDto: CreateGoalDto,
  ): Promise<GoalWithDateString> {
    const created = await this.prisma.goal.create({
      data: {
        ...createGoalDto,
        deadline: parseDateOnlyToUtcNoon(createGoalDto.deadline),
        userId,
      },
    });

    return this.serializeGoalDate(created);
  }

  async findAll(userId: string): Promise<GoalWithDateString[]> {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });

    return goals.map((goal) => this.serializeGoalDate(goal));
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<GoalWithDateString | null> {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    return goal ? this.serializeGoalDate(goal) : null;
  }

  async update(id: string, userId: string, updateGoalDto: UpdateGoalDto) {
    await this.prisma.goal.findFirstOrThrow({
      where: { id, userId },
    });

    const { deadline, ...rest } = updateGoalDto;

    const updated = await this.prisma.goal.update({
      where: { id },
      data: {
        ...rest,
        ...(deadline && { deadline: parseDateOnlyToUtcNoon(deadline) }),
      },
    });

    return this.serializeGoalDate(updated);
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

    const goal = await this.prisma.goal.findFirstOrThrow({
      where: { id, userId },
    });

    return await this.prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId,
          description: `Aporte: ${goal.name}`,
          amount: amount,
          type: 'expense',
          category: 'Investimentos',
          date: new Date(),
          goalId: id,
        },
      });

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
