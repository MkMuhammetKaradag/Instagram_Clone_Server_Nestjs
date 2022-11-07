import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Session as SessionDoc } from 'express-session';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('Auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginUserDto: LoginUserDto,
    @Session() session: SessionDoc,
  ) {
    const user = await this.authService.login(loginUserDto);

    session.context = {
      id: user._id,
      email: user.email,
      userProfilePicture: user.userProfilePicture,
      userNickName: user.userNickName,
    };

    return {
      message: 'Logged in',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          userProfilePicture: user.userProfilePicture,
          userNickName: user.userNickName,
        },
      },
    };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  public async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.createUser(createUserDto);

    return {
      message: 'User created',
      data: { user },
    };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  public logout(
    @Session() session: SessionDoc,
    @Res({ passthrough: true }) res: Response,
  ) {
    session.context = null;

    session.destroy(null);

    res.clearCookie('session_token');

    return {
      message: 'Logged in',
      data: { user: session.context },
    };
  }
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async me(@Session() session: SessionDoc) {
    const user = await this.authService.getMe(session.context.id);
    return {
      message: 'Get me',
      data: { user },
    };
  }
}
