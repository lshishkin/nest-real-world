import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UserEntity } from '@app/user/user.entity';
import { ArticleEntity } from './article.entity';
import { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { ArticlesQueryInterface } from './types/articlesQuery.interface';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}
  async findAll(
    currentUserId: number,
    query: ArticlesQueryInterface,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      if (author)
        queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.favorite) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorite },
        relations: ['favorites'],
      });

      const ids = author?.favorites.map((el) => el.id);
      if (ids?.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    // Считаем после фильтрации
    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoritedIds: number[] = [];

    if (currentUserId) {
      const user = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      favoritedIds = user?.favorites.map((el) => el.id) || [];
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorities = articles.map((article) => {
      const favorited = favoritedIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorities, articlesCount };
  }
  async getFeed(
    currentUserId: number,
    query: ArticlesQueryInterface,
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      where: { followerId: currentUserId },
    });
    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }
    const followingUserIds = follows.map((el) => el.followingId);
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', {
        ids: followingUserIds,
      });

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    return { articles, articlesCount };
  }
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }
  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }
  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (article) return article;
    throw new HttpException(
      'Articals does not exist',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);
    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'You are not author',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return await this.articleRepository.delete({ slug });
  }
  async editArticle(
    slug: string,
    editArticleDto: CreateArticleDto,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'You are not author',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    Object.assign(article, editArticleDto);
    return await this.articleRepository.save(article);
  }
  async addArticleToFavorities(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    const isNotFavorited =
      user?.favorites.findIndex(
        (articleInfavorites) => articleInfavorites.id === article.id,
      ) === -1;
    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }
  async deleArticleFromFavorities(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    const articleIndex =
      user?.favorites.findIndex(
        (articleInfavorites) => articleInfavorites.id === article.id,
      ) ?? -1;
    if (articleIndex >= 0 && user) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }
}
