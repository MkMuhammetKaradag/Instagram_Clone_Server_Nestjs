import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  COMMENT_COLLECTION_NAME,
  POST_COLLECTION_NAME,
} from 'src/config/contants';
import { S3Module } from 'src/provider/s3/s3.module';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CommentSchema } from './schema/comment.schema';
import { PostSchema } from './schema/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: POST_COLLECTION_NAME, schema: PostSchema },
      { name: COMMENT_COLLECTION_NAME, schema: CommentSchema },
    ]),
    S3Module,
    UserModule,
  ],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
