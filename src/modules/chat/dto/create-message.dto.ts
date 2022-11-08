import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @Length(1, 200)
  MessageText: string;
}
