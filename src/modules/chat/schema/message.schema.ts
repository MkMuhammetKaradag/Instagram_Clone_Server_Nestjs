import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  MESSAGE_COLLECTION_NAME,
  USER_COLLECTION_NAME,
} from 'src/config/contants';

export type MessageDocument = Message & Document;

@Schema({
  collection: MESSAGE_COLLECTION_NAME,
  timestamps: { createdAt: 'created_at' },
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
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: USER_COLLECTION_NAME,
    required: true,
  })
  from: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  MessageText: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
