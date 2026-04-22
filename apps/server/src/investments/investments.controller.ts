import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { UserPayload } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { InvestmentsService } from './investments.service';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateInvestmentDto) {
    return this.investmentsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.investmentsService.findAll(user.userId);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: UserPayload) {
    return this.investmentsService.getSummary(user.userId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.investmentsService.remove(user.userId, id);
  }
}
