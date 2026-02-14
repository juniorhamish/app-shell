import { Add as AddIcon, Delete as DeleteIcon, House as HouseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
} from '@mui/material';
import { type MouseEvent, type SubmitEvent, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  useCreateHouseholdMutation,
  useDeleteHouseholdMutation,
  useGetHouseholdsQuery,
} from '../../services/households';
import { selectHousehold, selectSelectedHouseholdId } from './householdSlice';

export default function HouseholdSelector() {
  const { t } = useTranslation();
  const id = useId();
  const dispatch = useAppDispatch();
  const selectedHouseholdId = useAppSelector(selectSelectedHouseholdId);
  const { data: households, isSuccess, isFetching } = useGetHouseholdsQuery();
  const [createHousehold, { isLoading: isCreating }] = useCreateHouseholdMutation();
  const [deleteHousehold] = useDeleteHouseholdMutation();

  const sortedHouseholds = households ? [...households].sort((a, b) => a.name.localeCompare(b.name)) : [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [invitations, setInvitations] = useState('');
  const [nameError, setNameError] = useState('');
  const [invitationsError, setInvitationsError] = useState('');

  useEffect(() => {
    if (isSuccess && sortedHouseholds && sortedHouseholds.length > 0 && !isFetching) {
      const isValid = sortedHouseholds.some((h) => h.id === selectedHouseholdId);
      if (!isValid) {
        dispatch(selectHousehold(sortedHouseholds[0].id));
      }
    }
  }, [isSuccess, sortedHouseholds, selectedHouseholdId, dispatch, isFetching]);

  if (!isSuccess || !households) {
    return null;
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setNewHouseholdName('');
    setInvitations('');
    setNameError('');
    setInvitationsError('');
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleChange = (event: SelectChangeEvent) => {
    if (event.target.value === 'new') {
      handleOpenDialog();
      return;
    }
    dispatch(selectHousehold(Number(event.target.value)));
  };

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

    const emailList = invitations
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
      const result = await createHousehold({
        invitations: emailList.length > 0 ? emailList : undefined,
        name: newHouseholdName,
      }).unwrap();
      dispatch(selectHousehold(result.id));
      handleCloseDialog();
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        setNameError(t('household.create.error.conflict'));
      } else {
        setNameError(t('household.create.error.generic'));
      }
    }
  };

  const handleDelete = async (event: MouseEvent, householdId: number) => {
    event.stopPropagation();
    await deleteHousehold(householdId);
  };

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', ml: 2, mr: 2 }}>
      <HouseIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
      <Select
        id={id}
        inputProps={{ 'aria-label': t('household.label') }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 300,
            },
          },
        }}
        name="household"
        onChange={handleChange}
        renderValue={(selected) => {
          const household = sortedHouseholds.find((h) => String(h.id) === selected);
          return household ? household.name : '';
        }}
        size="small"
        sx={{
          '.MuiOutlinedInput-notchedOutline': { border: 0 },
          '.MuiSelect-icon': { color: 'white' },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': { border: 0 },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          color: 'white',
        }}
        value={String(selectedHouseholdId ?? '')}
      >
        {sortedHouseholds.map((household) => (
          <MenuItem
            key={household.id}
            sx={{
              '& .delete-button': {
                display: 'none',
              },
              '&:hover .delete-button': {
                display: 'inline-flex',
              },
              display: 'flex',
              justifyContent: 'space-between',
            }}
            value={String(household.id)}
          >
            {household.name}
            <IconButton
              aria-label={t('household.delete')}
              className="delete-button"
              onClick={(e) => handleDelete(e, household.id)}
              size="small"
              sx={{ ml: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
        <MenuItem
          sx={{
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            backgroundColor: 'background.paper',
            borderColor: 'divider',
            borderTop: households.length > 0 ? '1px solid' : 'none',
            bottom: 0,
            position: 'sticky',
            zIndex: 1,
          }}
          value="new"
        >
          <AddIcon sx={{ mr: 1 }} />
          {t('household.create.button')}
        </MenuItem>
      </Select>

      <Dialog fullWidth maxWidth="xs" onClose={handleCloseDialog} open={isDialogOpen}>
        <form onSubmit={handleSubmit}>
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
              onChange={(e) => setInvitations(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              value={invitations}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('household.create.cancel')}</Button>
            <Button disabled={isCreating} type="submit" variant="contained">
              {isCreating ? <CircularProgress size={24} /> : t('household.create.submit')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
