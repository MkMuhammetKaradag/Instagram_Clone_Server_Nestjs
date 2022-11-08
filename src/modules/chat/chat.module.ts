import { Logger, Module } from '@nestjs/common';
import { ChatService } from './Chat.service';
import { ChatController } from './Chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './schema/message.schema';
import { ChatSchema } from './schema/chat.schema';
import {
  CHAT_COLLECTION_NAME,
  MESSAGE_COLLECTION_NAME,
} from 'src/config/contants';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CHAT_COLLECTION_NAME, schema: ChatSchema },
      { name: MESSAGE_COLLECTION_NAME, schema: MessageSchema },
    ]),
    UserModule,
  ],
  providers: [ChatService, Logger],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
