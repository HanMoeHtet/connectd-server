import { UserDocument } from '@src/resources/models/User';
import * as core from 'express-serve-static-core';

export interface Response<
  T extends {
    body?: any;
    locals?: Record<string, any>;
    statusCode?: number;
  } = {}
> extends core.Response<
    T['body'],
    T['locals'] extends Record<string, any> ? T['locals'] : Record<string, any>,
    T['statusCode'] extends number ? T['statusCode'] : number
  > {}

export interface AuthResponse
  extends Response<{
    locals: {
      user: UserDocument;
    };
  }> {}
