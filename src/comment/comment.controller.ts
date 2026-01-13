import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentsResponseInterface } from './types/commentsResponse.interface';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { DeleteResult } from 'typeorm';

@Controller('articles')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Get('/:slug/comments')
  getCommentsBySlug(
    @Param('slug') slug: string,
  ): Promise<CommentsResponseInterface> {
    return this.commentService.getCommentsBySlug(slug);
  }
  @Post('/:slug/comments')
  @UseGuards(AuthGuard)
  async addCommentsBySlug(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseInterface> {
    const comment = await this.commentService.addCommentsBySlug(
      slug,
      createCommentDto,
      currentUserId,
    );
    return this.commentService.buildCommentResponse(comment);
  }
  @Delete('/:slug/comments/:commentId')
  @UseGuards(AuthGuard)
  deleteCommentsBySlug(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
    @Param('commentId') commentId: number,
  ): Promise<DeleteResult> {
    return this.commentService.deleteComment(slug, commentId, currentUserId);
  }
}
