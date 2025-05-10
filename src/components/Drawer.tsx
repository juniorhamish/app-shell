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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawer } from './DrawerProvider';
import { useUserInfo } from './UserInfoContextProvider';

export default function Drawer() {
  const { drawerOpen, toggleDrawer } = useDrawer();
  const { t } = useTranslation();
  const [avatarSource, setAvatarSource] = useState('avatar');
  const { firstName, lastName, gravatarEmailAddress, nickname, picture, saveUserInfoChanges } = useUserInfo();
  const [currentFirstName, setCurrentFirstName] = useState(firstName);
  const [currentLastName, setCurrentLastName] = useState(lastName);

  useEffect(() => {
    setCurrentFirstName(firstName);
  }, [firstName]);
  useEffect(() => {
    setCurrentLastName(lastName);
  }, [lastName]);
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
          <Avatar src={picture} sx={{ width: '64px', height: '64px' }} />
        </Box>
        <TextField
          label={t('profile.name-text-field')}
          value={currentFirstName ?? ''}
          onChange={(event) => setCurrentFirstName(event.target.value)}
          variant="outlined"
        />
        <TextField
          label="Last Name"
          value={currentLastName ?? ''}
          onChange={(event) => setCurrentLastName(event.target.value)}
          variant="outlined"
        />
        <TextField label={t('profile.nickname-text-field')} value={nickname ?? ''} variant="outlined" />
        <RadioGroup value={avatarSource} onChange={(e) => setAvatarSource(e.target.value)}>
          <FormControlLabel value="avatar" control={<Radio />} label={t('profile.avatar-option.avatar')} />
          <FormControlLabel value="gravatar" control={<Radio />} label={t('profile.avatar-option.gravatar')} />
        </RadioGroup>
        {avatarSource === 'avatar' && (
          <TextField label={t('profile.avatar-option.avatar-url')} value={picture ?? ''} variant="outlined" />
        )}
        {avatarSource === 'gravatar' && (
          <TextField
            label={t('profile.avatar-option.gravatar-email-address')}
            value={gravatarEmailAddress}
            variant="outlined"
          />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Button variant="outlined">{t('profile.cancel-edits')}</Button>
          <Button
            variant="contained"
            onClick={() => saveUserInfoChanges({ firstName: currentFirstName, lastName: currentLastName })}
          >
            {t('profile.save-edits')}
          </Button>
        </Box>
      </Stack>
    </MuiDrawer>
  );
}
