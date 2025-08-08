import { useAuth0 } from '@auth0/auth0-react';
import ExpandMoreSharpIcon from '@mui/icons-material/ExpandMoreSharp';
import Logout from '@mui/icons-material/Logout';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  AppBar as MuiAppBar,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../../../assets/logo-round.png';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useGetUserInfoQuery } from '../../services/user-info';
import { selectIsAuthenticated } from '../auth/authSlice';
import { toggleDrawer } from '../drawer/drawerSlice';

export default function AppBar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data, isSuccess } = useGetUserInfoQuery(undefined, { skip: !isAuthenticated });
  const { firstName, lastName, resolvedPicture } = data ?? {};
  const menuId = useId();
  const { loginWithRedirect, logout } = useAuth0();
  const [userSettingsMenuAnchor, setUserSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  return (
    <MuiAppBar position="static">
      <Toolbar>
        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
          <Box alt="" component="img" src={logo} sx={{ maxWidth: 60, verticalAlign: 'middle' }} />
          <Typography
            sx={{ display: { sm: 'block', xs: 'none' }, fontSize: '1.25rem', fontWeight: 'medium' }}
            variant="h1"
          >
            DAJohnston
          </Typography>
        </Box>
        {isSuccess && (
          <>
            <Tooltip enterDelay={500} enterNextDelay={500} leaveDelay={200} title={t('open-settings-tooltip')}>
              <IconButton
                aria-controls={menuId}
                aria-expanded={Boolean(userSettingsMenuAnchor)}
                aria-haspopup="menu"
                onClick={(event) => setUserSettingsMenuAnchor(event.currentTarget)}
                sx={{ borderRadius: 0, gap: 1 }}
              >
                <Avatar alt={t('avatar-alt-text')} src={resolvedPicture} />
                <Typography sx={{ display: { sm: 'block', xs: 'none' } }}>{`${firstName} ${lastName}`}</Typography>
                <ExpandMoreSharpIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={userSettingsMenuAnchor}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              keepMounted
              onClose={() => setUserSettingsMenuAnchor(null)}
              open={Boolean(userSettingsMenuAnchor)}
              slotProps={{
                list: {
                  'aria-label': t('user-menu'),
                  id: menuId,
                },
              }}
              sx={{ mt: '5px', width: '5000px' }}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
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
        )}
        {!isAuthenticated && (
          <Button color="inherit" onClick={() => loginWithRedirect()}>
            {t('sign-in')}
          </Button>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}
