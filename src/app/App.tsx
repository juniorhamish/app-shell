import { Backdrop, Box, CircularProgress, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import AppBar from './features/app-bar/AppBar';
import Drawer from './features/drawer/Drawer';
import useAuth0Listener from './features/auth/useAuth0Listener';
import { useAppSelector } from './hooks';
import { selectIsLoading } from './features/auth/authSlice';
import { setAuth0Instance } from '../service/Auth0Instance';

export default function App() {
  const { t } = useTranslation();
  setAuth0Instance(useAuth0());
  useAuth0Listener();
  const isLoading = useAppSelector(selectIsLoading);
  return (
    <>
      <Backdrop open={isLoading} aria-hidden={!isLoading} sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}>
        <CircularProgress color="inherit" aria-label={t('authentication-loading')} />
      </Backdrop>
      <Container maxWidth={false} disableGutters aria-busy={isLoading}>
        <AppBar />
        <Box component="main" />
        <Drawer />
      </Container>
    </>
  );
}
