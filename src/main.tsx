import { Auth0Provider } from '@auth0/auth0-react';
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './app/App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './i18n';
import { setupStore } from './app/store';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
createRoot(rootElement).render(
  <StrictMode>
    <Provider store={setupStore()}>
      <Auth0Provider
        authorizationParams={{
          audience: 'https://user-service.dajohnston.co.uk',
          redirect_uri: globalThis.location.origin,
          responseType: 'token id_token',
          scope: 'openid profile offline_access email',
        }}
        cacheLocation="localstorage"
        clientId="IgckwgORISVWwBUI7BQSD2AtIlL2onsX"
        domain="dajohnston.eu.auth0.com"
        useRefreshTokens
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </Auth0Provider>
    </Provider>
  </StrictMode>,
);
