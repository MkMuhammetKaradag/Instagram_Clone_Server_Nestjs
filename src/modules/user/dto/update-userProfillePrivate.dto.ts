import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, Length, MaxLength } from 'class-validator';

export class UpdatedUserProfilePrivateDto {
  @ApiProperty()
  @IsBoolean()
  profilePrivate: boolean;
}
