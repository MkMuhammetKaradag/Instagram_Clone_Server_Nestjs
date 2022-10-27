import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import {
  COMMENT_COLLECTION_NAME,
  POST_COLLECTION_NAME,
  USER_COLLECTION_NAME,
} from 'src/config/contants';

export type PostDocument = Post & Document;
export enum ContentType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
}

@Schema({ collection: POST_COLLECTION_NAME })
export class Post {
  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: [120, 'Maximum 120 characters.'],
    minlength: [3, 'Minimum 3 characters. '],
  })
  description: string;
  @Prop({
    type: String,
    enum: ['VIDEO', 'IMAGE'],
    default: 'IMAGE',
  })
  type: ContentType;
  @Prop({
    type: [
      {
        type: String,
        trim: true,
        maxlength: [20, 'maximum 20 characters.'],
      },
    ],
  })
  hashtags: string[];

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: USER_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  likes: string[];

  @Prop({
    type: Types.ObjectId,
    ref: USER_COLLECTION_NAME,
    required: true,
  })
  owner: string;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: COMMENT_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  comments: string[];

  @Prop({
    type: Number,
    min: [0, 'Minimum 0'],
    default: 0,
  })
  total_views: number;

  @Prop({
    type: String,
  })
  video_url: string;

  @Prop({
    type: String,
  })
  image_url: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  deleted: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
