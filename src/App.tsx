import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import logo from './assets/logo-round.png';

function App() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  return (
    <Container maxWidth="lg" disableGutters>
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
  );
}

export default App;
