import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { UserPayload } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto';
import { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';
import { InstallmentPlansService } from './installment-plans.service';

@Controller('installment-plans')
@UseGuards(JwtAuthGuard)
export class InstallmentPlansController {
  constructor(
    private readonly installmentPlansService: InstallmentPlansService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.installmentPlansService.findAll(user.userId);
  }

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateInstallmentPlanDto,
  ) {
    return this.installmentPlansService.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInstallmentPlanDto,
  ) {
    return this.installmentPlansService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.installmentPlansService.remove(user.userId, id);
  }
}
