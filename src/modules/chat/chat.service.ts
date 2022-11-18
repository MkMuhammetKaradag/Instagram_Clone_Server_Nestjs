import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatDocument } from './schema/Chat.schema';
import { MessageDocument } from './schema/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Chat')
    private readonly ChatModal: Model<ChatDocument>,
    @InjectModel('Message')
    private readonly MessageModal: Model<MessageDocument>,

    private readonly userService: UserService,
  ) {}

  public async getChats(userId) {
    const chat = await this.ChatModal.find({
      users: { $in: userId },
    })
      .populate({
        path: 'users',
        select: 'userNickName userProfilePicture _id',
      })
      .select('users _id');

    return chat;
  }
  public async getAllMessages(chatId: string) {
    const chat = this.ChatModal.findById(chatId).populate({
      path: 'Messages',
      // select: '',
      populate: {
        path: 'from',
        select: ' userNickName userProfilePicture',
      },
    });
    return chat;
  }

  public async addMessage(
    createMessage: CreateMessageDto,
    chatId: string,
    sessionId: string,
  ) {
    // console.log(chatId, createMessage.MessageText, sessionId);

    const message = await this.MessageModal.create({
      ...createMessage,
      from: sessionId,
    });
    const newMessage = await message.populate({
      path: 'from',
      select: 'userNickName userProfilePicture',
    });
    if (message) {
      await this.addChatMessage(chatId, message._id);
    }
    return newMessage;
  }

  public async createChat(userId: string, sessionId: string) {
    const hasChat = await this.ChatModal.findOne({
      $and: [{ users: { $in: userId } }, { users: { $in: sessionId } }],
    });
    // console.log(hasChat);
    if (hasChat) {
      throw new HttpException('Cannot  chat created.', HttpStatus.BAD_REQUEST);
    }
    const chat = await this.ChatModal.create({ users: [userId, sessionId] });
    if (chat) {
      const users = this.userService.addChat(chat._id, userId, sessionId);
    }
    return chat;
  }
  public async addChatMessage(ChatId: string, messageId: string) {
    const chat = this.ChatModal.findByIdAndUpdate(ChatId, {
      $push: { Messages: messageId },
    });
    return chat;
  }
}
