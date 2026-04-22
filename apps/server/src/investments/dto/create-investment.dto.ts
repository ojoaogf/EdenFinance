import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string; // ex: 'stock', 'crypto', 'fixed_income'

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsDateString()
  date: string;
}
