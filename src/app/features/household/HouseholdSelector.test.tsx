import { type Auth0ContextInterface, useAuth0 } from '@auth0/auth0-react';
import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { vi } from 'vitest';
import server from '../../../mocks/server';
import renderWithProviders from '../../../test-util/test-utils';
import HouseholdSelector from './HouseholdSelector';

vi.mock('@auth0/auth0-react');

describe('HouseholdSelector', () => {
  const households = [
    { id: 1, name: 'Household 1' },
    { id: 2, name: 'Household 2' },
  ];

  beforeEach(() => {
    vi.mocked(useAuth0).mockReturnValue({ isAuthenticated: true } as Auth0ContextInterface);
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/households', () => HttpResponse.json(households)),
    );
    localStorage.clear();
  });

  it('renders nothing when no households are available', async () => {
    server.use(http.get('https://user-service.dajohnston.co.uk/api/v1/households', () => HttpResponse.json([])));
    renderWithProviders(<HouseholdSelector />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders household list and allows selection', async () => {
    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    expect(select).toBeVisible();

    // Default selection should be the first one if none in localStorage
    expect(await screen.findByText('Household 1')).toBeVisible();

    await user.click(select);
    await user.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Household 2' }));

    expect(await screen.findByText('Household 2')).toBeVisible();
    expect(localStorage.getItem('selectedHouseholdId')).toBe('2');
  });

  it('restores selection from localStorage', async () => {
    localStorage.setItem('selectedHouseholdId', '2');
    renderWithProviders(<HouseholdSelector />);

    expect(await screen.findByText('Household 2')).toBeVisible();
  });
});
