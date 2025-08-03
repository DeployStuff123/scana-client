import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import dashboardEN from './locales/en/dashboard.json';
import loginEN from './locales/en/login.json';
import redirectLinksEN from './locales/en/redirectLinks.json';
import followUpEN from './locales/en/follow_up.json';

import dashboardES from './locales/es/dashboard.json';
import loginES from './locales/es/login.json';
import redirectLinksES from './locales/es/redirectLinks.json';
import followUpES from './locales/es/follow_up.json';
import settingEN from './locales/en/setting.json';
import settingES from './locales/es/setting.json';
import redirectLinkDetailsEN from './locales/en/redirectLinkDetails.json';
import redirectLinkDetailsES from './locales/es/redirectLinkDetails.json';
import commonEN from './locales/en/common.json';
import commonES from './locales/es/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    ns: ['dashboard', 'login', 'redirectLinks', 'followUp', 'setting', 'redirectLinkDetails', 'common'],
    defaultNS: 'dashboard',
    resources: {
      en: {
        dashboard: dashboardEN,
        login: loginEN,
        redirectLinks: redirectLinksEN,
        redirectLinkDetails: redirectLinkDetailsEN,
        followUp: followUpEN,
        setting: settingEN,
        common: commonEN,
      },
      es: {
        dashboard: dashboardES,
        login: loginES,
        redirectLinks: redirectLinksES,
        redirectLinkDetails: redirectLinkDetailsES,
        followUp: followUpES,
        setting: settingES,
        common: commonES,
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

