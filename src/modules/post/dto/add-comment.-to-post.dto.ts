import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Max, Min } from 'class-validator';

export class AddCommentToPostDto {
  @ApiProperty()
  @IsString()
  description: string;
}
