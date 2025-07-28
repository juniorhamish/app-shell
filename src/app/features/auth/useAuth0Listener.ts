import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useMemo } from 'react';
import { useAppDispatch } from '../../hooks';
import { AuthState, updateAuthState } from './authSlice';

export default function useAuth0Listener(): AuthState {
  const { isLoading, isAuthenticated } = useAuth0();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(updateAuthState({ isLoading, isAuthenticated }));
  }, [isLoading, isAuthenticated, dispatch]);
  return useMemo(() => ({ isLoading, isAuthenticated }), [isAuthenticated, isLoading]);
}
