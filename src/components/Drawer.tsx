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
import { useDrawer } from './DrawerProvider';

export default function Drawer() {
  const { drawerOpen, toggleDrawer } = useDrawer();
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
            Edit Profile
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: '300' }}>
            Update your profile information below
          </Typography>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar src={user?.picture} sx={{ width: '64px', height: '64px' }} />
        </Box>
        <TextField label="Name" value={user?.name ?? ''} variant="outlined" />
        <TextField label="Nickname" value={user?.nickname ?? ''} variant="outlined" />
        <RadioGroup value={avatarSource} onChange={(e) => setAvatarSource(e.target.value)}>
          <FormControlLabel value="avatar" control={<Radio />} label="Avatar" />
          <FormControlLabel value="gravatar" control={<Radio />} label="Gravatar" />
        </RadioGroup>
        {avatarSource === 'avatar' && <TextField label="Avatar URL" value={user?.picture ?? ''} variant="outlined" />}
        {avatarSource === 'gravatar' && (
          <TextField label="Gravatar Email Address" value={user?.email ?? ''} variant="outlined" />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </Box>
      </Stack>
    </MuiDrawer>
  );
}
