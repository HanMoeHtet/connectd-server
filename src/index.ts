import 'dotenv/config';
import { init as initDb } from '@src/config/database';
import '@src/services/i18next';
import '@src/services/mail';
import app, { init as initServer } from '@src/config/app';

import ApiRoutes from '@src/routes';
import localeInspector from './middlewares/LocaleInspector';
import { handleError } from './error_handlers/handler';

app.use('/api', localeInspector, ApiRoutes);

app.use(handleError);

const init = async () => {
  await initDb();
  initServer();
};

init();
