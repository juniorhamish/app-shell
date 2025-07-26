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
      state.isLoading = action.payload.isLoading;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
    },
  },
});

export const { updateAuthState } = authSlice.actions;
export default authSlice.reducer;
export const authState = (state: RootState) => state.auth;
