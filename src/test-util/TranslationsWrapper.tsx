import i18n from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { setLocale } from 'yup';
import translation from '../../public/locales/en/translation.json';

await i18n.use(initReactI18next).init(
  {
    debug: false,
    fallbackLng: 'en',
    lng: 'en',
    resources: { en: { translation } },
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

export default function TranslationsWrapper({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
