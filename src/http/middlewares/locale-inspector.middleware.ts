import { DEFAULT_LOCALE } from '@src/constants';
import i18next from '@src/services/i18next';
import { NextFunction, Request, Response } from 'express';

const localeInspector = (req: Request, res: Response, next: NextFunction) => {
  const locale =
    req.cookies.locale ||
    req.query.locale ||
    req.body.meta?.locale ||
    req.headers['accept-language'] ||
    DEFAULT_LOCALE;

  i18next.changeLanguage(locale);

  return next();
};

export default localeInspector;
