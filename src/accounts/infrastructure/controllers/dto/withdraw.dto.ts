import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
