import { render, screen, within } from '@testing-library/react';
import App from './App';

describe('App', () => {
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
  });
});
