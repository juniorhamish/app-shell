import {
  AppBar,
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import logo from './assets/logo-round.png';

function App() {
  const { isAuthenticated, loginWithRedirect, logout, isLoading, user } =
    useAuth0();
  const [userSettingsMenuAnchor, setUserSettingsMenuAnchor] =
    useState<null | HTMLElement>(null);
  return (
    <>
      <Backdrop
        open={isLoading}
        aria-hidden={!isLoading}
        sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}
      >
        <CircularProgress
          color="inherit"
          aria-label="User authentication loading."
        />
      </Backdrop>
      <Container maxWidth="lg" disableGutters aria-busy={isLoading}>
        <AppBar position="static">
          <Toolbar>
            <Box
              sx={{ maxWidth: 60, verticalAlign: 'middle' }}
              component="img"
              src={logo}
              alt=""
            />
            <Typography
              variant="h1"
              sx={{ flexGrow: 1, fontWeight: 'medium', fontSize: '1.25rem' }}
            >
              DAJohnston
            </Typography>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton
                    onClick={(event) =>
                      setUserSettingsMenuAnchor(event.currentTarget)
                    }
                    sx={{ p: 0 }}
                  >
                    <Avatar alt="User avatar" src={user?.picture} />
                  </IconButton>
                </Tooltip>
                <Menu
                  slotProps={{
                    list: {
                      'aria-label': 'User menu',
                    },
                  }}
                  sx={{ mt: '5px' }}
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
                    key="Sign out"
                    onClick={async () => {
                      setUserSettingsMenuAnchor(null);
                      await logout();
                    }}
                  >
                    <Typography sx={{ textAlign: 'center' }}>
                      Sign out
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button onClick={() => loginWithRedirect()}>Sign in</Button>
            )}
          </Toolbar>
        </AppBar>
        <Box component="main" />
      </Container>
    </>
  );
}

export default App;
