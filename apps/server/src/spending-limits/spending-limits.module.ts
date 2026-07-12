import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { SpendingLimitsController } from './spending-limits.controller';
import { SpendingLimitsService } from './spending-limits.service';

@Module({
  imports: [CategoriesModule],
  controllers: [SpendingLimitsController],
  providers: [SpendingLimitsService],
})
export class SpendingLimitsModule {}
