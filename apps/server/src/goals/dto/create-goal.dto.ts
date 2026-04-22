import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateGoalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  currentAmount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthlyDeposit: number;

  @IsNotEmpty()
  @IsDateString()
  deadline: string;

  @IsNotEmpty()
  @IsString()
  category: string;
}
