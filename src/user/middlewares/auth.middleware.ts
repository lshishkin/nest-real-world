import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressRequestInterface, res: Response, next: () => void) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decode = verify(token, process.env.JWT_SECRET as string) as {
        id: number;
      };
      const user = await this.userService.findById(decode.id as number);
      req.user = user;
      next();
      // req.user = decode as any;
    } catch (err) {
      req.user = null;
      next();
    }
  }
}
