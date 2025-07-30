import { screen, within } from '@testing-library/react';
import { Auth0ContextInterface, useAuth0 } from '@auth0/auth0-react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import renderWithProviders from '../../../test-util/test-utils';
import App from '../../App';
import server from '../../../mocks/server';
import { AvatarImageSource } from '../../../service/types';

vi.mock('@auth0/auth0-react');

const { MANUAL, GRAVATAR } = AvatarImageSource;

const banner = () => screen.getByRole('banner');
const openSettingsButton = async () => within(banner()).findByRole('button', { name: 'Open settings' });
const userMenu = () => screen.getByRole('menu', { name: 'User menu' });
const userAvatar = async () => within(await openSettingsButton()).findByRole('img', { name: 'User avatar' });
const signInButton = () => within(banner()).getByRole('button', { name: 'Sign in' });

describe('App Bar', () => {
  beforeEach(() => {
    vi.mocked(useAuth0).mockReturnValue({} as Auth0ContextInterface);
  });
  it('should display the application name', () => {
    renderWithProviders(<App />);

    expect(within(banner()).getByRole('heading')).toHaveTextContent('DAJohnston');
  });
  it('should have a Sign in button when the user is not currently logged in', () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: false } as Auth0ContextInterface);
    renderWithProviders(<App />);

    expect(signInButton()).toBeVisible();
    expect(within(banner()).queryByTestId('PersonIcon')).not.toBeInTheDocument();
  });
  it('should not show the Sign in button when the user is logged in', () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);

    renderWithProviders(<App />);

    expect(within(banner()).queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
  });
  it('should invoke the loginWithRedirect function when the sign in button is clicked', async () => {
    const user = userEvent.setup();
    const loginWithRedirect: Auth0ContextInterface['loginWithRedirect'] = vi.fn();
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: false, loginWithRedirect } as Auth0ContextInterface);
    renderWithProviders(<App />);

    await user.click(signInButton());

    expect(loginWithRedirect).toHaveBeenCalled();
  });
  it('should show the user avatar when the user is logged in', async () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
        HttpResponse.json({
          avatarImageSource: MANUAL,
          picture: 'https://me.com/avatar',
        }),
      ),
    );

    renderWithProviders(<App />);
    expect(await userAvatar()).toHaveAttribute('src', 'https://me.com/avatar');
  });
  it('should generate the gravatar for the profile picture when configured', async () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
        HttpResponse.json({
          avatarImageSource: GRAVATAR,
          picture: 'david@test.com',
        }),
      ),
    );

    renderWithProviders(<App />);
    expect(await userAvatar()).toHaveAttribute(
      'src',
      'https://www.gravatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e',
    );
  });
  it('should show the user name in the settings button when the user is logged in', async () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () =>
        HttpResponse.json({
          firstName: 'David',
          lastName: 'Johnston',
        }),
      ),
    );

    renderWithProviders(<App />);

    expect(await openSettingsButton()).toHaveTextContent('David Johnston');
  });
  it('should close the menu when pressing escape', async () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
    const user = userEvent.setup();

    renderWithProviders(<App />);

    await user.click(await userAvatar());
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
  });
  it('should close the menu when clicking Sign out', async () => {
    const logout: Auth0ContextInterface['logout'] = vi.fn();
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true, logout } as Auth0ContextInterface);
    const user = userEvent.setup();

    renderWithProviders(<App />);

    await user.click(await userAvatar());
    await user.click(within(userMenu()).getByRole('menuitem', { name: 'Sign out' }));

    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
    expect(logout).toHaveBeenCalled();
  });
  it('should open the user settings panel when clicking Profile Settings', async () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
    const user = userEvent.setup();

    renderWithProviders(<App />);

    await user.click(await userAvatar());
    await user.click(within(userMenu()).getByRole('menuitem', { name: 'Profile Settings' }));

    expect(screen.getByRole('dialog', { name: 'Edit Profile' })).toBeVisible();
    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
  });
  it('should not show the user menu if the user info request has not yet succeeded', () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
    server.use(http.get('https://user-service.dajohnston.co.uk/api/v1/user-info', () => HttpResponse.error()));

    renderWithProviders(<App />);

    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
  });
  it('should show a tooltip when hovering over the user menu', async () => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true, isLoading: false } as Auth0ContextInterface);
    const user = userEvent.setup();

    renderWithProviders(<App />);

    await user.hover(await openSettingsButton());

    expect(await screen.findByRole('tooltip', { name: 'Open settings' })).toBeVisible();
  });
});
