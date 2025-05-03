import { render, screen, within } from '@testing-library/react';
import {
  Auth0ContextInterface,
  RedirectLoginOptions,
  useAuth0,
} from '@auth0/auth0-react';
import { userEvent } from '@testing-library/user-event';
import App from './App';

vi.mock('@auth0/auth0-react');

const banner = () => screen.getByRole('banner');

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useAuth0).mockReturnValue({} as Auth0ContextInterface);
  });
  describe('header bar', () => {
    it('should have a logo', () => {
      const { container } = render(<App />);

      expect(container).toMatchSnapshot();
    });
    it('should have a title', () => {
      render(<App />);

      expect(within(banner()).getByRole('heading')).toHaveTextContent(
        'DAJohnston',
      );
    });
    it('should have a Sign in button when the user is not currently logged in', () => {
      render(<App />);

      expect(
        within(banner()).getByRole('button', {
          name: 'Sign in',
        }),
      ).toBeVisible();
      expect(
        within(banner()).queryByTestId('PersonIcon'),
      ).not.toBeInTheDocument();
    });
    it('should not show the Sign in button when the user is logged in', () => {
      vi.mocked(useAuth0).mockReturnValueOnce({
        isAuthenticated: true,
      } as Auth0ContextInterface);

      render(<App />);

      expect(
        within(banner()).queryByRole('button', {
          name: 'Sign in',
        }),
      ).not.toBeInTheDocument();
    });
    it('should invoke the loginWithRedirect function when the sign in button is clicked', async () => {
      const user = userEvent.setup();
      const loginWithRedirect: (
        options?: RedirectLoginOptions,
      ) => Promise<void> = vi.fn();
      vi.mocked(useAuth0).mockReturnValueOnce({
        isAuthenticated: false,
        loginWithRedirect,
      } as Auth0ContextInterface);
      render(<App />);

      await user.click(
        within(banner()).getByRole('button', {
          name: 'Sign in',
        }),
      );

      expect(loginWithRedirect).toHaveBeenCalled();
    });
    it('should show a spinner while the authentication status is loading', () => {
      vi.mocked(useAuth0).mockReturnValueOnce({
        isLoading: true,
      } as Auth0ContextInterface);

      render(<App />);

      expect(screen.getByRole('progressbar')).toBeVisible();
    });
    it('should show the user avatar when the user is logged in', () => {
      vi.mocked(useAuth0).mockReturnValueOnce({
        isAuthenticated: true,
        user: { picture: 'https://me.com/avatar' },
      } as Auth0ContextInterface);

      render(<App />);

      expect(
        within(banner()).getByRole('img', {
          name: 'User avatar',
        }),
      ).toHaveAttribute('src', 'https://me.com/avatar');
    });
  });
});
