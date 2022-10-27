import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @Length(3, 120)
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  hashtags: string[];

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  image_url: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  video_url: string;

  @ApiProperty({ type: 'string', required: false, default: 'IMAGE' })
  // @Default('IMAGE')
  @IsOptional()
  type: string = 'IMAGE';

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: Express.Multer.File;
}
