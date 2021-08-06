import { Request } from '@src/types/requests';
import { AuthResponse } from '@src/types/responses';
import {
  prepareProfileResponse,
  prepareBasicProfileResponse,
} from '@src/utils/profile';

export const getProfile = (req: Request, res: AuthResponse) => {
  return res.json({
    data: {
      user: prepareProfileResponse(res.locals.user),
    },
  });
};

export const getBasicProfile = (req: Request, res: AuthResponse) => {
  return res.json({
    data: {
      user: prepareBasicProfileResponse(res.locals.user),
    },
  });
};
