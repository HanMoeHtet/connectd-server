import 'dotenv/config';
import '@src/config/database';
import '@src/services/i18next';
import '@src/services/mail';
import app, { init } from '@src/config/app';

import ApiRoutes from '@src/routes';
import localeInspector from './middlewares/LocaleInspector';

app.use('/api', localeInspector, ApiRoutes);

init();
