import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateChatDto {
  @ApiProperty()
  @IsOptional()
  ChatName: string;

  @ApiProperty()
  @IsOptional()
  Messages: string[];
}
