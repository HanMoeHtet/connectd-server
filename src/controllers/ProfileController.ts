import { AuthResponse } from '@src/types/responses';
import { prepareUserResponse } from '@src/utils/profile';
import { Request } from 'express';

export const show = (req: Request, res: AuthResponse) => {
  return res.json({
    data: prepareUserResponse(res.locals.user),
  });
};
