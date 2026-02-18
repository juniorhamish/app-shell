import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import type { Invitation } from '../../../service/types';
import TranslationsWrapper from '../../../test-util/TranslationsWrapper';
import InvitationsMenu from './InvitationsMenu';

const invitations: Invitation[] = [
  {
    household_id: 100,
    household_name: 'House A',
    id: 10,
    invited_at: '2026-01-01T10:00:00Z',
  },
  {
    household_id: 101,
    household_name: 'House B',
    id: 11,
    invited_at: '2026-01-02T10:00:00Z',
  },
];

describe('InvitationsMenu', () => {
  const defaultProps = {
    invitations,
    isProcessing: false,
    onAccept: vi.fn(),
    onReject: vi.fn(),
  };

  const renderMenu = (props = {}) => {
    return render(
      <TranslationsWrapper>
        <InvitationsMenu {...defaultProps} {...props} />
      </TranslationsWrapper>,
    );
  };

  it('renders indicator with correct count', () => {
    renderMenu();
    expect(screen.getByText('2')).toBeVisible();
  });

  it('shows the list of invitations when clicking the indicator, sorted by date', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /pending invitations/i }));

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    // Most recent first: House B (Jan 2) then House A (Jan 1)
    expect(within(listItems[0]).getByText('House B')).toBeVisible();
    expect(within(listItems[1]).getByText('House A')).toBeVisible();
  });

  it('calls onAccept when accept button is clicked', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /pending invitations/i }));

    const acceptButtons = screen.getAllByLabelText(/accept invitation/i);
    fireEvent.click(acceptButtons[0]); // House B

    expect(defaultProps.onAccept).toHaveBeenCalledWith(11);
  });

  it('calls onReject when reject button is clicked', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /pending invitations/i }));

    const rejectButtons = screen.getAllByLabelText(/reject invitation/i);
    fireEvent.click(rejectButtons[1]); // House A

    expect(defaultProps.onReject).toHaveBeenCalledWith(10);
  });

  it('shows loading indicator and disables buttons when isProcessing is true', () => {
    renderMenu({
      acceptingArgs: 11,
      isProcessing: true,
    });
    fireEvent.click(screen.getByRole('button', { name: /pending invitations/i }));

    expect(screen.getByRole('progressbar')).toBeVisible();
    // One set of buttons should be gone (replaced by progressbar)
    expect(screen.getAllByLabelText(/accept invitation/i)).toHaveLength(1);
    // Remaining buttons should be disabled
    expect(screen.getByLabelText(/accept invitation/i)).toBeDisabled();
    expect(screen.getByLabelText(/reject invitation/i)).toBeDisabled();
  });
});
