import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserService } from './user.service';
import session, { Session as SessionDoc } from 'express-session';
import { UpdatedUserProfilePrivateDto } from './dto/update-userProfillePrivate.dto';
import { UpdatedUserProfilePictureDto } from './dto/update-userProfillePicture.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('User')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async getUserById(@Session() session: SessionDoc) {
    const users = await this.userService.getUser(session.context.id);
    return {
      message: 'User Fetched',
      data: { users },
    };
  }
  @Get('/search')
  @HttpCode(HttpStatus.OK)
  // @ApiQuery([
  //   { name: 'searchText', type: String },
  //   { name: 'pageNuber', type: Number },
  // ])
  @UseGuards(AuthGuard)
  public async getUserSearch(
    @Session() session: SessionDoc,
    @Query('searchText') searchText: string,
    @Query('pageNuber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
  ) {
    console.log(searchText);
    const users = await this.userService.getSearhUser(searchText, pageNumber);
    return {
      message: 'User search',
      data: { users },
    };
  }
  @Get('/:userNickName')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async getUserId(
    @Param('userNickName') userNickName: string,
    @Session() session: SessionDoc,
  ) {
    const user = await this.userService.getUserNickName(
      userNickName,
      session.context.id,
      session.context.userNickName,
    );
    return {
      message: 'User Fetched',
      data: { user },
    };
  }
  @Put('/private')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async userPrivate(
    @Session() session: SessionDoc,
    @Body() updatedUserProfilePrivate: UpdatedUserProfilePrivateDto,
  ) {
    const user = await this.userService.userPrivate(
      session.context.id,
      updatedUserProfilePrivate,
    );
    return {
      message: 'change user private',
      data: {
        user,
      },
    };
  }
  @Put('/userProfilePicture')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_, { mimetype }, cb) => {
        if (mimetype.includes('image')) {
          return cb(null, true);
        }
        return cb(new BadRequestException('File type must be image'), false);
      },
      limits: { fileSize: 5_000_000 },
    }),
  )
  public async userProfilePicture(
    @Session() session: SessionDoc,
    @Body() datedUserProfilePictureDto: UpdatedUserProfilePictureDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.userService.updatedUserProfilePicture(
      session.context.id,
      datedUserProfilePictureDto,
      file.buffer,
    );
    return {
      message: 'change user private',
      data: {
        user,
      },
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
  @Post('/followRequestUser/:followUpUserId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  public async followRequestUser(
    @Session() session: SessionDoc,
    @Param('followUpUserId') followUpUserId: string,
  ) {
    const { myFollowRequests } = await this.userService.followRequests(
      session.context.id,
      followUpUserId,
    );
    return {
      message: 'Follow  Request  User',
      data: {
        myFollowRequests,
      },
    };
  }
  @Delete('/followRequestUser/:followUpUserId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  public async removeFallowRequestUser(
    @Session() session: SessionDoc,
    @Param('followUpUserId') followUpUserId: string,
  ) {
    const { myFollowRequests } = await this.userService.removeFollowRequests(
      session.context.id,
      followUpUserId,
    );
    return {
      message: 'Follow  Request  User',
      data: {
        myFollowRequests,
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
