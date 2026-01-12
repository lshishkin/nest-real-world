import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { UserEntity } from '@app/user/user.entity';
import { FollowEntity } from '@app/profile/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, UserEntity, FollowEntity]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, AuthGuard],
  exports: [ArticleService],
})
export class ArticleModule {}
