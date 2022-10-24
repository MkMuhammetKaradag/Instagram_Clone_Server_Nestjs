import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<UserDocument>,
  ) {}
  public async createUser(createUser: CreateUserDto): Promise<UserDocument> {
    try {
      const response = await this.UserModel.create(createUser);
      return response;
    } catch (error) {
      const isExistList = Object.keys(error.keyPattern);
      console.log(error);

      throw new BadRequestException(
        isExistList.includes('email')
          ? `User with the given email already exists [email: ${error.keyValue.email}]`
          : isExistList.includes('userNickName')
          ? `User with the given user nick name  already exists [Nick Name: ${error.keyValue.userNickName}]`
          : 'Bad Request',
      );
    }
  }
  public async getUserByEmail(email: string): Promise<UserDocument> {
    return this.UserModel.findOne({ email }).exec();
  }
  public async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const response = password == hashedPassword;
    return response;
  }

  public async getUserById(userId: string): Promise<UserDocument> {
    return this.UserModel.findById(userId).select(
      '-followers -followUps -profilePrivate',
    );
  }

  public async followUpUser(userId: string, followUpUserId: string) {
    const user = await this.UserModel.findById(userId);
    console.log(user.followUps);
    const hasFollowUpUser = user.followUps.some(
      (user) => user.toString() === followUpUserId,
    );

    if (hasFollowUpUser) {
      throw new HttpException('Cannot  followUp.', HttpStatus.BAD_REQUEST);
    }

    const followUpUsers = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { followUps: followUpUserId },
      },
      { new: true },
    )
      .select('followUps')
      .exec();
    const res = await this.addFollower(followUpUserId, userId);
    return followUpUsers;
  }

  public async addFollower(userId: string, followerUserId: string) {
    const user = await this.UserModel.findById(userId);
    // console.log(user.followers);
    const hasFollowerUser = user.followers.some(
      (user) => user.toString() === followerUserId,
    );

    if (hasFollowerUser) {
      throw new HttpException('Cannot  follower.', HttpStatus.BAD_REQUEST);
    }
    const followerUsers = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { followers: followerUserId },
      },
      { new: true },
    )
      .select('followers')
      .exec();
    return followerUsers;
  }
}
