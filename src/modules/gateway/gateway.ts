import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { parse } from 'cookie';
import { AuthGuard } from 'src/common/guard/auth.guard';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', '*'],
  },
})
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  constructor() {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }
  //   async handleConnection(socket: Socket) {
  //     // const { Authentication: authenticationToken } = parse(
  //     //   socket.handshake.headers.cookie,
  //     // );
  //     // console.log(authenticationToken);
  //     console.log(socket);
  //   }
  @SubscribeMessage('join')
  async onJoin(@MessageBody() chatId: string) {
    this.server.socketsJoin(chatId);
  }

  @SubscribeMessage('newMessage')
  async onNewMessage(
    @MessageBody()
    body: {
      ChatId: string;
    },
  ) {
    console.log(body);
    // console.log(message);
    this.server.to(body.ChatId).emit('onMessage', {
      msg: 'New Message',
      content: 'nice',
    });
  }
}
