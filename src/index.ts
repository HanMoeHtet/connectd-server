import 'dotenv/config';
import { init as initDb } from '@src/config/database.config';
import '@src/services/i18next';
import '@src/services/mail';
import app, { init as initServer } from '@src/config/app.config';
import '@src/config/ws.config';

import ApiRoutes from '@src/routes';
import localeInspector from './http/middlewares/locale-inspector.middleware';
import { handleError } from './http/error-handlers/handler';

app.use('/api', localeInspector, ApiRoutes);

app.use(handleError);

const init = async () => {
  await initDb();
  initServer();
};

init();
