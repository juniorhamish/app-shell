import { render, screen, within } from '@testing-library/react';
import {
  Auth0ContextInterface,
  RedirectLoginOptions,
  useAuth0,
} from '@auth0/auth0-react';
import { userEvent } from '@testing-library/user-event';
import App from './App';

vi.mock('@auth0/auth0-react');

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

      expect(
        within(screen.getByRole('banner')).getByRole('heading'),
      ).toHaveTextContent('DAJohnston');
    });
    it('should have a Sign in button when the user is not currently logged in', () => {
      render(<App />);

      expect(
        within(screen.getByRole('banner')).getByRole('button', {
          name: 'Sign in',
        }),
      ).toBeVisible();
    });
    it('should not show the Sign in button when the user is logged in', () => {
      vi.mocked(useAuth0).mockReturnValueOnce({
        isAuthenticated: true,
      } as Auth0ContextInterface);

      render(<App />);

      expect(
        within(screen.getByRole('banner')).queryByRole('button', {
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
        within(screen.getByRole('banner')).getByRole('button', {
          name: 'Sign in',
        }),
      );

      expect(loginWithRedirect).toHaveBeenCalled();
    });
  });
});
