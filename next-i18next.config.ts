import type { UserConfig } from 'next-i18next';
import path from 'path';

const config: UserConfig = {
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
  },
  localePath: path.resolve('./public/locales'),
  ns: ['common'],
  defaultNS: 'common',
};

export default config;
