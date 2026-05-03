import { IsNumber, IsString, Min, IsNotEmpty } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsNumber()
  @Min(0)
  initialBalance: number;
}
