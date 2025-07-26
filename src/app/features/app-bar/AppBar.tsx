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
import logo from '../../../assets/logo-round.png';
import { toggleDrawer } from '../drawer/drawerSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { selectIsAuthenticated, selectUser } from '../auth/authSlice';

export default function AppBar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const menuId = useId();
  const { loginWithRedirect, logout } = useAuth0();
  const [userSettingsMenuAnchor, setUserSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Box sx={{ maxWidth: 60, verticalAlign: 'middle' }} component="img" src={logo} alt="" />
          <Typography
            variant="h1"
            sx={{ fontWeight: 'medium', fontSize: '1.25rem', display: { xs: 'none', sm: 'block' } }}
          >
            DAJohnston
          </Typography>
        </Box>
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
                <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
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
                  dispatch(toggleDrawer());
                }}
              >
                <Typography sx={{ textAlign: 'center' }}>{t('profile.settings')}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                key="sign-out"
                onClick={async () => {
                  setUserSettingsMenuAnchor(null);
                  await logout({ logoutParams: { returnTo: window.location.origin } });
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
