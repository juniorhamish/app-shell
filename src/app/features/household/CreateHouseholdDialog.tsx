import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { type SubmitEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateHouseholdDialogProps {
  isCreating: boolean;
  onClose: () => void;
  onCreate: (name: string, emails: string[]) => Promise<void>;
  open: boolean;
}

export default function CreateHouseholdDialog({ open, onClose, onCreate, isCreating }: CreateHouseholdDialogProps) {
  const { t } = useTranslation();
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [invitationEmails, setInvitationEmails] = useState('');
  const [nameError, setNameError] = useState('');
  const [invitationsError, setInvitationsError] = useState('');

  useEffect(() => {
    if (open) {
      setNewHouseholdName('');
      setInvitationEmails('');
      setNameError('');
      setInvitationsError('');
    }
  }, [open]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError('');
    setInvitationsError('');

    let hasError = false;

    if (!newHouseholdName) {
      setNameError(t('validation.required-field'));
      hasError = true;
    } else if (newHouseholdName.length > 20) {
      setNameError(t('validation.max-length', { count: 20 }));
      hasError = true;
    }

    const emailList = invitationEmails
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e !== '');
    const invalidEmails = emailList.filter((e) => !validateEmail(e));

    if (invalidEmails.length > 0) {
      setInvitationsError(t('validation.email'));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      await onCreate(newHouseholdName, emailList);
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        setNameError(t('household.create.error.conflict'));
      } else {
        setNameError(t('household.create.error.generic'));
      }
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={open}>
      <form noValidate onSubmit={handleSubmit}>
        <DialogTitle>{t('household.create.dialog-title')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            disabled={isCreating}
            error={!!nameError}
            fullWidth
            helperText={nameError}
            label={t('household.create.name-label')}
            margin="dense"
            onChange={(e) => setNewHouseholdName(e.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: 20 } }}
            value={newHouseholdName}
            variant="outlined"
          />
          <TextField
            disabled={isCreating}
            error={!!invitationsError}
            fullWidth
            helperText={invitationsError}
            label={t('household.create.invitations-label')}
            margin="dense"
            onChange={(e) => setInvitationEmails(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            value={invitationEmails}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('household.create.cancel')}</Button>
          <Button disabled={isCreating} type="submit" variant="contained">
            {isCreating ? <CircularProgress size={24} /> : t('household.create.submit')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
