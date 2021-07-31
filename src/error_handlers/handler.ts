import { NextFunction, Request, Response } from 'express';

export class RequestError extends Error {
  status: number;
  internalError: any;

  constructor(status: number, message: string, internalError: any = undefined) {
    super(message);
    this.status = status;
    this.internalError = internalError;
  }
}

export const handleError = (
  err: RequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Let express default handler handle the error
  // if it is not a RequestError
  if (!(err instanceof RequestError)) {
    next(err);
    return;
  }

  const { status, message, internalError } = err;

  if (status >= 500 || err.hasOwnProperty('internalError')) {
    console.error(internalError || err.stack);
  }

  res.status(status).json({
    message,
  });

  return;
};
