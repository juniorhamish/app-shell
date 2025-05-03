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
    <Container
      maxWidth="lg"
      disableGutters
      component="main"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <AppBar position="static">
        <Toolbar disableGutters>
          <Box
            sx={{ maxWidth: 60, verticalAlign: 'middle' }}
            component="img"
            src={logo}
            alt="Logo"
          />
          <Typography variant="h1" sx={{ fontSize: 18, fontWeight: 'bold' }}>
            DAJohnston
          </Typography>
          <Button sx={{ marginLeft: 'auto', marginRight: 5 }}>Sign in</Button>
        </Toolbar>
      </AppBar>
    </Container>
  );
}

export default App;
