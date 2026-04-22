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
import { CreateGoalDto } from './dto/create-goal.dto';
import { DepositGoalDto } from './dto/deposit-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() createGoalDto: CreateGoalDto,
  ) {
    return this.goalsService.create(user.userId, createGoalDto);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.goalsService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.goalsService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, user.userId, updateGoalDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.goalsService.remove(id, user.userId);
  }

  @Post(':id/deposit')
  deposit(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() dto: DepositGoalDto,
  ) {
    return this.goalsService.deposit(id, user.userId, dto.amount);
  }
}
