import { Logger, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME } from 'src/config/contants';
import { UserSchema } from './schema/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USER_COLLECTION_NAME, schema: UserSchema },
    ]),
  ],
  providers: [Logger, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
