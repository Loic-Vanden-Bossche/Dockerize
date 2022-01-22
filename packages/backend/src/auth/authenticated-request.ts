import { Request } from 'express';
import { User } from '../user/user.model';

export interface IAuthenticatedRequest extends Request {
  user: User;
}
