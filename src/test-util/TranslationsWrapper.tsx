import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { ReactNode } from 'react';
import translation from '../../public/locales/en/translation.json';

await i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: true,
  resources: { en: { translation } },
});

export default function TranslationsWrapper({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
