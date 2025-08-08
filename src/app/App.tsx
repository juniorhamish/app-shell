import { useAuth0 } from '@auth0/auth0-react';
import { Backdrop, Box, CircularProgress, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { setAuth0Instance } from '../service/Auth0Instance';
import AppBar from './features/app-bar/AppBar';
import { selectIsLoading } from './features/auth/authSlice';
import useAuth0Listener from './features/auth/useAuth0Listener';
import Drawer from './features/drawer/Drawer';
import { useAppSelector } from './hooks';

export default function App() {
  const { t } = useTranslation();
  setAuth0Instance(useAuth0());
  useAuth0Listener();
  const isLoading = useAppSelector(selectIsLoading);
  return (
    <>
      <Backdrop aria-hidden={!isLoading} open={isLoading} sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}>
        <CircularProgress aria-label={t('authentication-loading')} color="inherit" />
      </Backdrop>
      <Container aria-busy={isLoading} disableGutters maxWidth={false}>
        <AppBar />
        <Box component="main" />
        <Drawer />
      </Container>
    </>
  );
}
