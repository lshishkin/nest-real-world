import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import * as userResponseInterface from './types/userResponse.interface';
import { LoginUserDto } from './dto/login.dto';
import type { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { UserType } from './types/user.type';
import { User } from './decorators/user.decorator';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('users')
  @UsePipes(new BackendValidationPipe())
  async createUser(
    @Body('user') creteUserDTO: CreateUserDto,
  ): Promise<userResponseInterface.UserResponseInterface> {
    const user = await this.userService.createUser(creteUserDTO);
    return this.userService.buildUserResponse(user);
  }
  @Post('users/login')
  @UsePipes(new BackendValidationPipe())
  async login(
    @Body('user') logineUserDTO: LoginUserDto,
  ): Promise<userResponseInterface.UserResponseInterface> {
    const user = await this.userService.login(logineUserDTO);
    return this.userService.buildUserResponse(user);
  }
  @Get('user')
  @UseGuards(AuthGuard)
  currentUser(
    @Req() request: ExpressRequestInterface,
  ): userResponseInterface.UserResponseInterface {
    return this.userService.buildUserResponse(request.user as UserType);
  }
  @Put('user')
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async updateUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<userResponseInterface.UserResponseInterface> {
    const user = await this.userService.updateUser(
      currentUserId,
      updateUserDto,
    );
    return this.userService.buildUserResponse(user);
  }
}
