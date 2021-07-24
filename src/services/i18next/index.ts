import { DEFAULT_LOCALE } from '@src/constants';
import i18next from 'i18next';

(async () => {
  await i18next.init({
    defaultNS: 'common',
    fallbackLng: DEFAULT_LOCALE,
    debug: process.env.NODE_ENV !== 'production',
    resources: {
      en: {
        common: await import('./en/common.json'),
      },
      mm: {
        common: await import('./mm/common.json'),
      },
    },
    interpolation: {
      format: function (value, format, lng) {
        if (format === 'capitalize') {
          return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
      },
    },
  });
})();

export default i18next;
