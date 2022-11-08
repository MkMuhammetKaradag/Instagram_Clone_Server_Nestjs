import {
  Controller,
  Get,
  Logger,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  Session,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ChatService } from './Chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import session, { Session as SessionDoc } from 'express-session';
@Controller('Chats')
@ApiTags('chats')
export class ChatController {
  constructor(
    private readonly ChatService: ChatService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  public async getChats(@Session() session: SessionDoc) {
    const chats = await this.ChatService.getChats(session.context.id);

    this.logger.log('Chats fetched', ChatController.name);

    return {
      message: 'Chats fetched',
      data: { chats },
    };
  }
  @Get('messages/:chatId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  public async getMessages(@Param('chatId') chatId: string) {
    const messages = await this.ChatService.getAllMessages(chatId);

    this.logger.log('messages fetched', ChatController.name);

    return {
      message: 'messages fetched',
      data: { messages },
    };
  }
  @Post(':userId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  public async createChat(
    // @Body() createChat: CreateChatDto,
    @Param('userId') userId: string,
    @Session() session: SessionDoc,
  ) {
    const chat = await this.ChatService.createChat(userId, session.context.id);
    console.log(userId, session.context.id);

    this.logger.log('Message Created', ChatController.name);

    return {
      message: 'Message Created  chat',
      data: { chat },
    };
  }
  @Post('message/:chatId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  public async addMessage(
    @Body() createMessage: CreateMessageDto,
    @Param('chatId') chatId: string,
    @Session() session: SessionDoc,
  ) {
    const meesage = await this.ChatService.addMessage(
      createMessage,
      chatId,
      session.context.id,
    );

    this.logger.log('Message Created', ChatController.name);

    return {
      message: 'Message Created',
      data: { meesage },
    };
  }
}
