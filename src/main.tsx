import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={'dajohnston.eu.auth0.com'}
      clientId={'IgckwgORISVWwBUI7BQSD2AtIlL2onsX'}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
);
