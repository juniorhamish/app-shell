import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import logo from './assets/logo-round.png';

function App() {
  return (
    <Container maxWidth="lg" disableGutters component="main">
      <AppBar position="static">
        <Toolbar>
          <Box
            sx={{ maxWidth: 60, verticalAlign: 'middle' }}
            component="img"
            src={logo}
            alt="Logo"
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            DAJohnston
          </Typography>
          <Button>Sign in</Button>
        </Toolbar>
      </AppBar>
    </Container>
  );
}

export default App;
