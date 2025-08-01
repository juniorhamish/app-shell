import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={setupStore()}>
      <Auth0Provider
        domain="dajohnston.eu.auth0.com"
        clientId="IgckwgORISVWwBUI7BQSD2AtIlL2onsX"
        authorizationParams={{
          redirect_uri: window.location.origin,
          scope: 'openid profile offline_access',
          responseType: 'token id_token',
          audience: 'https://user-service.dajohnston.co.uk',
        }}
        useRefreshTokens
        cacheLocation="localstorage"
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </Auth0Provider>
    </Provider>
  </StrictMode>,
);
