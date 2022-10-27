import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/pot.module';
import { UserModule } from './modules/user/user.module';
import { MongodbModule } from './provider/mongo/mongodb.module';
import { RedisModule } from './provider/redis/redis.module';
import { S3Module } from './provider/s3/s3.module';

@Module({
  imports: [
    RedisModule,
    UserModule,
    MongodbModule,
    AuthModule,
    PostModule,
    S3Module,
  ],
  providers: [AppService],
})
export class AppModule {}
