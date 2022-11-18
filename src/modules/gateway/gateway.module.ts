import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/Chat.module';

import { MyGateway } from './gateway';

@Module({
  imports: [ChatModule],
  providers: [MyGateway],
})
export class GatewayModule {}
