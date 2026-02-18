import { type Auth0ContextInterface, useAuth0 } from '@auth0/auth0-react';
import { screen, waitFor, within } from '@testing-library/react';
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
    expect(screen.getByLabelText(/Household Name/i)).toBeDisabled();
    expect(screen.getByLabelText(/Invitations/i)).toBeDisabled();

    expect(await screen.findByText('Loading Household')).toBeVisible();
  });

  it('renders households in alphabetical order', async () => {
    const unsortedHouseholds = [
      { id: 2, name: 'Zebra' },
      { id: 1, name: 'Apple' },
      { id: 3, name: 'Mango' },
    ];
    server.use(
      http.get('https://user-service.dajohnston.co.uk/api/v1/households', () => HttpResponse.json(unsortedHouseholds)),
    );

    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    await user.click(select);

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    // The "New Household" option is always at the end
    expect(options).toEqual(['Apple', 'Mango', 'Zebra', 'New Household']);
  });

  it('deletes a household and updates selection', async () => {
    server.use(
      http.delete('https://user-service.dajohnston.co.uk/api/v1/households/:id', () => {
        return new HttpResponse(null, { status: 204 });
      }),
      // Mock GET to return only the second household after deletion
      http.get('https://user-service.dajohnston.co.uk/api/v1/households', () => HttpResponse.json([households[1]]), {
        once: true,
      }),
    );

    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    await user.click(select);

    const deleteButton = screen.getByLabelText(/Delete household/i);
    await user.click(deleteButton);

    // After clicking delete, the menu might still be open or transitioning.
    // The select component's display should update.
    expect(await screen.findByText('Household 2', { selector: '.MuiSelect-select' })).toBeVisible();
    expect(localStorage.getItem('selectedHouseholdId')).toBe('2');
  });

  it('shows delete icon on keyboard focus and allows keyboard deletion', async () => {
    server.use(
      http.delete('https://user-service.dajohnston.co.uk/api/v1/households/:id', () => {
        return new HttpResponse(null, { status: 204 });
      }),
      http.get('https://user-service.dajohnston.co.uk/api/v1/households', () => HttpResponse.json([households[1]]), {
        once: true,
      }),
    );

    const { user } = renderWithProviders(<HouseholdSelector />);

    const select = await screen.findByRole('combobox');
    await user.click(select);
    await screen.findByRole('listbox');

    // Focus the first household item explicitly if needed, or use arrows
    // In MUI, opening the menu usually focuses the selected item.
    // Let's ensure we are on a household item.
    const options = screen.getAllByRole('option');
    options[0].focus();

    // Switch to the delete button using ArrowRight
    await user.keyboard('{ArrowRight}');

    const deleteButton = screen.getAllByLabelText(/Delete household/i)[0];
    expect(deleteButton).toHaveFocus();

    // Switch back to the household item using ArrowLeft
    await user.keyboard('{ArrowLeft}');
    expect(options[0]).toHaveFocus();

    // Switch back to the delete button and delete
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');

    expect(await screen.findByText('Household 2', { selector: '.MuiSelect-select' })).toBeVisible();
  });

  describe('Invitations', () => {
    const invitations = [
      {
        household_id: 100,
        household_name: 'New Household A',
        id: 10,
        invited_at: '2026-01-01T10:00:00Z',
      },
      {
        household_id: 101,
        household_name: 'New Household B',
        id: 11,
        invited_at: '2026-01-02T10:00:00Z',
      },
    ];

    beforeEach(() => {
      server.use(
        http.get('https://user-service.dajohnston.co.uk/api/v1/invitations', () => HttpResponse.json(invitations)),
      );
    });

    it('shows the invitation indicator with the correct count', async () => {
      renderWithProviders(<HouseholdSelector />);
      const badge = await screen.findByText('2');
      expect(badge).toBeVisible();
    });

    it('shows the list of invitations when clicking the indicator, sorted by date', async () => {
      const { user } = renderWithProviders(<HouseholdSelector />);
      const indicator = await screen.findByRole('button', { name: /Pending Invitations/i });
      await user.click(indicator);

      const menu = await screen.findByRole('menu');
      const listItems = within(menu).getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
      // Most recent first: New Household B (sentAt: Jan 2) then New Household A (sentAt: Jan 1)
      expect(within(listItems[0]).getByText('New Household B')).toBeVisible();
      expect(within(listItems[1]).getByText('New Household A')).toBeVisible();
    });

    it('accepts an invitation and selects the new household', async () => {
      const acceptedHousehold = { id: 101, name: 'New Household B' };
      let accepted = false;
      server.use(
        http.post('https://user-service.dajohnston.co.uk/api/v1/invitations/11/accept', () => {
          accepted = true;
          return HttpResponse.json(acceptedHousehold);
        }),
        // Mock GET to return the updated household list
        http.get('https://user-service.dajohnston.co.uk/api/v1/households', () =>
          HttpResponse.json(accepted ? [...households, acceptedHousehold] : households),
        ),
        // Mock GET to return only one invitation left after acceptance
        http.get('https://user-service.dajohnston.co.uk/api/v1/invitations', () =>
          HttpResponse.json(accepted ? [invitations[0]] : invitations),
        ),
      );

      const { user } = renderWithProviders(<HouseholdSelector />);
      const indicator = await screen.findByRole('button', { name: /Pending Invitations/i });
      await user.click(indicator);

      const menu = await screen.findByRole('menu');
      const itemB = within(menu).getByText('New Household B').closest('li')!;
      const acceptButton = within(itemB).getByLabelText(/Accept invitation/i);
      await user.click(acceptButton);

      // Should now show the new household as selected
      await waitFor(() => {
        expect(screen.getByText('New Household B', { selector: '.MuiSelect-select' })).toBeVisible();
      });
      expect(localStorage.getItem('selectedHouseholdId')).toBe('101');

      // Indicator should show 1
      expect(await screen.findByText('1')).toBeVisible();
    });

    it('rejects an invitation', async () => {
      let rejected = false;
      server.use(
        http.delete('https://user-service.dajohnston.co.uk/api/v1/invitations/11', () => {
          rejected = true;
          return new HttpResponse(null, { status: 204 });
        }),
        // Mock GET to return only one invitation left after rejection
        http.get('https://user-service.dajohnston.co.uk/api/v1/invitations', () =>
          HttpResponse.json(rejected ? [invitations[0]] : invitations),
        ),
      );

      const { user } = renderWithProviders(<HouseholdSelector />);
      const indicator = await screen.findByRole('button', { name: /Pending Invitations/i });
      await user.click(indicator);

      const menu = await screen.findByRole('menu');
      const listItems = within(menu).getAllByRole('listitem');
      const rejectButton = within(listItems[0]).getByLabelText(/Reject invitation/i); // First one is New Household B
      await user.click(rejectButton);

      // Indicator should show 1
      expect(await screen.findByText('1')).toBeVisible();
      // Menu should still show New Household A
      expect(screen.getByText('New Household A')).toBeVisible();
      expect(screen.queryByText('New Household B')).not.toBeInTheDocument();
    });

    it('shows loading indicator and disables other buttons when accepting an invitation', async () => {
      server.use(
        http.post('https://user-service.dajohnston.co.uk/api/v1/invitations/11/accept', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ id: 101, name: 'New Household B' });
        }),
        // Mock GET households to include the new one
        http.get('https://user-service.dajohnston.co.uk/api/v1/households', () =>
          HttpResponse.json([...households, { id: 101, name: 'New Household B' }]),
        ),
      );

      const { user } = renderWithProviders(<HouseholdSelector />);
      const indicator = await screen.findByRole('button', { name: /Pending Invitations/i });
      await user.click(indicator);

      const acceptButtons = screen.getAllByLabelText(/Accept invitation/i);

      expect(acceptButtons).toHaveLength(2);

      // Trigger accept on first invitation (ID 11, most recent)
      user.click(acceptButtons[0]);

      // Verify loading state
      await waitFor(() => expect(screen.getByRole('progressbar')).toBeVisible());

      // For ID 11, buttons should be replaced by progressbar.
      // So there should be only 1 set of buttons left (for ID 10).
      await waitFor(() => expect(screen.getAllByLabelText(/Accept invitation/i)).toHaveLength(1));

      const remainingAcceptButtons = screen.getAllByLabelText(/Accept invitation/i);
      const remainingRejectButtons = screen.getAllByLabelText(/Reject invitation/i);

      expect(remainingAcceptButtons[0]).toBeDisabled();
      expect(remainingRejectButtons[0]).toBeDisabled();

      // Wait for completion
      await screen.findByText('New Household B', { selector: '.MuiSelect-select' });
    });

    it('shows loading indicator and disables other buttons when rejecting an invitation', async () => {
      server.use(
        http.delete('https://user-service.dajohnston.co.uk/api/v1/invitations/11', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const { user } = renderWithProviders(<HouseholdSelector />);
      const indicator = await screen.findByRole('button', { name: /Pending Invitations/i });
      await user.click(indicator);

      const rejectButtons = screen.getAllByLabelText(/Reject invitation/i);

      // Trigger reject on first invitation (ID 11)
      user.click(rejectButtons[0]);

      // Verify loading state
      await waitFor(() => expect(screen.getByRole('progressbar')).toBeVisible());

      // For ID 11, buttons should be replaced by progressbar.
      await waitFor(() => expect(screen.getAllByLabelText(/Accept invitation/i)).toHaveLength(1));

      const remainingAcceptButtons = screen.getAllByLabelText(/Accept invitation/i);
      const remainingRejectButtons = screen.getAllByLabelText(/Reject invitation/i);

      expect(remainingAcceptButtons[0]).toBeDisabled();
      expect(remainingRejectButtons[0]).toBeDisabled();
    });
  });
});
