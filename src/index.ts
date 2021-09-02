import 'dotenv/config';
import db, { init as initDb } from '@src/config/database.config';
import { init as initCache } from '@src/config/cache.config';
import { register } from '@src/resources/register';
import '@src/services/i18next';
import '@src/services/mail';
import '@src/config/ws.config';
import '@src/ws';
import app, { init as initServer } from '@src/config/app.config';

import ApiRoutes from '@src/routes';
import localeInspector from './http/middlewares/locale-inspector.middleware';
import { handleError } from './http/error-handlers/handler';

app.use('/api', localeInspector, ApiRoutes);

app.use(handleError);

const init = async () => {
  await initDb();
  await initCache();
  await register();
  console.log(db.models);
  initServer();
};

init();
