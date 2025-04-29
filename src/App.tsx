import './App.css';
import logo from './assets/logo.png';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { isLoading, isAuthenticated, user, logout, loginWithRedirect } =
    useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return isAuthenticated && user ? (
    <div>
      <img src={logo} alt={'logo'} width={'32px'} height={'32px'} />
      <img src={user.picture} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        Log Out
      </button>
    </div>
  ) : (
    <div>
      <button onClick={() => loginWithRedirect()}>Log In</button>
    </div>
  );
}

export default App;
