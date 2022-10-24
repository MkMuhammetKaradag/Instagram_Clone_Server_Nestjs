import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { USER_COLLECTION_NAME } from 'src/config/contants';
export type UserDocument = User & Document;

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
    type: Boolean,
    default: false,
  })
  profilePrivate: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
