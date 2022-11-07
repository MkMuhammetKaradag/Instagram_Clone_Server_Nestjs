import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatDocument } from './schema/chat.schema';
import { MessageDocument } from './schema/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Chat')
    private readonly ChatModal: Model<ChatDocument>,
    @InjectModel('Message')
    private readonly MessageModal: Model<MessageDocument>,
  ) {}

  public async getChats(userId) {
    const chat = this.ChatModal.find({
      users: { $in: userId },
    });
    return chat;
  }
  public async getAllMessages(chatId: string) {
    const chat = this.ChatModal.findById(chatId).populate({
      path: 'Messages',
      // select: '',
    });
    return chat;
  }

  public async addMessage(createMessage: CreateMessageDto, chatId: string) {
    const message = await this.MessageModal.create(createMessage);
    if (message) {
      await this.addChatMessage(chatId, message._id);
    }
    return message;
  }

  public async createChat(userId: string, sessionId: string) {
    const hasChat = await this.ChatModal.findOne({
      $and: [{ users: { $in: userId } }, { users: { $in: sessionId } }],
    });
    // console.log(hasChat);
    if (hasChat) {
      throw new HttpException('Cannot  chat created.', HttpStatus.BAD_REQUEST);
    }
    const chat = this.ChatModal.create({ users: [userId, sessionId] });
    return chat;
  }
  public async addChatMessage(ChatId: string, messageId: string) {
    const chat = this.ChatModal.findByIdAndUpdate(ChatId, {
      $push: { Messages: messageId },
    });
    return chat;
  }
}
