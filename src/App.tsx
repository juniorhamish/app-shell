import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import { lazy, useState } from 'react';
import logo from './assets/logo.png';

// eslint-disable-next-line import-x/no-unresolved
const SpiceTracker = lazy(() => import('spiceTracker/SpiceTracker'));

function App() {
  const { isLoading, isAuthenticated, user, logout, loginWithRedirect } =
    useAuth0();
  const [logoutFailed, setLogoutFailed] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  if (loginFailed) {
    return <p>Login failed</p>;
  }
  if (logoutFailed) {
    return <p>Logout failed</p>;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated && user ? (
    <div>
      <SpiceTracker />
      <img src={logo} alt={'logo'} width={'32px'} height={'32px'} />
      <img src={user.picture} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button
        type="button"
        onClick={() => {
          logout({ logoutParams: { returnTo: window.location.origin } }).catch(
            () => setLogoutFailed(true),
          );
          return undefined;
        }}
      >
        Log Out
      </button>
    </div>
  ) : (
    <div>
      <button
        type="button"
        onClick={() => {
          loginWithRedirect().catch(() => setLoginFailed(true));
          return undefined;
        }}
      >
        Log In
      </button>
    </div>
  );
}

export default App;
