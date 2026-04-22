import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  // userId removido pois será obtido via token JWT

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
