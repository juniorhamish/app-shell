import { useAuth0 } from '@auth0/auth0-react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HouseIcon from '@mui/icons-material/House';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import { type MouseEvent, useEffect, useId, useState } from 'react';
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
import CreateHouseholdDialog from './CreateHouseholdDialog';
import { selectHousehold, selectSelectedHouseholdId } from './householdSlice';
import InvitationsMenu from './InvitationsMenu';

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleCreate = async (name: string, emails: string[]) => {
    const result = await createHousehold({
      invitations: emails.length > 0 ? emails : undefined,
      name,
    }).unwrap();
    dispatch(selectHousehold(result.id));
    handleCloseDialog();
  };

  const handleDelete = async (event: MouseEvent, householdId: number) => {
    event.stopPropagation();
    await deleteHousehold(householdId);
    if (householdId === selectedHouseholdId) {
      dispatch(selectHousehold(null));
    }
  };

  const handleAccept = async (invitationId: number) => {
    const newHousehold = await acceptInvitation(invitationId).unwrap();
    dispatch(selectHousehold(newHousehold.id));
  };

  const handleReject = async (invitationId: number) => {
    await rejectInvitation(invitationId).unwrap();
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

      {invitations && invitations.length > 0 && (
        <InvitationsMenu
          acceptingArgs={acceptingArgs as number}
          invitations={invitations}
          isProcessing={isInvitationProcessing}
          onAccept={handleAccept}
          onReject={handleReject}
          rejectingArgs={rejectingArgs as number}
        />
      )}

      <CreateHouseholdDialog
        isCreating={isCreating}
        onClose={handleCloseDialog}
        onCreate={handleCreate}
        open={isDialogOpen}
      />
    </Box>
  );
}
