import { ApiProperty } from '@nestjs/swagger';

export class UpdatedUserProfilePictureDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: Express.Multer.File;
}
