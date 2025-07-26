import { Backdrop, Box, CircularProgress, Container } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import { Component } from 'react';
import AppBar from '../components/AppBar';
import Drawer from './features/drawer/Drawer';
import { UserInfoProvider } from '../context';

class App extends Component {
  render() {
    const { t } = useTranslation();
    const { isLoading } = useAuth0();
    return (
      <UserInfoProvider>
        <Backdrop open={isLoading} aria-hidden={!isLoading} sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}>
          <CircularProgress color="inherit" aria-label={t('authentication-loading')} />
        </Backdrop>
        <Container maxWidth={false} disableGutters aria-busy={isLoading}>
          <AppBar />
          <Box component="main" />
          <Drawer />
        </Container>
      </UserInfoProvider>
    );
  }
}

export default App;
