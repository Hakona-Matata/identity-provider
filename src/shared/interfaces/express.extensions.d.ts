import { User } from 'src/modules/user/user.entity';

declare module 'express' {
  interface Request {
    currentUser?: User;
  }
}
