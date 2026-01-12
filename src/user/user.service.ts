import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserType } from './types/user.type';
import { LoginUserDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(creteUserDTO: CreateUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {},
    };
    const userByEmail = await this.userRepository.findOne({
      where: { email: creteUserDTO.email },
    });
    const userByUsername = await this.userRepository.findOne({
      where: { username: creteUserDTO.username },
    });
    if (userByEmail) {
      errorResponse.errors['email'] = 'Email already exists';
    }
    if (userByUsername) {
      errorResponse.errors['username'] = 'Username already exists';
    }
    if (userByEmail || userByUsername) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const newUser = new UserEntity();
    Object.assign(newUser, creteUserDTO);
    return await this.userRepository.save(newUser);
  }
  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id },
    }) as Promise<UserEntity>;
  }
  generateJWT(user: UserEntity): string {
    // JWT generation logic goes here
    return sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'test',
    );
  }
  buildUserResponse(user: UserType): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJWT(user),
      },
    };
  }
  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {
        'email or password': 'User with this email or password does not exist',
      },
    };
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: ['id', 'username', 'email', 'bio', 'image', 'password'],
    });

    if (!user) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    delete (user as any).password;
    return user;
  }
  async updateUser(
    currentUserId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    await this.userRepository.update(currentUserId, updateUserDto);
    return this.findById(currentUserId);
  }
}
