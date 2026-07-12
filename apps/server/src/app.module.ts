import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { GoalsModule } from './goals/goals.module';
import { InstallmentPlansModule } from './installment-plans/installment-plans.module';
import { InvestmentsModule } from './investments/investments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { SpendingLimitsModule } from './spending-limits/spending-limits.module';
import { TransactionsModule } from './transactions/transactions.module';

const isFeatureEnabled = (value?: string) => value === 'true' || value === '1';

const GOALS_ENABLED = isFeatureEnabled(process.env.FEATURE_GOALS);
const INVESTMENTS_ENABLED = isFeatureEnabled(process.env.FEATURE_INVESTMENTS);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    CategoriesModule,
    SpendingLimitsModule,
    TransactionsModule,
    InstallmentPlansModule,
    ...(INVESTMENTS_ENABLED ? [InvestmentsModule] : []),
    ...(GOALS_ENABLED ? [GoalsModule] : []),
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
