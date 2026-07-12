import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateInstallmentPlanDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['Crédito', 'Pix/Débito'])
  paymentType?: string;
}
