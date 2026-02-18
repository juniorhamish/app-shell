import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TranslationsWrapper from '../../../test-util/TranslationsWrapper';
import CreateHouseholdDialog from './CreateHouseholdDialog';

describe('CreateHouseholdDialog', () => {
  const defaultProps = {
    isCreating: false,
    onClose: vi.fn(),
    onCreate: vi.fn(),
    open: true,
  };

  const renderDialog = (props = {}) => {
    return render(
      <TranslationsWrapper>
        <CreateHouseholdDialog {...defaultProps} {...props} />
      </TranslationsWrapper>,
    );
  };

  it('renders the dialog when open', () => {
    renderDialog();
    expect(screen.getByRole('heading', { name: /create new household/i })).toBeVisible();
  });

  it('calls onClose when cancel is clicked', () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('validates that household name is required', async () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(await screen.findByText(/required/i)).toBeVisible();
    expect(defaultProps.onCreate).not.toHaveBeenCalled();
  });

  it('validates that household name cannot exceed 20 characters', async () => {
    renderDialog();
    const nameInput = screen.getByLabelText(/household name/i);
    fireEvent.change(nameInput, { target: { value: 'This name is definitely longer than twenty characters' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(await screen.findByText(/at most 20 characters/i)).toBeVisible();
    expect(defaultProps.onCreate).not.toHaveBeenCalled();
  });

  it('validates email addresses format', async () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText(/household name/i), { target: { value: 'My House' } });
    fireEvent.change(screen.getByLabelText(/invitations/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(await screen.findByText(/must be a valid email address/i)).toBeVisible();
    expect(defaultProps.onCreate).not.toHaveBeenCalled();
  });

  it('calls onCreate with correct arguments when form is valid', async () => {
    renderDialog();
    fireEvent.change(screen.getByLabelText(/household name/i), { target: { value: 'My House' } });
    fireEvent.change(screen.getByLabelText(/invitations/i), {
      target: { value: 'test@example.com, test2@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(defaultProps.onCreate).toHaveBeenCalledWith('My House', ['test@example.com', 'test2@example.com']);
  });

  it('shows loading state and disables inputs when isCreating is true', () => {
    renderDialog({ isCreating: true });
    expect(screen.getByRole('progressbar')).toBeVisible();
    expect(screen.getByLabelText(/household name/i)).toBeDisabled();
    expect(screen.getByLabelText(/invitations/i)).toBeDisabled();
  });

  it('shows conflict error when onCreate throws 409', async () => {
    const onCreate = vi.fn().mockRejectedValue({ status: 409 });
    renderDialog({ onCreate });

    fireEvent.change(screen.getByLabelText(/household name/i), { target: { value: 'Existing House' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(await screen.findByText(/already exists/i)).toBeVisible();
  });

  it('shows generic error when onCreate throws other error', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Random error'));
    renderDialog({ onCreate });

    fireEvent.change(screen.getByLabelText(/household name/i), { target: { value: 'New House' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(await screen.findByText(/failed to create household/i)).toBeVisible();
  });
});
