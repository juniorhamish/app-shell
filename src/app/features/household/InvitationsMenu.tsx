import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Invitation } from '../../../service/types';

interface InvitationsMenuProps {
  acceptingArgs?: number;
  invitations: Invitation[];
  isProcessing: boolean;
  onAccept: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  rejectingArgs?: number;
}

export default function InvitationsMenu({
  invitations,
  onAccept,
  onReject,
  isProcessing,
  acceptingArgs,
  rejectingArgs,
}: InvitationsMenuProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const sortedInvitations = [...invitations].sort(
    (a, b) => new Date(b.invited_at).getTime() - new Date(a.invited_at).getTime(),
  );

  return (
    <>
      <IconButton aria-label={t('household.invitations.title')} color="inherit" onClick={handleClick} sx={{ ml: 1 }}>
        <Badge badgeContent={sortedInvitations.length} color="error">
          <EmailIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)}>
        <Typography sx={{ px: 2, py: 1 }} tabIndex={-1} variant="h6">
          {t('household.invitations.title')}
        </Typography>
        <List sx={{ bgcolor: 'background.paper', maxWidth: 360, width: '100%' }}>
          {sortedInvitations.map((invitation) => (
            <ListItem
              key={invitation.id}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  {isProcessing && (acceptingArgs === invitation.id || rejectingArgs === invitation.id) ? (
                    <CircularProgress size={24} />
                  ) : (
                    <>
                      <IconButton
                        aria-label={t('household.invitations.accept')}
                        disabled={isProcessing}
                        edge="end"
                        onClick={async () => {
                          await onAccept(invitation.id);
                          handleClose();
                        }}
                        sx={{ color: 'success.main' }}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        aria-label={t('household.invitations.reject')}
                        disabled={isProcessing}
                        edge="end"
                        onClick={async () => {
                          await onReject(invitation.id);
                          if (sortedInvitations.length === 1) {
                            handleClose();
                          }
                        }}
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
  );
}
