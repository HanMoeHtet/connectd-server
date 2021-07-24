import 'dotenv/config';
import '@src/config/database';
import '@src/services/i18next';
import '@src/services/mail';
import app from '@src/config/app';

import ApiRoutes from '@src/routes';
import LocaleInspector from './middlewares/LocaleInspector';

app.use('/api', LocaleInspector, ApiRoutes);

export default app;
