import { Injectable, HttpException, HttpStatus, Options } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { S3Service } from 'src/provider/s3/s3.service';
import { UserService } from '../user/user.service';
import { AddCommentToPostDto } from './dto/add-comment.-to-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { Comment, CommentDocument } from './schema/comment.schema';
import { Post, PostDocument } from './schema/post.schema';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { User } from '../user/schema/user.schema';
import { USER_COLLECTION_NAME } from 'src/config/contants';
import { truncate } from 'fs/promises';
@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private readonly PostModel: Model<PostDocument>,
    @InjectModel(Comment.name)
    private readonly CommentModel: Model<CommentDocument>,
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
  ) {}

  public async getPosts(userId: string) {
    const posts = await this.PostModel.aggregate([
      { $set: { owner: { $toObjectId: '$owner' } } },
      {
        $lookup: {
          from: 'User',
          localField: 'owner',
          // let: { userEmail: '$email', userNickName: '$userNickName' },
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                _id: 1,
                userNickName: 1,
                email: 1,
                userProfilePicture: 1,
                profilePrivate: 1,
              },
            },
          ],
        },
      },
      // {
      //   $group: {
      //     users: {
      //       $push: {
      //         $arrayElemAt: ['$user', 0],
      //       },
      //     },
      //   },
      // },
      {
        $project: {
          _id: 1,
          description: 1,
          type: 1,
          owner: 1,

          filtereduser: {
            $filter: {
              input: '$user',
              cond: { $eq: [false, '$$this.profilePrivate'] },
            },
          },
        },
      },
      {
        $match: {
          filtereduser: { $ne: [] },
        },
      },

      // {
      //   $replaceRoot: {
      //     newRoot: {
      //       $mergeObjects: [{ $arrayElemAt: ['$fromItems', 0] }, '$$ROOT'],
      //     },
      //   },
      // },
      // { $project: { fromItems: 0 } },
    ]);
    // .lookup({
    //   from: 'User',
    //   localField: 'owner',
    //   foreignField: '_id',
    //   as: 'users',
    // })
    // .exec();
    // const posts = await this.PostModel.find().populate({
    //   path: 'owner',
    //   select: 'userNickName userProfilePicture',
    //   match: { profilePrivate: false },
    // });
    // const newPosts = posts.filter((post) => {
    //   return post?.owner != null;
    // });
    return posts;
  }
  /**
   * async createdPost
   */
  public async createdPost(
    UserId: string,
    createdPost: CreatePostDto,
    file: Buffer,
  ): Promise<PostDocument> {
    const path =
      createdPost.type == 'IMAGE'
        ? `posts/${UserId}/images/${nanoid(10)}.webp`
        : `posts/${UserId}/videos/${nanoid(10)}.mp4`;

    if (createdPost.type == 'IMAGE') {
      const webpImg = await this.convertImageTypeToWebp(file);
      await this.s3Service.uploadFileToS3(path, webpImg);
    } else if (createdPost.type == 'VIDEO') {
      await this.s3Service.uploadFileToS3(path, file);
    }
    const fileUrl = this.s3Service.generateFileUrl(path);

    const post = await this.PostModel.create({
      ...createdPost,
      owner: UserId,
      image_url: createdPost.type == 'IMAGE' ? fileUrl : null,
      video_url: createdPost.type == 'VIDEO' ? fileUrl : null,
    });
    if (post) {
      await this.userService.addPost(UserId, post._id);
    }
    return post;
  }
  public async convertImageTypeToWebp(buffer: Buffer): Promise<Buffer> {
    const buff = await sharp(buffer).webp({ lossless: true }).toBuffer();

    return buff;
  }

  public async addCommentToPost(
    userId: string,
    postId: string,
    addComment: AddCommentToPostDto,
  ): Promise<PostDocument> {
    const comment = await this.CommentModel.create({
      ...addComment,
      user: userId,
      postId: postId,
    });

    if (comment) {
      return await this.PostModel.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: comment._id,
          },
        },
        { new: true },
      );
    }
    return null;
  }

  public async addLikeToPost(userId: string, postId: string) {
    const postLikes = await this.PostModel.findById(postId);
    const hasPostLike = postLikes.likes.some(
      (user) => user.toString() === userId,
    );

    if (hasPostLike) {
      throw new HttpException('Cannot  Post.', HttpStatus.BAD_REQUEST);
    }
    const userPost = await this.PostModel.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: userId,
        },
      },
      { new: true },
    );
    if (userPost) {
      const { userLikes } = await this.userService.addLike(userId, postId);
    }
    return userPost;
  }
  public async removeLikeToPost(userId: string, postId: string) {
    const postLikes = await this.PostModel.findById(postId);
    const hasPostLike = postLikes.likes.some(
      (user) => user.toString() === userId,
    );

    if (!hasPostLike) {
      throw new HttpException('Cannot  remove like.', HttpStatus.BAD_REQUEST);
    }
    const userPost = await this.PostModel.findByIdAndUpdate(
      postId,
      {
        $pull: {
          likes: userId,
        },
      },
      { new: true },
    );
    if (userPost) {
      const { userLikes } = await this.userService.removeLike(userId, postId);
    }
    return userPost;
  }
  public async getMyPosts(userId: string): Promise<PostDocument[]> {
    const myPosts = await this.PostModel.find({ owner: userId });
    return myPosts;
  }

  public async getMyFollowUpsPosts(userId: string): Promise<PostDocument[]> {
    const { followUps } = await this.userService.getUserById(userId);
    const usersID = followUps.map((user) => user.toString());

    const myPosts = await this.PostModel.find({
      owner: { $in: usersID },
    });
    // const myPosts = await this.PostModel.find({
    //   owner: '63578f6761e297c1a19c1b70',
    // });
    return myPosts;
  }
}
