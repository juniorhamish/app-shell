import { Backdrop, Box, CircularProgress, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AppBar from './features/app-bar/AppBar';
import Drawer from './features/drawer/Drawer';
import { UserInfoProvider } from '../context';
import useAuth0Listener from './features/auth/useAuth0Listener';
import { useAppSelector } from './hooks';
import { authState } from './features/auth/authSlice';

export default function App() {
  const { t } = useTranslation();
  useAuth0Listener();
  const { isLoading } = useAppSelector(authState);
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
