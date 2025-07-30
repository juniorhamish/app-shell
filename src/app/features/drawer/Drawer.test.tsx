import { screen, waitFor } from '@testing-library/react';
import { Auth0ContextInterface } from '@auth0/auth0-react';
import { http, HttpResponse } from 'msw';
import renderWithProviders from '../../../test-util/test-utils';
import Drawer from './Drawer';
import { setAuth0Instance } from '../../../service/Auth0Instance';
import server from '../../../mocks/server';

describe('drawer', () => {
  beforeEach(() => {
    setAuth0Instance({} as Auth0ContextInterface);
  });
  it('should skip the user info request if the user is not yet authenticated', () => {
    renderWithProviders(<Drawer />, {
      preloadedState: { auth: { isAuthenticated: false, isLoading: false }, drawer: { open: true } },
    });

    expect(screen.getByRole('progressbar', { hidden: true })).not.toBeVisible();
  });
  it('should not render the dialog if the drawer is not open', () => {
    renderWithProviders(<Drawer />, { preloadedState: { drawer: { open: false } } });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('should render the dialog if the drawer is open', async () => {
    renderWithProviders(<Drawer />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false }, drawer: { open: true } },
    });

    expect(await screen.findByRole('dialog', { name: 'Edit Profile' })).toBeVisible();
  });
  it('should not render the dialog if the auth0 instance is not configured', async () => {
    setAuth0Instance(null);
    renderWithProviders(<Drawer />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false }, drawer: { open: true } },
    });

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });
  it('should set the auth header on the user info request', async () => {
    setAuth0Instance({ getAccessTokenSilently: () => Promise.resolve('MyToken') } as Auth0ContextInterface);
    let capturedHeaders: Headers | null = null;
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ success: true });
      }),
    );

    renderWithProviders(<Drawer />, {
      preloadedState: { auth: { isAuthenticated: true, isLoading: false }, drawer: { open: true } },
    });

    await waitFor(() => expect(capturedHeaders?.get('Authorization')).toBe('Bearer MyToken'));
  });
});
