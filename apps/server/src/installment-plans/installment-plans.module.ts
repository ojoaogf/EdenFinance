import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { InstallmentPlansController } from './installment-plans.controller';
import { InstallmentPlansService } from './installment-plans.service';

@Module({
  imports: [CategoriesModule],
  controllers: [InstallmentPlansController],
  providers: [InstallmentPlansService],
})
export class InstallmentPlansModule {}
