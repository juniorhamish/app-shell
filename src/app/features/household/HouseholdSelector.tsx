import { useAuth0 } from '@auth0/auth0-react';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import HouseIcon from '@mui/icons-material/House';
import type { SelectChangeEvent } from '@mui/material';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type MouseEvent, type SubmitEvent, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  useCreateHouseholdMutation,
  useDeleteHouseholdMutation,
  useGetHouseholdsQuery,
} from '../../services/households';
import {
  useAcceptInvitationMutation,
  useGetInvitationsQuery,
  useRejectInvitationMutation,
} from '../../services/invitations';
import { selectHousehold, selectSelectedHouseholdId } from './householdSlice';

export default function HouseholdSelector() {
  const { t } = useTranslation();
  const id = useId();
  const { user } = useAuth0();
  const dispatch = useAppDispatch();
  const selectedHouseholdId = useAppSelector(selectSelectedHouseholdId);
  const { data: households, isSuccess, isFetching } = useGetHouseholdsQuery();

  const userId = user?.sub;
  const localStorageKey = userId ? `selectedHouseholdId_${userId}` : null;

  const [createHousehold, { isLoading: isCreating }] = useCreateHouseholdMutation();
  const [deleteHousehold] = useDeleteHouseholdMutation();
  const { data: invitations } = useGetInvitationsQuery();
  const [acceptInvitation, { isLoading: isAccepting, originalArgs: acceptingArgs }] = useAcceptInvitationMutation();
  const [rejectInvitation, { isLoading: isRejecting, originalArgs: rejectingArgs }] = useRejectInvitationMutation();

  const isInvitationProcessing = isAccepting || isRejecting;

  const sortedHouseholds = households ? [...households].sort((a, b) => a.name.localeCompare(b.name)) : [];
  const sortedInvitations = invitations
    ? [...invitations].sort((a, b) => new Date(b.invited_at).getTime() - new Date(a.invited_at).getTime())
    : [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invitationsAnchorEl, setInvitationsAnchorEl] = useState<null | HTMLElement>(null);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [invitationEmails, setInvitationEmails] = useState('');
  const [nameError, setNameError] = useState('');
  const [invitationsError, setInvitationsError] = useState('');

  useEffect(() => {
    if (localStorageKey && selectedHouseholdId !== null) {
      localStorage.setItem(localStorageKey, String(selectedHouseholdId));
    }
  }, [localStorageKey, selectedHouseholdId]);

  useEffect(() => {
    if (isSuccess && sortedHouseholds && sortedHouseholds.length > 0 && !isFetching) {
      const isValid = sortedHouseholds.some((h) => h.id === selectedHouseholdId);

      if (selectedHouseholdId === null) {
        // 1. Try to load from localStorage
        const savedId = localStorageKey ? localStorage.getItem(localStorageKey) : null;
        if (savedId) {
          const numericSavedId = Number(savedId);
          if (sortedHouseholds.some((h) => h.id === numericSavedId)) {
            dispatch(selectHousehold(numericSavedId));
            return;
          }
        }
        // 2. If no saved preference or invalid, auto-select first one
        dispatch(selectHousehold(sortedHouseholds[0].id));
      } else if (!isValid) {
        // Selected ID is no longer valid (e.g. user changed or household deleted)
        dispatch(selectHousehold(sortedHouseholds[0].id));
      }
    }
  }, [isSuccess, sortedHouseholds, selectedHouseholdId, dispatch, isFetching, localStorageKey]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setNewHouseholdName('');
    setInvitationEmails('');
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
    if (householdId === selectedHouseholdId) {
      dispatch(selectHousehold(null));
    }
  };

  const handleInvitationsClick = (event: MouseEvent<HTMLElement>) => {
    setInvitationsAnchorEl(event.currentTarget);
  };

  const handleInvitationsClose = () => {
    setInvitationsAnchorEl(null);
  };

  const handleAccept = async (invitationId: number) => {
    const newHousehold = await acceptInvitation(invitationId).unwrap();
    dispatch(selectHousehold(newHousehold.id));
    handleInvitationsClose();
  };

  const handleReject = async (invitationId: number) => {
    await rejectInvitation(invitationId).unwrap();
    if (sortedInvitations.length === 1) {
      handleInvitationsClose();
    }
  };

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', ml: 2, mr: 2 }}>
      {isSuccess && households && (
        <>
          <HouseIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }} />
          <Select
            id={id}
            inputProps={{ 'aria-label': t('household.label') }}
            MenuProps={{
              MenuListProps: {
                sx: {
                  pb: 0,
                },
              },
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
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 0 2px white',
              },
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
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    const deleteButton = e.currentTarget.querySelector('.delete-button') as HTMLElement;
                    deleteButton?.focus();
                    e.preventDefault();
                  }
                }}
                sx={{
                  '& .delete-button': {
                    display: 'none',
                  },
                  '&:hover .delete-button, &.Mui-focused .delete-button, &.Mui-focusVisible .delete-button, &:focus-within .delete-button':
                    {
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
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      (e.currentTarget.closest('[role="option"]') as HTMLElement)?.focus();
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
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
        </>
      )}

      {sortedInvitations.length > 0 && (
        <>
          <IconButton
            aria-label={t('household.invitations.title')}
            color="inherit"
            onClick={handleInvitationsClick}
            sx={{ ml: 1 }}
          >
            <Badge badgeContent={sortedInvitations.length} color="error">
              <EmailIcon />
            </Badge>
          </IconButton>
          <Menu anchorEl={invitationsAnchorEl} onClose={handleInvitationsClose} open={Boolean(invitationsAnchorEl)}>
            <Typography sx={{ px: 2, py: 1 }} tabIndex={-1} variant="h6">
              {t('household.invitations.title')}
            </Typography>
            <List sx={{ bgcolor: 'background.paper', maxWidth: 360, width: '100%' }}>
              {sortedInvitations.map((invitation) => (
                <ListItem
                  key={invitation.id}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {isInvitationProcessing &&
                      (acceptingArgs === invitation.id || rejectingArgs === invitation.id) ? (
                        <CircularProgress size={24} />
                      ) : (
                        <>
                          <IconButton
                            aria-label={t('household.invitations.accept')}
                            disabled={isInvitationProcessing}
                            edge="end"
                            onClick={() => handleAccept(invitation.id)}
                            sx={{ color: 'success.main' }}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            aria-label={t('household.invitations.reject')}
                            disabled={isInvitationProcessing}
                            edge="end"
                            onClick={() => handleReject(invitation.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  }
                >
                  <ListItemText primary={invitation.household_name} />
                </ListItem>
              ))}
            </List>
          </Menu>
        </>
      )}

      <Dialog fullWidth maxWidth="xs" onClose={handleCloseDialog} open={isDialogOpen}>
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
