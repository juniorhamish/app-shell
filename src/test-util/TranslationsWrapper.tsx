import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import translation from '../../public/locales/en/translation.json';
import { UserInfoProvider } from '../context';

const queryClient = new QueryClient();

await i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: true,
  resources: { en: { translation } },
});

export default function TranslationsWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <UserInfoProvider>{children}</UserInfoProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
