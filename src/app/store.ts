import { combineReducers, configureStore } from '@reduxjs/toolkit';
import drawerReducer from './features/drawer/drawerSlice';
import authReducer from './features/auth/authSlice';
import userReducer from './features/user/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  drawer: drawerReducer,
  user: userReducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
