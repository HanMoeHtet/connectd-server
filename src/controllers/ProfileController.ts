import { AuthResponse } from '@src/types/responses';
import {
  prepareProfileResponse,
  prepareBasicProfileResponse,
} from '@src/utils/profile';
import { Request } from 'express';

export const getProfile = (req: Request, res: AuthResponse) => {
  return res.json({
    data: prepareProfileResponse(res.locals.user),
  });
};

export const getBasicProfile = (req: Request, res: AuthResponse) => {
  return res.json({
    data: prepareBasicProfileResponse(res.locals.user),
  });
};
