import { IsNumber, Min } from 'class-validator';

export class UpdateSpendingLimitDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  limitAmount: number;
}
