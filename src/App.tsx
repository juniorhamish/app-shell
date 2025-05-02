import { useAuth0 } from '@auth0/auth0-react';
import { lazy, Suspense, useState } from 'react';
import { Button, Container, Typography } from '@mui/material';
import logo from './assets/logo.png';

// eslint-disable-next-line import-x/no-unresolved
const SpiceTracker = lazy(() => import('spiceTracker/SpiceTracker'));

function App() {
  const { isLoading, isAuthenticated, user, logout, loginWithRedirect } =
    useAuth0();
  const [logoutFailed, setLogoutFailed] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Container maxWidth={'md'}>
      <Suspense fallback={<div>Loading...</div>}>
        <SpiceTracker />
        {loginFailed && <p>Login failed</p>}
        {logoutFailed && <p>Logout failed</p>}
        {isAuthenticated && user ? (
          <div>
            <img src={logo} alt={'logo'} width={'32px'} height={'32px'} />
            <img src={user.picture} alt={user.name} />
            <Typography variant={'h2'}>{user.name}</Typography>
            <Typography>{user.email}</Typography>
            <Button
              variant="contained"
              onClick={() => {
                logout({
                  logoutParams: { returnTo: window.location.origin },
                }).catch(() => setLogoutFailed(true));
                return undefined;
              }}
            >
              Log Out
            </Button>
          </div>
        ) : (
          <div>
            <Button
              variant="contained"
              onClick={() => {
                loginWithRedirect().catch(() => setLoginFailed(true));
                return undefined;
              }}
            >
              Log In
            </Button>
          </div>
        )}
      </Suspense>
    </Container>
  );
}

export default App;
