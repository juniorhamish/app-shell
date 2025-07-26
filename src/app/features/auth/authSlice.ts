import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@auth0/auth0-react';
import type { RootState } from '../../store';

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user?: User;
}

const initialState: AuthState = {
  isLoading: false,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuthState: (state, action: PayloadAction<AuthState>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { updateAuthState } = authSlice.actions;
export default authSlice.reducer;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
