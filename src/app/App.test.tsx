import { screen, within } from '@testing-library/react';
import { Auth0ContextInterface, LogoutOptions, RedirectLoginOptions, useAuth0 } from '@auth0/auth0-react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import App from './App';
import renderWithProviders from '../test-util/test-utils';
import server from '../mocks/server';

vi.mock('@auth0/auth0-react');

const banner = () => screen.getByRole('banner');
const userMenu = () => screen.getByRole('menu', { name: 'User menu' });

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useAuth0).mockReturnValue({} as Auth0ContextInterface);
  });
  describe('header bar', () => {
    it('should have a logo', () => {
      const { container } = renderWithProviders(<App />);

      expect(container).toMatchSnapshot();
    });
    it('should have a title', () => {
      renderWithProviders(<App />);

      expect(within(banner()).getByRole('heading')).toHaveTextContent('DAJohnston');
    });
    it('should have a Sign in button when the user is not currently logged in', () => {
      vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: false } as Auth0ContextInterface);
      renderWithProviders(<App />);

      expect(within(banner()).getByRole('button', { name: 'Sign in' })).toBeVisible();
      expect(within(banner()).queryByTestId('PersonIcon')).not.toBeInTheDocument();
    });
    it('should not show the Sign in button when the user is logged in', () => {
      vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);

      renderWithProviders(<App />);

      expect(within(banner()).queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
    });
    it('should invoke the loginWithRedirect function when the sign in button is clicked', async () => {
      const user = userEvent.setup();
      const loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void> = vi.fn();
      vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: false, loginWithRedirect } as Auth0ContextInterface);
      renderWithProviders(<App />);

      await user.click(within(banner()).getByRole('button', { name: 'Sign in' }));

      expect(loginWithRedirect).toHaveBeenCalled();
    });
    it('should show a spinner while the authentication status is loading', () => {
      vi.mocked(useAuth0).mockReturnValue({ isLoading: true } as Auth0ContextInterface);

      renderWithProviders(<App />);

      expect(screen.getByRole('progressbar')).toBeVisible();
    });
    it('should show the user avatar when the user is logged in', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
      } as Auth0ContextInterface);
      server.use(
        http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
          HttpResponse.json({
            avatarImageSource: 'MANUAL',
            picture: 'https://me.com/avatar',
          }),
        ),
      );

      renderWithProviders(<App />);

      expect(
        within(await within(banner()).findByRole('button', { name: 'Open settings' })).getByRole('img', {
          name: 'User avatar',
        }),
      ).toHaveAttribute('src', 'https://me.com/avatar');
    });
    it('should show the user name in the settings button when the user is logged in', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
      } as Auth0ContextInterface);
      server.use(
        http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
          HttpResponse.json({
            firstName: 'David',
            lastName: 'Johnston',
          }),
        ),
      );

      renderWithProviders(<App />);

      const openSettingsButton = await within(banner()).findByRole('button', { name: 'Open settings' });
      expect(openSettingsButton).toHaveTextContent('David Johnston');
    });
    it('should close the menu when pressing escape', async () => {
      vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
      const user = userEvent.setup();

      renderWithProviders(<App />);

      await user.click(await within(banner()).findByRole('img', { name: 'User avatar' }));
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
    });
    it('should close the menu when clicking Sign out', async () => {
      const logout: (options?: LogoutOptions) => Promise<void> = vi.fn();
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        logout,
      } as Auth0ContextInterface);
      const user = userEvent.setup();

      renderWithProviders(<App />);

      await user.click(await within(banner()).findByRole('img', { name: 'User avatar' }));
      await user.click(within(userMenu()).getByRole('menuitem', { name: 'Sign out' }));

      expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
      expect(logout).toHaveBeenCalled();
    });
    it('should open the user settings panel when clicking Profile Settings', async () => {
      vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
      const user = userEvent.setup();

      renderWithProviders(<App />);

      await user.click(await within(banner()).findByRole('img', { name: 'User avatar' }));
      await user.click(within(userMenu()).getByRole('menuitem', { name: 'Profile Settings' }));

      expect(screen.getByText('Edit Profile')).toBeVisible();
      expect(screen.getByText('Update your profile information below')).toBeVisible();
    });
  });
});
