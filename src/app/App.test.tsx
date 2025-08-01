import { screen } from '@testing-library/react';
import { Auth0ContextInterface, useAuth0 } from '@auth0/auth0-react';
import App from './App';
import renderWithProviders from '../test-util/test-utils';

vi.mock('@auth0/auth0-react');

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useAuth0).mockReturnValue({} as Auth0ContextInterface);
  });
  it('should show a spinner while the authentication status is loading', () => {
    vi.mocked(useAuth0).mockReturnValue({ isLoading: true } as Auth0ContextInterface);

    renderWithProviders(<App />);

    expect(screen.getByRole('progressbar')).toBeVisible();
  });
});
