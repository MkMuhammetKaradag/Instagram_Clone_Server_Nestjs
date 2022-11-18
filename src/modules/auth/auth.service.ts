import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDocument } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';

import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  public async createUser(createUser: CreateUserDto): Promise<UserDocument> {
    const user = await this.userService.createUser(createUser);
    console.log('auth service:', user);
    return user;
  }
  public async login({ email, password }: LoginUserDto): Promise<UserDocument> {
    const resposnse = await this.userService.getUserByEmail(email);
    if (!resposnse) {
      throw new UnauthorizedException(
        `User could not found with the given email [email: ${email}]`,
      );
    }
    const isMatch = await this.userService.comparePasswords(
      password,
      resposnse.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException(
        `Wrong password for user [email: ${email}]`,
      );
    }
    return resposnse;
  }
  public async getMe(userId: string) {
    const user = await this.userService.getUserById(userId);
    return user;
  }
}
