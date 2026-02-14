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

  it('renders "New Household" option and opens creation dialog', async () => {
    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    await user.click(select);

    const newOption = await screen.findByRole('option', { name: 'New Household' });
    await user.click(newOption);

    expect(await screen.findByRole('heading', { name: 'Create New Household' })).toBeVisible();
  });

  it('creates a new household and selects it', async () => {
    const newHousehold = { id: 3, name: 'My New Home' };
    server.use(
      http.post('https://user-service.dajohnston.co.uk/api/v1/households', async ({ request }) => {
        const body = (await request.json()) as { name: string; invitations?: string[] };
        if (body.name === 'My New Home') {
          return HttpResponse.json(newHousehold, { status: 201 });
        }
        return new HttpResponse(null, { status: 400 });
      }),
      // Re-mock GET to include the new household
      http.get('https://user-service.dajohnston.co.uk/api/v1/households', () =>
        HttpResponse.json([...households, newHousehold]),
      ),
    );

    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'New Household' }));

    const nameInput = screen.getByLabelText(/Household Name/i);
    await user.type(nameInput, 'My New Home');

    const submitButton = screen.getByRole('button', { name: 'Create' });
    await user.click(submitButton);

    expect(await screen.findByText('My New Home')).toBeVisible();
    expect(localStorage.getItem('selectedHouseholdId')).toBe('3');
  });

  it('shows error when household name is already taken', async () => {
    server.use(
      http.post('https://user-service.dajohnston.co.uk/api/v1/households', () => {
        return new HttpResponse(null, { status: 409 });
      }),
    );

    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'New Household' }));

    await user.type(screen.getByLabelText(/Household Name/i), 'Existing Household');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('A household with this name already exists')).toBeVisible();
  });

  it('validates email addresses format', async () => {
    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'New Household' }));

    await user.type(screen.getByLabelText(/Household Name/i), 'My House');
    await user.type(screen.getByLabelText(/Invitations/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Must be a valid email address')).toBeVisible();
  });

  it('shows loading state during household creation', async () => {
    const newHousehold = { id: 3, name: 'Loading Household' };
    server.use(
      http.post('https://user-service.dajohnston.co.uk/api/v1/households', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(newHousehold, { status: 201 });
      }),
      http.get('https://user-service.dajohnston.co.uk/api/v1/households', () =>
        HttpResponse.json([...households, newHousehold]),
      ),
    );

    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'New Household' }));

    await user.type(screen.getByLabelText(/Household Name/i), 'Loading Household');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(screen.getByRole('progressbar')).toBeVisible();

    expect(await screen.findByText('Loading Household')).toBeVisible();
  });
});
