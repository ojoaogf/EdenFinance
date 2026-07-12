import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { UserPayload } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateSpendingLimitDto } from './dto/update-spending-limit.dto';
import { SpendingLimitsService } from './spending-limits.service';

@Controller('spending-limits')
@UseGuards(JwtAuthGuard)
export class SpendingLimitsController {
  constructor(private readonly spendingLimitsService: SpendingLimitsService) {}

  @Get()
  findAll(
    @CurrentUser() user: UserPayload,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.spendingLimitsService.findAll(
      user.userId,
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
    );
  }

  @Patch(':categoryName')
  upsert(
    @CurrentUser() user: UserPayload,
    @Param('categoryName') categoryName: string,
    @Body() dto: UpdateSpendingLimitDto,
  ) {
    return this.spendingLimitsService.upsert(
      user.userId,
      categoryName,
      dto.limitAmount,
    );
  }
}
