import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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

    // this.logger.debug('Image converted to webp', S3Service.name);

    return buff;
  }

  // public async uploadPostImage(courseId: string, file: Buffer) {
  //   const path = `courses/${courseId}/thumbnails/${nanoid(10)}.webp`;
  //   const imageUrl = this.s3Service.generateFileUrl(path);

  //   const webpImg = await this.convertImageTypeToWebp(file);
  //   await this.s3Service.uploadFileToS3(path, webpImg);

  //   return this.CourseModel.findByIdAndUpdate(
  //     courseId,
  //     { thumbnail: imageUrl },
  //     { new: true },
  //   ).exec();
  // }

  /**
   * addCommentToPost
   */
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
}
