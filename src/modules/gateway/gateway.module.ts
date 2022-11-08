import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';

import { MyGateway } from './gateway';

@Module({
  imports: [ChatModule],
  providers: [MyGateway],
})
export class GatewayModule {}
