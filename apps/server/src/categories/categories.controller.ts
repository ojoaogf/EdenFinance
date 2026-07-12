import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { UserPayload } from '../auth/current-user.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@CurrentUser() user: UserPayload) {
    return this.categoriesService.findAll(user.userId);
  }

  @Post()
  create(
    @CurrentUser() user: UserPayload,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.userId, createCategoryDto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, user.userId, updateCategoryDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Query('reassignToCategoryId') reassignToCategoryId?: string,
  ) {
    return this.categoriesService.remove(id, user.userId, reassignToCategoryId);
  }
}
