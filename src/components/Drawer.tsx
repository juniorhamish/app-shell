import {
  Avatar,
  Box,
  Button,
  Drawer as MuiDrawer,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawer } from './DrawerProvider';

export default function Drawer() {
  const { drawerOpen, toggleDrawer } = useDrawer();
  const { t } = useTranslation();
  const [avatarSource, setAvatarSource] = useState('avatar');
  const { user } = useAuth0();
  return (
    <MuiDrawer
      anchor="right"
      open={drawerOpen}
      onClose={toggleDrawer}
      slotProps={{ paper: { sx: { width: '384px' } } }}
    >
      <Stack sx={{ padding: '24px', gap: '24px' }}>
        <Stack sx={{ gap: '5px' }}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
            {t('profile.heading')}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: '300' }}>{t('profile.sub-heading')}</Typography>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar src={user?.picture} sx={{ width: '64px', height: '64px' }} />
        </Box>
        <TextField label={t('profile.name-text-field')} value={user?.name ?? ''} variant="outlined" />
        <TextField label={t('profile.nickname-text-field')} value={user?.nickname ?? ''} variant="outlined" />
        <RadioGroup value={avatarSource} onChange={(e) => setAvatarSource(e.target.value)}>
          <FormControlLabel value="avatar" control={<Radio />} label={t('profile.avatar-option.avatar')} />
          <FormControlLabel value="gravatar" control={<Radio />} label={t('profile.avatar-option.gravatar')} />
        </RadioGroup>
        {avatarSource === 'avatar' && (
          <TextField label={t('profile.avatar-option.avatar-url')} value={user?.picture ?? ''} variant="outlined" />
        )}
        {avatarSource === 'gravatar' && (
          <TextField
            label={t('profile.avatar-option.gravatar-email-address')}
            value={user?.email ?? ''}
            variant="outlined"
          />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Button variant="outlined">{t('profile.cancel-edits')}</Button>
          <Button variant="contained">{t('profile.save-edits')}</Button>
        </Box>
      </Stack>
    </MuiDrawer>
  );
}
