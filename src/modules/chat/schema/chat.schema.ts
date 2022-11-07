import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  CHAT_COLLECTION_NAME,
  MESSAGE_COLLECTION_NAME,
  USER_COLLECTION_NAME,
} from 'src/config/contants';
import { Message } from './message.schema';

export type ChatDocument = Chat & Document;

@Schema({
  collection: CHAT_COLLECTION_NAME,

  //   toJSON: {
  //     transform: (doc, ret) => {
  //       ret.Id = ret._id;
  //       delete ret._id;
  //       delete ret.__v;
  //       delete ret.userId;
  //       return ret;
  //     },
  //   },
})
export class Chat {
  @Prop({
    type: String,
  })
  ChatName: string;

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: USER_COLLECTION_NAME,
      },
    ],
  })
  users: Types.ObjectId[];

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: MESSAGE_COLLECTION_NAME,
      },
    ],
  })
  Messages: string[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
