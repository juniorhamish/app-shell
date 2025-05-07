import {
  AppBar as MuiAppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreSharpIcon from '@mui/icons-material/ExpandMoreSharp';
import Logout from '@mui/icons-material/Logout';
import logo from '../assets/logo-round.png';
import { useDrawer } from './DrawerProvider';

export default function AppBar() {
  const { t } = useTranslation();
  const menuId = useId();
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const [userSettingsMenuAnchor, setUserSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const { toggleDrawer } = useDrawer();
  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Box sx={{ maxWidth: 60, verticalAlign: 'middle' }} component="img" src={logo} alt="" />
        <Typography variant="h1" sx={{ flexGrow: 1, fontWeight: 'medium', fontSize: '1.25rem' }}>
          DAJohnston
        </Typography>
        {isAuthenticated ? (
          <>
            <Tooltip title={t('open-settings-tooltip')} enterDelay={500} enterNextDelay={500} leaveDelay={200}>
              <IconButton
                aria-haspopup="menu"
                aria-controls={menuId}
                aria-expanded={Boolean(userSettingsMenuAnchor)}
                onClick={(event) => setUserSettingsMenuAnchor(event.currentTarget)}
                sx={{ gap: 1, borderRadius: 0 }}
              >
                <Avatar alt={t('avatar-alt-text')} src={user?.picture} />
                <Typography>{user?.name}</Typography>
                <ExpandMoreSharpIcon />
              </IconButton>
            </Tooltip>
            <Menu
              slotProps={{
                list: {
                  'aria-label': t('user-menu'),
                  id: menuId,
                },
              }}
              sx={{ mt: '5px', width: '5000px' }}
              open={Boolean(userSettingsMenuAnchor)}
              onClose={() => setUserSettingsMenuAnchor(null)}
              anchorEl={userSettingsMenuAnchor}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                key="my-profile"
                onClick={async () => {
                  setUserSettingsMenuAnchor(null);
                  toggleDrawer();
                }}
              >
                <Typography sx={{ textAlign: 'center' }}>{t('profile-settings')}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                key="sign-out"
                onClick={async () => {
                  setUserSettingsMenuAnchor(null);
                  await logout();
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <Typography sx={{ textAlign: 'center' }}>{t('sign-out')}</Typography>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button onClick={() => loginWithRedirect()} color="inherit">
            {t('sign-in')}
          </Button>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}
