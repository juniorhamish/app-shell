import { Backdrop, Box, CircularProgress, Container } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation } from 'react-i18next';
import AppBar from './components/AppBar';
import Drawer from './components/Drawer';
import { DrawerProvider } from './components/DrawerProvider';
import { UserInfoProvider } from './components/UserInfoContextProvider';

function App() {
  const { t } = useTranslation();
  const { isLoading } = useAuth0();
  return (
    <UserInfoProvider>
      <Backdrop open={isLoading} aria-hidden={!isLoading} sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}>
        <CircularProgress color="inherit" aria-label={t('authentication-loading')} />
      </Backdrop>
      <DrawerProvider>
        <Container maxWidth={false} disableGutters aria-busy={isLoading}>
          <AppBar />
          <Box component="main" />
          <Drawer />
        </Container>
      </DrawerProvider>
    </UserInfoProvider>
  );
}

export default App;
