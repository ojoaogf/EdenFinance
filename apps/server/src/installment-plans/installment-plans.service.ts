import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import {
  formatDateOnlyFromDbDate,
  getEndOfTodayUtc,
  parseDateOnlyToUtcNoon,
} from '../common/date-only';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePaymentType } from '../transactions/payment-types';
import type { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto';
import type { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';

@Injectable()
export class InstallmentPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private addMonthsUtc(date: Date, months: number) {
    const result = new Date(date.getTime());
    result.setUTCMonth(result.getUTCMonth() + months);
    return result;
  }

  private async assertValidExpenseCategory(userId: string, category: string) {
    await this.categoriesService.ensureDefaultCategories(userId);

    const exists = await this.prisma.category.findFirst({
      where: { userId, name: category, type: 'expense' },
    });

    if (!exists) {
      throw new BadRequestException(
        `Categoria "${category}" não existe para despesas. Cadastre-a em Categorias antes de usá-la.`,
      );
    }
  }

  async create(userId: string, dto: CreateInstallmentPlanDto) {
    await this.assertValidExpenseCategory(userId, dto.category);

    const startDate = parseDateOnlyToUtcNoon(dto.startDate);
    const installmentAmount = Number(dto.installmentAmount.toFixed(2));
    const paymentType = normalizePaymentType(dto.paymentType);

    const plan = await this.prisma.$transaction(async (tx) => {
      const createdPlan = await tx.installmentPlan.create({
        data: {
          userId,
          description: dto.description,
          category: dto.category,
          paymentType,
          installmentAmount,
          totalInstallments: dto.totalInstallments,
          startDate,
        },
      });

      const installments = Array.from(
        { length: dto.totalInstallments },
        (_, i) => ({
          userId,
          description: `${dto.description} (${i + 1}/${dto.totalInstallments})`,
          amount: installmentAmount,
          type: 'expense',
          category: dto.category,
          paymentType,
          date: this.addMonthsUtc(startDate, i),
          tags: [] as string[],
          installmentPlanId: createdPlan.id,
          installmentNumber: i + 1,
          installmentTotal: dto.totalInstallments,
        }),
      );

      await tx.transaction.createMany({ data: installments });

      return createdPlan;
    });

    return {
      ...plan,
      installmentAmount: Number(plan.installmentAmount),
      startDate: formatDateOnlyFromDbDate(plan.startDate),
    };
  }

  async findAll(userId: string) {
    const plans = await this.prisma.installmentPlan.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    if (plans.length === 0) return [];

    const installments = await this.prisma.transaction.findMany({
      where: { installmentPlanId: { in: plans.map((p) => p.id) } },
      orderBy: { installmentNumber: 'asc' },
    });

    const cutoff = getEndOfTodayUtc();

    return plans.map((plan) => {
      const planInstallments = installments.filter(
        (t) => t.installmentPlanId === plan.id,
      );
      const paidInstallments = planInstallments.filter((t) => t.date <= cutoff);
      const remainingInstallments = planInstallments.filter(
        (t) => t.date > cutoff,
      );
      const nextDueDate = remainingInstallments[0]?.date;
      const installmentAmount = Number(plan.installmentAmount);

      return {
        id: plan.id,
        description: plan.description,
        category: plan.category,
        paymentType: plan.paymentType,
        installmentAmount,
        totalInstallments: plan.totalInstallments,
        startDate: formatDateOnlyFromDbDate(plan.startDate),
        paidInstallments: paidInstallments.length,
        remainingInstallments: remainingInstallments.length,
        remainingAmount: remainingInstallments.length * installmentAmount,
        nextDueDate: nextDueDate ? formatDateOnlyFromDbDate(nextDueDate) : null,
        status: remainingInstallments.length === 0 ? 'concluido' : 'ativo',
      };
    });
  }

  async update(userId: string, id: string, dto: UpdateInstallmentPlanDto) {
    const plan = await this.prisma.installmentPlan.findFirst({
      where: { id, userId },
    });
    if (!plan) throw new NotFoundException('Parcelamento não encontrado.');

    if (dto.category) {
      await this.assertValidExpenseCategory(userId, dto.category);
    }

    const cutoff = getEndOfTodayUtc();
    const normalizedPaymentType =
      dto.paymentType !== undefined
        ? normalizePaymentType(dto.paymentType)
        : undefined;

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedPlan = await tx.installmentPlan.update({
        where: { id },
        data: {
          description: dto.description,
          category: dto.category,
          paymentType: normalizedPaymentType,
        },
      });

      // Só as parcelas com data futura são atualizadas: as já lançadas
      // preservam os dados originais para não distorcer o histórico.
      const futureInstallments = await tx.transaction.findMany({
        where: { installmentPlanId: id, date: { gt: cutoff } },
      });

      for (const installment of futureInstallments) {
        const suffix =
          installment.installmentNumber && installment.installmentTotal
            ? ` (${installment.installmentNumber}/${installment.installmentTotal})`
            : '';

        await tx.transaction.update({
          where: { id: installment.id },
          data: {
            description: dto.description
              ? `${dto.description}${suffix}`
              : undefined,
            category: dto.category,
            paymentType: normalizedPaymentType,
            tags: { set: ['Parcelamento'] },
          },
        });
      }

      return updatedPlan;
    });

    return {
      ...updated,
      installmentAmount: Number(updated.installmentAmount),
      startDate: formatDateOnlyFromDbDate(updated.startDate),
    };
  }

  async remove(userId: string, id: string) {
    const plan = await this.prisma.installmentPlan.findFirst({
      where: { id, userId },
    });
    if (!plan) throw new NotFoundException('Parcelamento não encontrado.');

    const cutoff = getEndOfTodayUtc();

    return this.prisma.$transaction(async (tx) => {
      // Mantém as parcelas já vencidas/pagas no histórico; remove só as futuras.
      const { count: deletedInstallments } = await tx.transaction.deleteMany({
        where: { installmentPlanId: id, date: { gt: cutoff } },
      });

      await tx.installmentPlan.delete({ where: { id } });

      return { deleted: true, deletedInstallments };
    });
  }
}
