import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProfileResponseInterface } from './types/profileResponse.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileType } from './types/profile.type';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}
  buldProfileResponse(profile: ProfileType): ProfileResponseInterface {
    const { email: _, ...restProfile } = profile;
    return {
      profile: restProfile,
    };
  }
  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username: profileUsername },
    });
    if (!user)
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: user.id },
    });
    return { ...user, following: Boolean(follow) };
  }
  async followProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username: profileUsername },
    });
    if (!user)
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    if (currentUserId === user.id)
      throw new HttpException(
        'Follower cannot be the same as the profile',
        HttpStatus.BAD_REQUEST,
      );
    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: user.id },
    });
    if (!follow) {
      const newFollow = new FollowEntity();
      newFollow.followerId = currentUserId;
      newFollow.followingId = user.id;
      await this.followRepository.save(newFollow);
    }
    return { ...user, following: true };
  }
  async unFollowProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      where: { username: profileUsername },
    });
    if (!user)
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    if (currentUserId === user.id)
      throw new HttpException(
        'Follower cannot be the same as the profile',
        HttpStatus.BAD_REQUEST,
      );
    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: user.id },
    });
    if (follow) {
      await this.followRepository.delete(follow.id);
    }
    return { ...user, following: false };
  }
}
