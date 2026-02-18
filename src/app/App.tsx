import { useAuth0 } from '@auth0/auth0-react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { useTranslation } from 'react-i18next';
import { setAuth0Instance } from '../service/Auth0Instance';
import AppBar from './features/app-bar/AppBar';
import { selectIsLoading } from './features/auth/authSlice';
import useAuth0Listener from './features/auth/useAuth0Listener';
import Drawer from './features/drawer/Drawer';
import { useAppSelector } from './hooks';
import SpiceTrackerRemote from './remotes/SpiceTrackerRemote.tsx';

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
        <Box component="main">
          <SpiceTrackerRemote />
        </Box>
        <Drawer />
      </Container>
    </>
  );
}
