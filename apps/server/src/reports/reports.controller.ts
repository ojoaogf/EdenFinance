import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { UserPayload } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: UserPayload) {
    return this.reportsService.getDashboardSummary(user.userId);
  }

  @Get('expenses-by-category')
  getExpensesByCategory(
    @CurrentUser() user: UserPayload,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.reportsService.getExpensesByCategory(
      user.userId,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @Get('monthly-evolution')
  getMonthlyEvolution(
    @CurrentUser() user: UserPayload,
    @Query('year') year?: string,
    @Query('type') type?: string,
    @Query('months') months?: string,
  ) {
    return this.reportsService.getMonthlyEvolution(
      user.userId,
      year ? parseInt(year) : undefined,
      type,
      months ? parseInt(months) : undefined,
    );
  }
}
