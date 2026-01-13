import { ArticleEntity } from '../article/article.entity';
import { UserEntity } from '../user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  body: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }

  @ManyToOne(() => UserEntity, (user) => user.comments, { eager: true })
  author: UserEntity;

  @ManyToOne(() => ArticleEntity, (article) => article.comments)
  article: ArticleEntity;
}
