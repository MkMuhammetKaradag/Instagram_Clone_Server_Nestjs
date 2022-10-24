import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MongodbModule } from './provider/mongo/mongodb.module';
import { RedisModule } from './provider/redis/redis.module';

@Module({
  imports: [RedisModule, UserModule, MongodbModule, AuthModule],
  providers: [AppService],
})
export class AppModule {}
