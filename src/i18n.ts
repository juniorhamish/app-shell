import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { setLocale } from 'yup';

await i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      debug: true,
      detection: {
        order: ['querystring', 'navigator', 'localStorage'],
      },
      fallbackLng: 'en',
      load: 'languageOnly',
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
