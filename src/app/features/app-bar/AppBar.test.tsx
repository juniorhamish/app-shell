import { screen, within } from '@testing-library/react';
import renderWithProviders from '../../../test-util/test-utils';
import AppBar from './AppBar';

describe('App Bar', () => {
  it('should display the application name', () => {
    renderWithProviders(<AppBar />);

    expect(within(screen.getByRole('banner')).getByRole('heading')).toHaveTextContent('DAJohnston');
  });
});
