import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PAYMENT_TYPES } from '../payment-types';

export class CreateTransactionDto {
  // userId removido pois será obtido via token JWT

  @IsString()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsString()
  category: string;

  @IsOptional()
  @IsIn(PAYMENT_TYPES)
  paymentType?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
