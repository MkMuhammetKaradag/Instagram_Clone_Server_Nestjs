import {
  Controller,
  Delete,
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
import session, { Session as SessionDoc } from 'express-session';

@Controller('User')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async getUser(@Session() session: SessionDoc) {
    const user = await this.userService.getUser(session.context.id);
    return {
      message: 'User Fetched',
      data: { user },
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
  @Delete('/unfollow/:unfollowUserId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async unfollow(
    @Session() session: SessionDoc,
    @Param('unfollowUserId') unfollowUserId: string,
  ) {
    const { followUps } = await this.userService.unfollow(
      session.context.id,
      unfollowUserId,
    );
    return {
      message: 'Unfollow User',
      data: {
        followUps,
      },
    };
  }
}
