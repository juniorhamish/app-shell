import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './i18n';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dajohnston.eu.auth0.com"
      clientId="IgckwgORISVWwBUI7BQSD2AtIlL2onsX"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Auth0Provider>
  </StrictMode>,
);
