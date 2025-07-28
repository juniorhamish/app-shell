import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { setLocale } from 'yup';

await i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      load: 'languageOnly',
      fallbackLng: 'en',
      debug: true,
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['querystring', 'navigator', 'localStorage'],
      },
    },
    (_, t) => {
      setLocale({
        mixed: {
          required: t('validation.required-field'),
        },
        string: {
          email: t('validation.email'),
          url: t('validation.url'),
        },
      });
    },
  );
