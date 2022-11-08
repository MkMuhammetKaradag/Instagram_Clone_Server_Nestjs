import { OnModuleInit, Session, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { parse } from 'cookie';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Session as SessionDoc } from 'express-session';
import { ChatService } from '../chat/Chat.service';
import { CreateMessageDto } from '../chat/dto/create-message.dto';
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', '*'],
    credentials: true,
  },
})
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  constructor(private readonly chatService: ChatService) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }
  // async handleConnection(socket: Socket) {
  //   // const { Authentication: authenticationToken } = parse(
  //   //   socket.handshake.headers.cookie,
  //   // );
  //   // console.log(authenticationToken);
  //   console.log(socket);
  // }
  @SubscribeMessage('join')
  async onJoin(@MessageBody() chatId: string) {
    console.log('nice');
    this.server.socketsJoin(chatId);
  }
  handleDisconnect(client: Socket) {
    console.log(`lient disconnected `);
  }
  @SubscribeMessage('newMessage')
  async onNewMessage(
    @MessageBody()
    body: {
      createdMessage: CreateMessageDto;
      ChatId: string;
    },
    @ConnectedSocket() socket: Socket,
    @Session() session: SessionDoc,
  ) {
    // @ts-ignore
    const sessionId = socket.handshake!.session.context.id;
    // console.log(body);
    const message = await this.chatService.addMessage(
      body.createdMessage,
      body.ChatId,
      sessionId as string,
    );
    this.server.to(body.ChatId).emit('onMessage', {
      msg: 'New Message',
      content: 'nice',
      message,
    });
  }
}
