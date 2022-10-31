import { Logger, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME } from 'src/config/contants';
import { UserSchema } from './schema/user.schema';
import { S3Module } from 'src/provider/s3/s3.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USER_COLLECTION_NAME, schema: UserSchema },
    ]),
    S3Module,
  ],
  providers: [Logger, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
