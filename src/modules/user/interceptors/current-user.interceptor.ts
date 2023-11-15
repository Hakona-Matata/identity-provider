import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from '../user.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private userService: UserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const userId = request.session.userId || null;

    if (!userId) throw new BadRequestException('You are not logged In!');

    const user = await this.userService.findById(+userId);

    if (!user) throw new NotFoundException('The user is not found!');

    request.currentUser = user;

    return next.handle();
  }
}
