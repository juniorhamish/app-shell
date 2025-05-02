import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import logo from './assets/logo-round.png';

function App() {
  return (
    <Container
      maxWidth={'lg'}
      disableGutters
      component="main"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <AppBar position="static" enableColorOnDark>
        <Toolbar disableGutters>
          <Box
            sx={{ maxWidth: 60, verticalAlign: 'middle' }}
            component="img"
            src={logo}
            alt="Logo"
          />
          <Typography>Welcome</Typography>
        </Toolbar>
      </AppBar>
    </Container>
  );
}

export default App;
