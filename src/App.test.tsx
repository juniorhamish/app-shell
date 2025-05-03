import { render, screen, within } from '@testing-library/react';
import App from './App';

describe('App', () => {
  describe('header bar', () => {
    it('should have a logo', () => {
      render(<App />);

      expect(
        within(screen.getByRole('banner')).getByRole('img', { name: 'Logo' }),
      ).toBeVisible();
    });
    it('should have a title', () => {
      render(<App />);

      expect(
        within(screen.getByRole('banner')).getByRole('heading'),
      ).toHaveTextContent('DAJohnston');
    });
  });
});
