import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserService } from './user.service';
import { Session as SessionDoc } from 'express-session';

@Controller('User')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getUsers() {
    const users = ['Muhammet karadağ', 'Ali Karadağ'];
    return {
      message: 'User Fetched',
      data: { users },
    };
  }

  @Post('/fallowUser/:followUpUserId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  public async fallowUser(
    @Session() session: SessionDoc,
    @Param('followUpUserId') followUpUserId: string,
  ) {
    const { followUps } = await this.userService.followUpUser(
      session.context.id,
      followUpUserId,
    );
    return {
      message: 'Follow Up  User',
      data: {
        followUps,
      },
    };
  }
}
