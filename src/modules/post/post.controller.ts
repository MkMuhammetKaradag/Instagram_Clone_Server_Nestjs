import {
  Controller,
  Post,
  HttpStatus,
  HttpCode,
  UseGuards,
  Session,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';

import { AuthGuard } from 'src/common/guard/auth.guard';
import { PostService } from './post.service';
import { Session as SessionDoc } from 'express-session';
import { CreatePostDto } from './dto/create-post.dto';
import { AddCommentToPostDto } from './dto/add-comment.-to-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('Post')
@ApiTags('Post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async getPost(@Session() session: SessionDoc) {
    const posts = await this.postService.getPosts(session.context.id);
    return {
      message: 'get Posts',
      data: {
        posts,
      },
    };
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       description: {
  //         type: 'string',
  //       },
  //       hashtags: {
  //         type: 'string',
  //       },

  //       postimage: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: ({ body }, { mimetype }, cb) => {
        if (
          mimetype.includes('image') ||
          body?.type == 'IMAGE' ||
          mimetype.includes('video') ||
          body?.type == 'VIDEO'
        ) {
          return cb(null, true);
        }
        return cb(new BadRequestException('File type must be image'), false);
      },
      limits: { fileSize: 5_000_000 },
    }),
  )
  public async createPost(
    @Session() session: SessionDoc,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // console.log('file:', createPostDto);
    const post = await this.postService.createdPost(
      session.context.id,
      createPostDto,
      file.buffer,
    );
    return {
      message: 'created Post',
      data: {
        post: post,
      },
    };
  }

  @Post('/comment/:postId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  public async addCommentToPost(
    @Session() session: SessionDoc,
    @Param('postId') postId: string,
    @Body() addComment: AddCommentToPostDto,
  ) {
    const { comments } = await this.postService.addCommentToPost(
      session.context.id,
      postId,
      addComment,
    );

    return {
      message: 'add comment',
      data: {
        comments,
      },
    };
  }

  @Put('/like/:postId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  public async addLikeToPost(
    @Session() session: SessionDoc,
    @Param('postId') postId: string,
  ) {
    const { likes } = await this.postService.addLikeToPost(
      session.context.id,
      postId,
    );

    return {
      message: 'add comment',
      data: {
        likes,
      },
    };
  }
  @Delete('/like/:postId')
  // @HttpCode(HttpStatus.)
  @UseGuards(AuthGuard)
  public async removeLikeToPost(
    @Session() session: SessionDoc,
    @Param('postId') postId: string,
  ) {
    const { likes } = await this.postService.removeLikeToPost(
      session.context.id,
      postId,
    );

    return {
      message: 'add comment',
      data: {
        likes,
      },
    };
  }

  @Get('/myPosts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async getMyPosts(@Session() session: SessionDoc) {
    const myPosts = await this.postService.getMyPosts(session.context.id);
    return {
      message: 'get my posts',
      data: {
        myPosts,
      },
    };
  }

  @Get('/myFollowUpsPosts')
  @ApiQuery({ name: 'pageNuber', type: Number })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  public async getMyFollowUpsPosts(
    @Session() session: SessionDoc,
    // @Param('pageNumber') pageNumber: number,
    @Query('pageNuber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: Number = 1,
  ) {
    const myFollowUpsPosts = await this.postService.getMyFollowUpsPosts(
      session.context.id,
      pageNumber,
    );
    return {
      message: 'get my follow ups  posts',
      data: {
        myFollowUpsPosts,
      },
    };
  }
}
