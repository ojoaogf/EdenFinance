import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SPENDING_LIMITS,
} from './default-categories';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaultCategories(userId: string) {
    const count = await this.prisma.category.count({ where: { userId } });
    if (count > 0) return;

    await this.prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({ ...category, userId })),
      skipDuplicates: true,
    });

    await this.prisma.spendingLimit.createMany({
      data: Object.entries(DEFAULT_SPENDING_LIMITS).map(
        ([categoryName, limitAmount]) => ({
          userId,
          categoryName,
          limitAmount,
        }),
      ),
      skipDuplicates: true,
    });
  }

  async findAll(userId: string) {
    await this.ensureDefaultCategories(userId);

    const [categories, usageByCategory] = await Promise.all([
      this.prisma.category.findMany({
        where: { userId },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.transaction.groupBy({
        by: ['category', 'type'],
        where: { userId },
        _count: { _all: true },
      }),
    ]);

    const usageMap = new Map(
      usageByCategory.map((item) => [
        `${item.type}:${item.category}`,
        item._count._all,
      ]),
    );

    return categories.map((category) => ({
      ...category,
      usageCount: usageMap.get(`${category.type}:${category.name}`) ?? 0,
    }));
  }

  async create(userId: string, dto: CreateCategoryDto) {
    try {
      const created = await this.prisma.category.create({
        data: { ...dto, userId },
      });

      if (created.type === 'expense') {
        await this.prisma.spendingLimit.upsert({
          where: {
            userId_categoryName: { userId, categoryName: created.name },
          },
          create: {
            userId,
            categoryName: created.name,
            limitAmount: DEFAULT_SPENDING_LIMITS[created.name] ?? 0,
          },
          update: {},
        });
      }

      return created;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe uma categoria com esse nome para este tipo.',
        );
      }
      throw error;
    }
  }

  async update(id: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada.');

    const nextName = dto.name?.trim();
    const isRenaming = nextName && nextName !== category.name;

    if (isRenaming) {
      const conflict = await this.prisma.category.findFirst({
        where: { userId, type: category.type, name: nextName },
      });
      if (conflict) {
        throw new ConflictException(
          'Já existe uma categoria com esse nome para este tipo.',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.category.update({
        where: { id },
        data: { name: nextName, icon: dto.icon, isTransfer: dto.isTransfer },
      });

      if (isRenaming) {
        await tx.transaction.updateMany({
          where: { userId, type: category.type, category: category.name },
          data: { category: updated.name },
        });

        if (category.type === 'expense') {
          const hasLimit = await tx.spendingLimit.findFirst({
            where: { userId, categoryName: category.name },
          });
          if (hasLimit) {
            await tx.spendingLimit.update({
              where: {
                userId_categoryName: { userId, categoryName: category.name },
              },
              data: { categoryName: updated.name },
            });
          }
        }
      }

      return updated;
    });
  }

  async remove(id: string, userId: string, reassignToCategoryId?: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada.');

    const usageCount = await this.prisma.transaction.count({
      where: { userId, type: category.type, category: category.name },
    });

    if (usageCount > 0 && !reassignToCategoryId) {
      throw new ConflictException({
        message:
          'Esta categoria possui transações vinculadas. Escolha uma categoria de destino para reclassificá-las antes de excluir.',
        usageCount,
      });
    }

    let targetName: string | null = null;
    if (usageCount > 0 && reassignToCategoryId) {
      if (reassignToCategoryId === id) {
        throw new BadRequestException(
          'A categoria de destino não pode ser a mesma que está sendo excluída.',
        );
      }

      const target = await this.prisma.category.findFirst({
        where: { id: reassignToCategoryId, userId },
      });
      if (!target) {
        throw new BadRequestException('Categoria de destino inválida.');
      }
      if (target.type !== category.type) {
        throw new BadRequestException(
          'A categoria de destino precisa ser do mesmo tipo (receita ou despesa).',
        );
      }

      targetName = target.name;
    }

    await this.prisma.$transaction(async (tx) => {
      if (targetName) {
        await tx.transaction.updateMany({
          where: { userId, type: category.type, category: category.name },
          data: { category: targetName },
        });
      }

      if (category.type === 'expense') {
        await tx.spendingLimit.deleteMany({
          where: { userId, categoryName: category.name },
        });
      }

      await tx.category.delete({ where: { id } });
    });

    return { deleted: true, reassignedTransactions: usageCount };
  }
}
