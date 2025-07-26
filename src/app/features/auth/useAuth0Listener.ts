import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useAppDispatch } from '../../hooks';
import { updateAuthState } from './authSlice';

export default function useAuth0Listener() {
  const { isLoading, isAuthenticated, user } = useAuth0();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(updateAuthState({ isLoading, isAuthenticated, user }));
  }, [isLoading, isAuthenticated, user, dispatch]);
  return { isLoading, isAuthenticated, user };
}
