import {
  AppBar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import logo from './assets/logo-round.png';

function App() {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  return (
    <>
      <Backdrop open={isLoading} aria-hidden={!isLoading}>
        <CircularProgress
          color="inherit"
          aria-label="User authentication loading."
        />
      </Backdrop>
      <Container maxWidth="lg" disableGutters aria-busy>
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
            {!isAuthenticated && (
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
