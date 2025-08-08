import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
};

export const authSlice = createSlice({
  initialState,
  name: 'auth',
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
