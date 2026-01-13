import { ArticleEntity } from '@app/article/article.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, ArticleEntity, UserEntity]),
  ],
  controllers: [CommentController],
  providers: [CommentService, AuthGuard],
  exports: [CommentService],
})
export class CommentModule {}
