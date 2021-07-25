import { User } from '@src/models/User';
import { Response } from 'express';

export interface AuthResponse<ResBody = any, Locals = { user: User }>
  extends Response<ResBody, Locals> {}
