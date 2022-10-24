import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @Length(6)
  password: string;

  @ApiProperty({ maxLength: 20 })
  @MaxLength(20)
  userNickName: string;
}
