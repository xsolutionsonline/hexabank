import { IsNumber, IsString, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({
    description: 'El ID del usuario que será dueño de la nueva cuenta',
    example: 'user-1234',
  })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiProperty({
    description: 'El saldo inicial con el que se abrirá la cuenta',
    example: 1000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  initialBalance: number;
}
