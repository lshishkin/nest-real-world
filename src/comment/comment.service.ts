import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommentsResponseInterface } from './types/commentsResponse.interface';
import { CommentEntity } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CreateCommentDto } from './dto/createComment.dto';
import { UserEntity } from '@app/user/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async getCommentsBySlug(slug: string): Promise<CommentsResponseInterface> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article)
      throw new HttpException(
        'Articals does not exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const comments = await this.commentRepository.find({
      where: { article: { id: article.id } },
    });
    return {
      comments,
    };
  }
  async addCommentsBySlug(
    slug: string,
    createCommentDto: CreateCommentDto,
    currentUserId: number,
  ): Promise<CommentEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    if (!article)
      throw new HttpException(
        'Articals does not exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    if (!user)
      throw new HttpException(
        'User does not exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    const comment = new CommentEntity();
    Object.assign(comment, createCommentDto);
    comment.article = article;
    comment.author = user;
    const result = await this.commentRepository.save(comment);

    return (await this.commentRepository.findOne({
      where: { id: result.id },
    })) as CommentEntity;
  }
  async deleteComment(
    slug: string,
    commentId: number,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new HttpException(
        'Article does not exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (!comment) {
      throw new HttpException(
        'Comment does not exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (comment?.author.id !== currentUserId) {
      throw new HttpException(
        'You are not the author of this comment',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return await this.commentRepository.delete({ id: commentId });
  }
  buildCommentResponse(comment: CommentEntity): CommentResponseInterface {
    return { comment };
  }
}
