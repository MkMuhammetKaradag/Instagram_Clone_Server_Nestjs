import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  COMMENT_COLLECTION_NAME,
  POST_COLLECTION_NAME,
  USER_COLLECTION_NAME,
} from 'src/config/contants';
import { User } from 'src/modules/user/schema/user.schema';

export type CommentDocument = Comment & Document;

@Schema({ collection: COMMENT_COLLECTION_NAME })
export class Comment {
  @Prop({
    type: Types.ObjectId,
    ref: USER_COLLECTION_NAME,
    required: true,
  })
  user: User;

  @Prop({
    type: Types.ObjectId,
    ref: POST_COLLECTION_NAME,
    required: true,
  })
  postId: string;

  @Prop({
    type: String,
    trim: true,
  })
  description: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
