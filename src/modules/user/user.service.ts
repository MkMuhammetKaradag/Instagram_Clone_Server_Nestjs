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
import { UpdatedUserProfilePrivateDto } from './dto/update-userProfillePrivate.dto';
import { UpdatedUserProfilePictureDto } from './dto/update-userProfillePicture.dto';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { S3Service } from 'src/provider/s3/s3.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<UserDocument>,
    private readonly s3Service: S3Service,
  ) {}

  public async getUser(userId: string): Promise<UserDocument[]> {
    return this.UserModel.find();
  }
  public async getSearhUser(
    searchText: string,
    pageNumber: number,
  ): Promise<UserDocument[]> {
    return this.UserModel.find({
      userNickName: new RegExp(searchText, 'i'),
    })
      .select('userNickName userProfilePicture')
      .skip(pageNumber > 0 ? (pageNumber - 1) * 5 : 0)
      .limit(5);
  }

  public async createUser(createUser: CreateUserDto): Promise<UserDocument> {
    // console.log('userService:', createUser);
    try {
      const response = await this.UserModel.create(createUser);
      // console.log('userService', response);
      return response;
    } catch (error) {
      if (error.keyPattern) {
        const isExistList = Object.keys(error.keyPattern);
        throw new BadRequestException(
          isExistList.includes('email')
            ? `User with the given email already exists [email: ${error.keyValue.email}]`
            : isExistList.includes('userNickName')
            ? `User with the given user nick name  already exists [Nick Name: ${error.keyValue.userNickName}]`
            : 'Bad Request',
        );
      } else {
        throw new BadRequestException(error);
      }
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
    const user = await this.UserModel.findById(userId).select(
      '_id userProfilePicture userNickName email userLikes chats followUps followUps myFollowRequests',
    );

    return user;

    // return this.UserModel.findOne({
    //   $and: [{ _id: userId }, { profilePrivate: false }],
    // });
    // .select(
    //   '',
    // );
  }
  public async getUserNickName(
    userNickName: string,
    myUserId: string,
    myUserNickName: string,
  ) {
    const user = await this.UserModel.findOne({
      $and: [
        {
          userNickName: userNickName,
        },
        {
          $or: [
            { profilePrivate: false },
            { _id: myUserId },
            { followers: { $in: myUserId } },
          ],
        },
      ],
    })
      .populate({
        path: 'followers followUps',
        select: 'userNickName _id userProfilePicture',
      })
      .populate({
        path: 'userPosts',
        select: '-deleted -__v  -owner -owner_1',
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: 'comments',
            select: '-postId',
            populate: {
              path: 'user',
              select: 'userNickName _id userProfilePicture',
            },
          },
          {
            path: 'likes',
            select: 'userNickName _id userProfilePicture',
          },
        ],
      })
      .select(
        '-userLikes -chats -__v -gender -followRequests -myFollowRequests',
      );
    // console.log(user);
    if (!user) {
      const privateUser = await this.UserModel.findOne({
        userNickName: userNickName,
      }).select(
        'userNickName _id  userProfilePicture followers followUps profilePrivate',
      );
      if (!privateUser) {
        throw new HttpException('Cannot  user.', HttpStatus.BAD_REQUEST);
      }
      return {
        followers: privateUser.followUps,
        userNickName: privateUser.userNickName,
        _id: privateUser._id,
        followUps: privateUser.followUps,
        userProfilePicture: privateUser.userProfilePicture,
        profilePrivate: privateUser.profilePrivate,
      };
    }

    return user;
  }
  public async userPrivate(
    userId: string,
    updatedUserProfilePrivate: UpdatedUserProfilePrivateDto,
  ): Promise<UserDocument> {
    return this.UserModel.findByIdAndUpdate(userId, {
      profilePrivate: updatedUserProfilePrivate.profilePrivate,
    });
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

  public async updatedUserProfilePicture(
    userId: string,
    updatedUserProfilePictureDto: UpdatedUserProfilePictureDto,
    file: Buffer,
  ) {
    const path = `posts/${userId}/images/profile/${nanoid(10)}.webp`;
    const webpImg = await this.convertImageTypeToWebp(file);
    await this.s3Service.uploadFileToS3(path, webpImg);
    const fileUrl = this.s3Service.generateFileUrl(path);
    const user = await this.UserModel.findByIdAndUpdate(userId, {
      userProfilePicture: fileUrl,
    });
    return user;
  }
  public async convertImageTypeToWebp(buffer: Buffer): Promise<Buffer> {
    const buff = await sharp(buffer).webp({ lossless: true }).toBuffer();

    return buff;
  }

  public async followRequests(userId: string, followUpUserId: string) {
    const user = await this.UserModel.findById(userId);

    const hasFollowUpUser = user.myFollowRequests.some(
      (user) => user.toString() === followUpUserId,
    );
    const hasFollowUser = user.followUps.some(
      (user) => user.toString() === followUpUserId,
    );

    if (hasFollowUpUser || hasFollowUser) {
      console.log(
        'hasFollowUpUser',
        hasFollowUpUser,
        'hasFollowUser',
        hasFollowUser,
      );
      throw new HttpException(
        'Cannot  follow Request.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const followRequestUsers = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { myFollowRequests: followUpUserId },
      },
      { new: true },
    )
      .select('myFollowRequests')
      .exec();
    const res = await this.addFollowRequests(followUpUserId, userId);
    return followRequestUsers;
  }

  public async addFollowRequests(userId: string, followerUserId: string) {
    const user = await this.UserModel.findById(userId);
    // console.log(user.followers);
    const hasFollowerRequestUser = user.followRequests.some(
      (user) => user.toString() === followerUserId,
    );

    if (hasFollowerRequestUser) {
      throw new HttpException(
        'Cannot  add follow request.',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.UserModel.findByIdAndUpdate(userId, {
      $push: { followRequests: followerUserId },
    });
  }
  public async removeFollowRequests(userId: string, followUpUserId: string) {
    const user = await this.UserModel.findById(userId);

    const hasFollowUpUser = user.myFollowRequests.some(
      (user) => user.toString() === followUpUserId,
    );

    if (!hasFollowUpUser) {
      throw new HttpException(
        'Cannot remove  follow Request.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const removeFollowRequestUsers = await this.UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { myFollowRequests: followUpUserId },
      },
      { new: true },
    )
      .select('myFollowRequests')
      .exec();
    await this.deleteFollowRequests(followUpUserId, userId);
    return removeFollowRequestUsers;
  }
  public async deleteFollowRequests(userId: string, followerUserId: string) {
    const user = await this.UserModel.findById(userId);
    // console.log(user.followers);
    const hasFollowerRequestUser = user.followRequests.some(
      (user) => user.toString() === followerUserId,
    );

    if (!hasFollowerRequestUser) {
      throw new HttpException(
        'Cannot  delete follow request.',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.UserModel.findByIdAndUpdate(userId, {
      $pull: { followRequests: followerUserId },
    });
  }

  public async addChat(chatId: string, userId: string, sessionId: string) {
    const user = await this.UserModel.updateMany(
      { _id: { $in: [userId, sessionId] } },
      {
        $push: { chats: chatId },
      },
    );
    return user;
  }
}
