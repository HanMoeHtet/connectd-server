import { UserDocument } from '@src/models/User';
import { Response } from 'express';

export interface AuthResponse<ResBody = any, Locals = { user: UserDocument }>
  extends Response<ResBody, Locals> {}
