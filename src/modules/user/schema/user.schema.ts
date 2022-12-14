import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  CHAT_COLLECTION_NAME,
  POST_COLLECTION_NAME,
  USER_COLLECTION_NAME,
} from 'src/config/contants';
export type UserDocument = User & Document;
export type UserGender = 'MALE' | 'FEMALE' | null;

@Schema({
  collection: USER_COLLECTION_NAME,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
    },
  },
})
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;
  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
  })
  userNickName: string;

  @Prop({
    type: String,
    default: null,
  })
  userProfilePicture: string;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: USER_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  followers: string[];
  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: USER_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  followUps: string[];
  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: USER_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  myFollowRequests: string[];
  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: USER_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  followRequests: string[];
  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: POST_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  userPosts: string[];

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: POST_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  userLikes: string[];

  @Prop({
    type: Boolean,
    default: false,
  })
  profilePrivate: boolean;

  @Prop({
    type: String,
    trim: true,
  })
  website: string;

  @Prop({
    type: String,
  })
  bio: string;

  @Prop({
    type: String,
    trim: true,
  })
  phoneNumber: string;

  @Prop({
    type: String,
    enum: ['MALE', 'FEMALE', null],
    default: null,
  })
  gender: UserGender;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: CHAT_COLLECTION_NAME,
      },
    ],
    default: [],
  })
  chats: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
