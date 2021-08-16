import { NextFunction, Request, Response } from 'express';

abstract class BaseError extends Error {
  status: number;

  constructor(status: number) {
    super();
    this.status = status;
  }

  abstract handle(): { status: number; json: {} };
}

export class RequestError extends BaseError {
  internalError: any;

  constructor(status: number, message: string, internalError: any = undefined) {
    super(status);
    this.message = message;
    this.internalError = internalError;
  }

  handle() {
    if (this.status >= 500 || this.internalError !== undefined) {
      console.error(this.internalError || this.stack);
    }

    return {
      status: this.status,
      json: {
        message: this.message,
      },
    };
  }
}

export class ValidationError extends BaseError {
  errors: {
    [key: string]: string[];
  };

  constructor(status: number, errors: {}) {
    super(status);
    this.errors = errors;
  }

  handle() {
    if (this.status >= 500) {
      console.error(this.stack);
    }

    return {
      status: this.status,
      json: {
        errors: this.errors,
      },
    };
  }
}

export const handleError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(err instanceof BaseError)) {
    next(err);
    return;
  }

  const { status, json } = err.handle();

  res.status(status).json(json);

  return;
};
