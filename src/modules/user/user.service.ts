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

  public async getUser(userId: string): Promise<UserDocument> {
    return this.UserModel.findById(userId);
  }

  public async createUser(createUser: CreateUserDto): Promise<UserDocument> {
    try {
      const response = await this.UserModel.create(createUser);
      return response;
    } catch (error) {
      const isExistList = Object.keys(error.keyPattern);
      //console.log(error);

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
    // console.log(user.followUps);
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

  public async unfollow(userId: string, followUpUserId: string) {
    const user = await this.UserModel.findById(userId);

    const hasFollowUpUser = user.followUps.some(
      (user) => user.toString() === followUpUserId,
    );

    if (!hasFollowUpUser) {
      throw new HttpException('Cannot  unfollow.', HttpStatus.BAD_REQUEST);
    }

    const followUpUsers = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { followUps: followUpUserId },
      },
      { new: true },
    )
      .select('followUps')
      .exec();
    await this.removeFollower(followUpUserId, userId);
    return followUpUsers;
  }
  public async removeFollower(userId: string, followerUserId: string) {
    const user = await this.UserModel.findById(userId);
    // console.log(user.followers);
    const hasFollowerUser = user.followers.some(
      (user) => user.toString() === followerUserId,
    );

    if (!hasFollowerUser) {
      throw new HttpException('Cannot  follower.', HttpStatus.BAD_REQUEST);
    }
    const followerUsers = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { followers: followerUserId },
      },
      { new: true },
    )
      .select('followers')
      .exec();
  }

  public async addPost(userId: string, postId: string) {
    const user = await this.UserModel.findById(userId);
    // console.log(user.followers);
    const hasUserPost = user.userPosts.some(
      (post) => post.toString() === postId,
    );

    if (hasUserPost) {
      throw new HttpException('Cannot  Post.', HttpStatus.BAD_REQUEST);
    }
    const userPosts = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { userPosts: postId },
      },
      { new: true },
    )
      .select('userPosts')
      .exec();
    return userPosts;
  }
  public async addLike(userId: string, postId: string) {
    const user = await this.UserModel.findById(userId);
    // console.log(user.followers);
    const hasUserLike = user.userLikes.some(
      (like) => like.toString() === postId,
    );

    if (hasUserLike) {
      throw new HttpException('Cannot  user like.', HttpStatus.BAD_REQUEST);
    }
    const userPosts = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { userLikes: postId },
      },
      { new: true },
    )
      .select('userLikes')
      .exec();
    return userPosts;
  }
  public async removeLike(userId: string, postId: string) {
    const user = await this.UserModel.findById(userId);
    // console.log(user.followers);
    const hasUserLike = user.userLikes.some(
      (like) => like.toString() === postId,
    );

    if (!hasUserLike) {
      throw new HttpException(
        'Cannot  user remove  like.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userPosts = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { userLikes: postId },
      },
      { new: true },
    )
      .select('userLikes')
      .exec();
    return userPosts;
  }
}
