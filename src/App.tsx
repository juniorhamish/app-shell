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
    <Container maxWidth="lg" disableGutters>
      <AppBar position="static">
        <Toolbar>
          <Box
            sx={{ maxWidth: 60, verticalAlign: 'middle' }}
            component="img"
            src={logo}
            alt="Logo for DAJohnston"
          />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            DAJohnston
          </Typography>
          <Button>Sign in</Button>
        </Toolbar>
      </AppBar>
      <Box component="main" />
    </Container>
  );
}

export default App;
