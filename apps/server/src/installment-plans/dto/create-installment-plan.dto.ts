import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateInstallmentPlanDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsIn(['Crédito', 'Pix/Débito'])
  paymentType: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  installmentAmount: number;

  @IsInt()
  @Min(2)
  @Max(120)
  totalInstallments: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;
}
