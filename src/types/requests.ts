import { UserDocument } from '@src/resources/user/user.model';
import * as core from 'express-serve-static-core';

export interface Request<
  T extends {
    params?: core.ParamsDictionary;
    resBody?: any;
    reqBody?: any;
    query?: core.Query;
    locals?: Record<string, any>;
  } = {}
> extends core.Request<
    T['params'],
    T['resBody'],
    T['reqBody'],
    T['query'],
    T['locals'] extends Record<string, any> ? T['locals'] : Record<string, any>
  > {}
