import { ExtendedError } from 'socket.io/dist/namespace';
import { Socket } from 'socket.io';
import { UserDocument } from '@src/resources/user/user.model';

export { Socket } from 'socket.io';

export interface AuthSocket extends Socket {
  data: {
    user: UserDocument;
  };
}

export type NextFunction = (err?: ExtendedError) => void;
